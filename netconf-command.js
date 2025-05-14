module.exports = function(RED) {
    function NetconfCommandNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        let session = null;
        const sessionNodeId = config.sessionNode;

        function parseCommand(commandTemplate, msg) {
            if (!commandTemplate) return '';
            return commandTemplate.replace(/\{\{([\w\.]+)\}\}/g, function(match, property) {
                let value = msg;
                const props = property.split('.');
                
                for (let i = 0; i < props.length; i++) {
                    if (value === null || value === undefined) {
                        return '';
                    }
                    value = value[props[i]];
                }
                
                return value !== undefined && value !== null ? value : '';
            });
        }
        
        node.on('input', function(msg) {
            const globalContext = node.context().global;
            const netconfSessions = globalContext.get('netconfSessions') || {};
            const netconfSessionStatus = globalContext.get('netconfSessionStatus') || {};
            
            if (netconfSessionStatus[sessionNodeId] && netconfSessionStatus[sessionNodeId].isShuttingDown) {
                node.error("NETCONF session is shutting down", msg);
                node.status({fill: "red", shape: "ring", text: "session closing"});
                return;
            }
            
            session = netconfSessions[sessionNodeId];
            
            if (!session) {
                node.error("NETCONF session not found", msg);
                node.status({fill: "red", shape: "ring", text: "no session"});
                return;
            } else {
                if(!session.connected) {
                    node.error("NETCONF session not connected", msg);
                    node.status({fill: "red", shape: "ring", text: "waiting for connection"});
                    return;
                }
                node.status({fill: "green", shape: "ring", text: "session"});
            }

            const command = parseCommand(config.commandTemplate, msg);

            try {
                let res = session.perform(command);
                msg.payload = res;
                msg.command = command;
                node.send(msg);
            } catch (err) {
                node.error(`Command execution error: ${err.message}`, msg);
                node.status({fill: "red", shape: "dot", text: "execution error"});
            }
        });
        
        node.on('close', function(done) {
            session = null;
            done();
        });
    }
    
    RED.nodes.registerType("netconf yangcli", NetconfCommandNode);
}