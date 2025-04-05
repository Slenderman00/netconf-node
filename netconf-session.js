const easyNetconf = require('./easynetconf-cjs');

module.exports = function(RED) {
    
    function netconf_session(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        let session = null;

        node.status({fill: "grey", shape: "ring", text: "waiting for config"});

        function storeSessionGlobally() {
            const globalContext = node.context().global;
            let netconfSessions = globalContext.get('netconfSessions') || {};
            netconfSessions[node.id] = session;
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
            try {
                session = new easyNetconf(config.host, config.port, config.username, config.password, config.privpath, config.pubpath);
                node.status({fill: "green", shape: "dot", text: "connected"});
                storeSessionGlobally();
            } catch (err) {
                node.error(`NETCONF Setup Error: ${err.message}`);
                node.status({fill: "red", shape: "dot", text: "setup error"});
            }
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

            session.close();
            session = null;

            storeSessionGlobally();
            done();
        });

    }
    RED.nodes.registerType("netconf session", netconf_session);
}
