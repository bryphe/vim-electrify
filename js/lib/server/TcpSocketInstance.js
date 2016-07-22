"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require("events");
var TcpSocketInstance = (function (_super) {
    __extends(TcpSocketInstance, _super);
    function TcpSocketInstance(tcpSocket, sessionManager) {
        _super.call(this);
        this._currentBuffer = "";
        this._tcpSocket = tcpSocket;
        this._sessionManager = sessionManager;
        this._initialize();
    }
    TcpSocketInstance.prototype._initialize = function () {
        var _this = this;
        this._tcpSocket.on("data", function (data) {
            var dataAsString = data.toString("utf8");
            console.log("tcp: received data of length: " + dataAsString.length);
            _this._currentBuffer += dataAsString;
            if (_this._currentBuffer.indexOf("\n") == -1)
                return;
            var parsedData = null;
            try {
                parsedData = JSON.parse(_this._currentBuffer);
                _this._currentBuffer = "";
            }
            catch (ex) {
                _this._currentBuffer = "";
                console.error("tcp: error parsing data: " + ex.toString(), { error: ex });
            }
            if (parsedData.type === "connect") {
                console.log("Got connect event - registering server: " + parsedData.args.serverName);
                _this._session = _this._sessionManager.getOrCreateSession(parsedData.args.serverName);
                _this.emit("connect", _this._session);
            }
            else if (parsedData.type === "event") {
                var eventName = parsedData.args.eventName;
                var context = parsedData.context;
                console.log("Got event: " + eventName);
                _this._session.notifyEvent(eventName, context);
                if (eventName === "VimLeave") {
                    _this._end();
                }
            }
            else if (parsedData.type === "bufferChanged") {
                var bufferName = parsedData.args.bufferName;
                var lines = parsedData.args.lines;
                console.log("BufferChanged: " + bufferName + "| Lines: " + lines.length);
                _this._session.plugins.onBufferChanged(parsedData.args);
            }
            else {
                var plugin = parsedData.args.plugin;
                var command = parsedData.args.command;
                var context = parsedData.context;
                console.log("Got plugin command: " + command);
                var plugin = _this._session.plugins.getPlugin(plugin);
                plugin.execute(command, context);
            }
        });
        this._tcpSocket.on("close", function () {
            console.log("tcp: close");
            _this._end();
        });
        this._tcpSocket.on("error", function (err) {
            console.log("tcp: disconnect");
            _this._end();
        });
    };
    TcpSocketInstance.prototype._end = function () {
        this.emit("end", this._session);
    };
    return TcpSocketInstance;
}(events.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TcpSocketInstance;
