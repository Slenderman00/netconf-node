
# Red-Netconf

Adds the following nodes to node-red:
- netconf session
- netconf command



## Installation

Make sure to have yuma123 installed

Install red-netconf with npm

```bash
  npm install @lightside-instruments/red-netconf
```
    
## Usage/Examples

![nodes](https://raw.githubusercontent.com/Slenderman00/netconf-node/refs/heads/main/images/nodes.png)

Create a new session using the session node

![session node](https://github.com/Slenderman00/netconf-node/blob/main/images/session.png?raw=true)

Create a command node and select a session.
The command node parses [yangcli commands](https://yuma123.org/wiki/index.php/Yuma_yangcli_Manual#Command_Prompt) and performs the relevant action on the netconf server 

![command node](https://raw.githubusercontent.com/Slenderman00/netconf-node/refs/heads/main/images/commands.png)