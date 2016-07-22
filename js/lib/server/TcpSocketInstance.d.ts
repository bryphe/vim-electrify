import * as net from "net";
import * as events from "events";
import SessionManager from "./SessionManager";
export default class TcpSocketInstance extends events.EventEmitter {
    private _tcpSocket;
    private _sessionManager;
    private _session;
    private _currentBuffer;
    constructor(tcpSocket: net.Socket, sessionManager: SessionManager);
    private _initialize();
    private _end();
}
