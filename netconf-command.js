module.exports = function(RED) {
    function NetconfCommandNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        let session = null;
        const sessionNodeId = config.sessionNode;
        
        node.on('input', function(msg) {
            const globalContext = node.context().global;
            const netconfSessions = globalContext.get('netconfSessions') || {};
            session = netconfSessions[sessionNodeId];
            
            if (!session) {
                node.error("NETCONF session not found", msg);
                node.status({fill: "red", shape: "ring", text: "no session"});
                return;
            } else {
                if(!session.connected) {
                    node.error("NETCONF session not connected", msg);
                    node.status({fill: "red", shape: "ring", text: "waiting for connection"});
                }
                node.status({fill: "green", shape: "ring", text: "session"});
            }

            const command = RED.util.evaluateNodeProperty(
                config.commandTemplate,
                'mustache',
                node,
                msg
            );

            let res = session.perform(command)

            msg.payload = res;
            msg.command = command;

            node.send(msg);
        });
        
        node.on('close', function(done) {
            session = null;
    
            done();
        });
    }


    
    RED.nodes.registerType("netconf yangcli", NetconfCommandNode);
}