const easyNetconf = require('./easynetconf-cjs');

module.exports = function(RED) {
    
    function netconf_session(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        let session = null;
        let connectionInterval = null;

        node.status({fill: "grey", shape: "ring", text: "waiting for config"});

        function storeSessionGlobally() {
            const globalContext = node.context().global;
            let netconfSessions = globalContext.get('netconfSessions') || {};
            netconfSessions[node.id] = session;
            globalContext.set('netconfSessions', netconfSessions);
        }

        function deleteSessionGlobally() {
            const globalContext = node.context().global;
            let netconfSessions = globalContext.get('netconfSessions') || {};
            delete netconfSessions[node.id];
            globalContext.set('netconfSessions', netconfSessions);
        }

        function checkAndConnect() {
            if (!(config.host && config.port && config.username && (config.password || (config.privpath && config.pubpath)))) return;

            if (session != null) {
                if(session.connected) {
                    return;
                }   
            }

            node.status({fill: "yellow", shape: "dot", text: "connecting..."});

            session = new easyNetconf()

            session.async_connect(config.host, config.port, config.username, config.password, config.privpath, config.pubpath).then((result) => {
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
            if (connectionInterval) {
                clearInterval(connectionInterval);
                connectionInterval = null;
            }

            if (session.connected) {
                //session.close();
                session.connected = false
            }

            deleteSessionGlobally();
            done();
        });

    }
    RED.nodes.registerType("netconf session", netconf_session);
}
