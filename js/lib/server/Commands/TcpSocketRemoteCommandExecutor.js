"use strict";
var Promise = require("bluebird");
var os = require("os");
var TcpSocketRemoteCommandExecutor = (function () {
    function TcpSocketRemoteCommandExecutor(tcpServer) {
        this._tcpServer = tcpServer;
    }
    TcpSocketRemoteCommandExecutor.prototype.executeCommand = function (serverName, command) {
        this._tcpServer.writeToSocket(serverName, "call " + command + "\n");
        return Promise.resolve();
    };
    return TcpSocketRemoteCommandExecutor;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TcpSocketRemoteCommandExecutor;
