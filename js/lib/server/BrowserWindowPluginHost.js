"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require("events");
var path = require("path");
var run_in_browserwindow_1 = require("./run-in-browserwindow");
var BrowserWindowPluginHost = (function (_super) {
    __extends(BrowserWindowPluginHost, _super);
    function BrowserWindowPluginHost(io, port, channel) {
        _super.call(this);
        this._sockets = [];
        this._io = io;
        this._port = port;
        this._channel = channel;
    }
    BrowserWindowPluginHost.prototype.start = function (gvimServerName, pluginName, pluginPath) {
        var _this = this;
        var pluginWorkingDirectory = path.resolve(path.dirname(pluginPath));
        var apiPath = path.resolve(path.join(__dirname, "..", "api", "index.js"));
        var pluginShimPath = path.resolve(path.join(__dirname, "..", "plugin-shim-process", "index.js"));
        this._window = run_in_browserwindow_1.default(pluginShimPath, {
            apipath: apiPath,
            pluginpath: pluginPath,
            servername: gvimServerName,
            pluginname: pluginName,
            cwd: pluginWorkingDirectory,
            channel: this._channel.toString(),
            port: this._port
        });
        this._nsp = this._io.of("/" + this._channel.toString());
        this._nsp.on("connection", function (socket) {
            console.log("Established socket connection to channel" + _this._channel.toString());
            _this._sockets.push(socket);
            socket.on("message", function (msg) {
                _this.emit("message", msg);
            });
        });
        this._nsp.on("connect_error", function () {
            console.log("Error connecting to plugin socket.");
        });
        this._nsp.on("error", function () {
            console.log("Error connecting to socket");
        });
    };
    BrowserWindowPluginHost.prototype.sendCommand = function (command) {
        this._nsp.emit("command", command);
    };
    BrowserWindowPluginHost.prototype.showDevTools = function () {
        this._window.show();
        this._window.webContents.openDevTools();
    };
    BrowserWindowPluginHost.prototype.hideDevTools = function () {
        this._window.hide();
    };
    BrowserWindowPluginHost.prototype.dispose = function () {
        if (this._nsp) {
            this._nsp = null;
            console.log("Disconnecting sockets: " + this._sockets.length);
            this._sockets.forEach(function (socket) { return socket.disconnect(); });
        }
    };
    return BrowserWindowPluginHost;
}(events.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrowserWindowPluginHost;
