"use strict";
const events = require("events");
class TcpSocketInstance extends events.EventEmitter {
    constructor(tcpSocket, sessionManager) {
        super();
        this._currentBuffer = "";
        this._tcpSocket = tcpSocket;
        this._sessionManager = sessionManager;
        this._initialize();
    }
    _initialize() {
        this._tcpSocket.on("data", (data) => {
            var dataAsString = data.toString("utf8");
            console.log("tcp: received data of length: " + dataAsString.length);
            this._currentBuffer += dataAsString;
            if (this._currentBuffer.indexOf("\n") == -1)
                return;
            var parsedData = null;
            try {
                parsedData = JSON.parse(this._currentBuffer);
                this._currentBuffer = "";
            }
            catch (ex) {
                this._currentBuffer = "";
                console.error("tcp: error parsing data: " + ex.toString(), { error: ex });
            }
            if (parsedData.type === "connect") {
                console.log("Got connect event - registering server: " + parsedData.args.serverName);
                this._session = this._sessionManager.getOrCreateSession(parsedData.args.serverName);
                this.emit("connect", this._session);
            }
            else if (parsedData.type === "event") {
                var eventName = parsedData.args.eventName;
                var context = parsedData.context;
                console.log("Got event: " + eventName);
                this._session.notifyEvent(eventName, context);
                if (eventName === "VimLeave") {
                    this._end();
                }
            }
            else if (parsedData.type === "bufferChanged") {
                var bufferName = parsedData.args.bufferName;
                var lines = parsedData.args.lines;
                console.log("BufferChanged: " + bufferName + "| Lines: " + lines.length);
                this._session.plugins.onBufferChanged(parsedData.args);
            }
            else {
                var plugin = parsedData.args.plugin;
                var command = parsedData.args.command;
                var context = parsedData.context;
                console.log("Got plugin command: " + command);
                var plugin = this._session.plugins.getPlugin(plugin);
                plugin.execute(command, context);
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
    _end() {
        this.emit("end", this._session);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TcpSocketInstance;
