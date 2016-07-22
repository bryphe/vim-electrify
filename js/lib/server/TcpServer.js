"use strict";
var net = require("net");
var TcpSocketInstance_1 = require("./TcpSocketInstance");
var TcpServer = (function () {
    function TcpServer() {
        this._serverToSocket = {};
    }
    TcpServer.prototype.start = function (sessionManager, port) {
        this._tcpServer = this._createTcpServer();
        this._tcpServer.listen(port, "127.0.0.1");
        this._sessionManager = sessionManager;
    };
    TcpServer.prototype.writeToSocket = function (serverName, data) {
        return this._serverToSocket[serverName].write(data);
    };
    TcpServer.prototype._createTcpServer = function () {
        var _this = this;
        return net.createServer(function (tcpSocket) {
            console.log("tcp: client connected");
            var socketInstance = new TcpSocketInstance_1.default(tcpSocket, _this._sessionManager);
            socketInstance.on("connect", function (session) {
                _this._serverToSocket[session.name] = tcpSocket;
            });
            socketInstance.on("end", function (session) {
                _this._sessionManager.endSession(session.name);
            });
        });
    };
    return TcpServer;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TcpServer;
