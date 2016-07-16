import * as events from "events";
import * as path from "path";
import * as Electron from "electron";

import runInBrowserWindow from "./run-in-browserwindow";
import { IPluginHost } from "./IPluginHost";
import { IPluginHostFactory } from "./IPluginHostFactory";

export default class BrowserWindowPluginHost extends events.EventEmitter implements IPluginHost {

    private _io: any;
    private _nsp: any;
    private _port: number;
    private _channel: number;

    private _sockets: any[] = [];
    private _window: Electron.BrowserWindow;

    constructor(io: any, port: number, channel: number) {
        super();

        this._io = io;
        this._port = port;
        this._channel = channel;
    }

    public start(gvimServerName: string, pluginName: string, pluginPath: string): void {
        // Get working directory
        var pluginWorkingDirectory = path.resolve(path.dirname(pluginPath));

        // Get api path
        var apiPath = path.resolve(path.join(__dirname, "..", "api", "index.js"));

        // Get plugin shim path (host)
        var pluginShimPath = path.resolve(path.join(__dirname, "..", "plugin-shim-process", "index.js"));

        this._window = runInBrowserWindow(pluginShimPath, {
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
            console.log("Established socket connection to channel"+ this._channel.toString());
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

    public sendCommand(command: string): void {
        this._nsp.emit("command", command);
    }

    public showDevTools(): void {
        this._window.show();
        this._window.webContents.openDevTools();
    }

    public hideDevTools(): void {
        this._window.hide();
    }

    public dispose(): void {
        if(this._nsp) {
            this._nsp = null;
            console.log("Disconnecting sockets: " + this._sockets.length);
            this._sockets.forEach((socket) => socket.disconnect());

            // this._pluginProcess = null;
            // TODO: Dispose of BrowserWindow
        }
    }
}
