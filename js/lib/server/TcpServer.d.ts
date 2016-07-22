import SessionManager from "./SessionManager";
export default class TcpServer {
    private _serverToSocket;
    private _sessionManager;
    private _tcpServer;
    start(sessionManager: SessionManager, port: number): void;
    writeToSocket(serverName: string, data: string): void;
    private _createTcpServer();
}
