
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

Create a yangcli node and select a session.
The yangcli node parses [yangcli commands](https://yuma123.org/wiki/index.php/Yuma_yangcli_Manual#Command_Prompt) and performs the relevant action on the netconf server 

![yangcli node](https://raw.githubusercontent.com/Slenderman00/netconf-node/refs/heads/main/images/commands.png)

## Authors

- [@slenderman00](https://github.com/Slenderman00)

## Contributing

Contributions are welcome! Please submit issues or pull requests for any improvements or bug fixes.

## Support

Please open a ticket on the GitHub page.