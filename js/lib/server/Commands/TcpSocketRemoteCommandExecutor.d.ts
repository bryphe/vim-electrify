import Promise = require("bluebird");
import TcpServer from "./../TcpServer";
export default class TcpSocketRemoteCommandExecutor {
    private _tcpServer;
    constructor(tcpServer: TcpServer);
    executeCommand(serverName: string, command: string): Promise<void>;
}
