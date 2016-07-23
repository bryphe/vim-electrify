"use strict";
const net = require("net");
const TcpSocketInstance_1 = require("./TcpSocketInstance");
class TcpServer {
    constructor() {
        this._serverToSocket = {};
    }
    start(sessionManager, port) {
        this._tcpServer = this._createTcpServer();
        this._tcpServer.listen(port, "127.0.0.1");
        this._sessionManager = sessionManager;
    }
    writeToSocket(serverName, data) {
        return this._serverToSocket[serverName].write(data);
    }
    _createTcpServer() {
        return net.createServer((tcpSocket) => {
            console.log("tcp: client connected");
            var socketInstance = new TcpSocketInstance_1.default(tcpSocket, this._sessionManager);
            socketInstance.on("connect", (session) => {
                this._serverToSocket[session.name] = tcpSocket;
            });
            socketInstance.on("end", (session) => {
                this._sessionManager.endSession(session.name);
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TcpServer;
