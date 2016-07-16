/**
 * The TcpServer is used for integration between vim <-> electron
 * On the Vim side, there is a python TCP client listening to these messages,
 * and pushing data to the server.
 */

import * as net from "net";
import * as events from "events";
import SessionManager from "./SessionManager";
import Session from "./Session";

export default class TcpSocketInstance extends events.EventEmitter {
    private _tcpSocket: net.Socket;
    private _sessionManager: SessionManager;
    private _session: Session;
    private _currentBuffer = "";

    constructor(tcpSocket: net.Socket, sessionManager: SessionManager) {
        super();

        this._tcpSocket = tcpSocket;
        this._sessionManager = sessionManager;
        this._initialize();
    }

    private _initialize(): void {
        this._tcpSocket.on("data", (data) => {
            var dataAsString = data.toString("utf8");

            console.log("tcp: received data of length: " + dataAsString.length);
            this._currentBuffer += dataAsString;

            if(this._currentBuffer.indexOf("\n") == -1)
                return;

            var parsedData = null;
            try {
                parsedData = JSON.parse(this._currentBuffer);
                this._currentBuffer = "";
            } catch(ex) {
                this._currentBuffer = "";
                console.error("tcp: error parsing data: " + ex.toString(), { error: ex});
            }

            if(parsedData.type === "connect") {
                console.log("Got connect event - registering server: " + parsedData.args.serverName);
                this._session = this._sessionManager.getOrCreateSession(parsedData.args.serverName);
                this.emit("connect", this._session);
            } else if(parsedData.type === "event") {
                var eventName = parsedData.args.eventName;
                var context = parsedData.context;
                console.log("Got event: " + eventName);
                this._session.notifyEvent(eventName, context)

                if(eventName === "VimLeave") {
                    this._end();
                }
            } else if(parsedData.type === "command") {
                var plugin = parsedData.args.plugin;
                var command = parsedData.args.command;
                var context = parsedData.context;

                console.log("Got command: " + command);

                var plugin = this._session.plugins.getPlugin(plugin);
                plugin.execute(command, context);
            } else if(parsedData.type === "bufferChanged") {
                var bufferName = parsedData.args.bufferName;
                var lines = parsedData.args.lines;

                console.log("BufferChanged: " + bufferName + "| Lines: " + lines.length);
                this._session.plugins.onBufferChanged(parsedData.args);
            }
        });

        this._tcpSocket.on("close", () => {
            console.log("tcp: close");
            this._end();
        });

        this._tcpSocket.on("error", (err) => {
            console.log("tcp: disconnect");
            this._end();
        });
    }
    
    private _end(): void {
        this.emit("end", this._session);
    }
}
