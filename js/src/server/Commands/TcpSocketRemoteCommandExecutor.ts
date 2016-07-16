import Promise = require("bluebird");
import childProcess = require("child_process");
var os = require("os");

import TcpServer from "./../TcpServer";

/**
 * Implementation of IRemoteCommandExecutor that uses tcp sockes
 */
export default class TcpSocketRemoteCommandExecutor {
    private _tcpServer: TcpServer;

    constructor(tcpServer: TcpServer) {
        this._tcpServer = tcpServer;
    }

    public executeCommand(serverName: string, command: string): Promise<void> {
        this._tcpServer.writeToSocket(serverName, "call " + command + "\n");
        return Promise.resolve();
    }
}
