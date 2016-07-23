"use strict";
const Promise = require("bluebird");
var os = require("os");
class TcpSocketRemoteCommandExecutor {
    constructor(tcpServer) {
        this._tcpServer = tcpServer;
    }
    executeCommand(serverName, command) {
        this._tcpServer.writeToSocket(serverName, "call " + command + "\n");
        return Promise.resolve();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TcpSocketRemoteCommandExecutor;
