const easyNetconf = require('./easynetconf-cjs');

module.exports = function(RED) {
    
    function netconf_session(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let session = null;
        let connectionInterval = null;
        let isShuttingDown = false;

        node.status({fill: "grey", shape: "ring", text: "waiting for config"});

        function storeSessionGlobally() {
            const globalContext = node.context().global;
            let netconfSessions = globalContext.get('netconfSessions') || {};
            netconfSessions[node.id] = session;
            
            let netconfSessionStatus = globalContext.get('netconfSessionStatus') || {};
            netconfSessionStatus[node.id] = {
                isShuttingDown: isShuttingDown
            };
            
            globalContext.set('netconfSessions', netconfSessions);
            globalContext.set('netconfSessionStatus', netconfSessionStatus);
        }

        function deleteSessionGlobally() {
            const globalContext = node.context().global;
            let netconfSessions = globalContext.get('netconfSessions') || {};
            let netconfSessionStatus = globalContext.get('netconfSessionStatus') || {};
            
            delete netconfSessions[node.id];
            delete netconfSessionStatus[node.id];
            
            globalContext.set('netconfSessions', netconfSessions);
            globalContext.set('netconfSessionStatus', netconfSessionStatus);
        }

        function checkAndConnect() {
            if (isShuttingDown) return;
            
            if (!(config.host && config.port && config.username && (config.password || (config.privpath && config.pubpath)))) return;

            if (session != null) {
                if(session.connected) {
                    return;
                }   
            }

            node.status({fill: "yellow", shape: "dot", text: "connecting..."});

            session = new easyNetconf()

            session.async_connect(config.host, config.port, config.username, config.password, config.privpath, config.pubpath).then((result) => {
                if (isShuttingDown) {
                    if (session.connected) {
                        session.close();
                        session.connected = false;
                    }
                    return;
                }
                
                node.status({fill: "green", shape: "dot", text: "connected"});
                storeSessionGlobally();
            }).catch((err) => {
                node.error(`NETCONF Setup Error: ${err.message}`);
                node.status({fill: "red", shape: "dot", text: "setup error"});
            });
        }

        easyNetconf.ready().then(() => {
            connectionInterval = setInterval(checkAndConnect, 10000);
            checkAndConnect();
        });

        node.on('close', function(done) {
            isShuttingDown = true;
            storeSessionGlobally();
            
            if (connectionInterval) {
                clearInterval(connectionInterval);
                connectionInterval = null;
            }

            setTimeout(() => {
                if (session) {
                    try {
                        if (session.connected === true) {
                            session.close();
                        }
                    } catch (e) {
                        node.error(`Error during session close: ${e.message}`);
                    } finally {
                        if (session) {
                            session.connected = false;
                        }
                    }
                }
                
                deleteSessionGlobally();
                done();
            }, 100);
        });
    }
    RED.nodes.registerType("netconf session", netconf_session);
}