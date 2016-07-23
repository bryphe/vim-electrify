"use strict";
const events = require("events");
const path = require("path");
const run_in_browserwindow_1 = require("./run-in-browserwindow");
class BrowserWindowPluginHost extends events.EventEmitter {
    constructor(io, port, channel) {
        super();
        this._sockets = [];
        this._io = io;
        this._port = port;
        this._channel = channel;
    }
    start(gvimServerName, pluginName, pluginPath) {
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
        this._nsp.on("connection", (socket) => {
            console.log("Established socket connection to channel" + this._channel.toString());
            this._sockets.push(socket);
            socket.on("message", (msg) => {
                this.emit("message", msg);
            });
        });
        this._nsp.on("connect_error", () => {
            console.log("Error connecting to plugin socket.");
        });
        this._nsp.on("error", () => {
            console.log("Error connecting to socket");
        });
    }
    sendCommand(command) {
        this._nsp.emit("command", command);
    }
    showDevTools() {
        this._window.show();
        this._window.webContents.openDevTools();
    }
    hideDevTools() {
        this._window.hide();
    }
    dispose() {
        if (this._nsp) {
            this._nsp = null;
            console.log("Disconnecting sockets: " + this._sockets.length);
            this._sockets.forEach((socket) => socket.disconnect());
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrowserWindowPluginHost;
