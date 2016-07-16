/**
 * The TcpServer is used for integration between vim <-> electron
 * On the Vim side, there is a python TCP client listening to these messages,
 * and pushing data to the server.
 */

import * as net from "net";
import SessionManager from "./SessionManager";
import Session from "./Session";
import TcpSocketInstance from "./TcpSocketInstance";

export default class TcpServer {
    private _serverToSocket = {};
    private _sessionManager: SessionManager;
    private _tcpServer: net.Server;

    public start(sessionManager: SessionManager, port: number): void {
        this._tcpServer = this._createTcpServer();
        this._tcpServer.listen(port, "127.0.0.1");
        this._sessionManager = sessionManager;
    }

    public writeToSocket(serverName: string, data: string): void {
        return this._serverToSocket[serverName].write(data);
    }

    private _createTcpServer(): net.Server {
        return net.createServer((tcpSocket) => {

            console.log("tcp: client connected");
            var socketInstance = new TcpSocketInstance(tcpSocket, this._sessionManager);

            socketInstance.on("connect", (session: Session) => {
                this._serverToSocket[session.name] = tcpSocket;
            });

            socketInstance.on("end", (session: Session)  => {
                this._sessionManager.endSession(session.name);
            });
        });
    }
}

