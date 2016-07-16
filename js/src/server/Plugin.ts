import childProcess = require("child_process");
import path = require("path");
import readline = require("readline");
import minimatch = require("minimatch");

import * as Electron from "electron";
import runInBrowserWindow from "./run-in-browserwindow";

var colors = require("colors/safe");

import IPluginConfiguration = require("./IPluginConfiguration");
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");

var CHANNEL = 1;

import * as events from "events";

export interface IPluginHost extends events.EventEmitter {
    // Message event - sent from plugin to this class
    // Error event
    //

    start(gvimServerName: string, pluginName: string, pluginPath: string): void;

    /** 
     * Send a command to the plugin
     */
    sendCommand(command: string): void;

    showDevTools(): void;

    hideDevTools(): void;

    dispose(): void;
}

export interface IPluginHostFactory {

    createPluginHost(): IPluginHost;

}

// export class BrowserWindowPluginHostFactory implements IPluginHostFactory {
//     private _channelCount: number = 1;


// }

export class BrowserWindowPluginHost extends events.EventEmitter implements IPluginHost {

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
            channel: CHANNEL.toString(),
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

export default class Plugin {

    private _pluginPath: string;
    private _pluginName: string;
    private _gvimServerName: string;
    private _config: IPluginConfiguration = null;
    private _io: any;
    private _nsp: any;
    private _port: number;
    private _commandExecutor: IRemoteCommandExecutor;

    private _pluginHost: IPluginHost;

    public get pluginName(): string {
        return this._pluginName;
    }

    public get pluginPath(): string {
        return this._pluginPath;
    }

    constructor(io: any, commandExecutor: IRemoteCommandExecutor, port: number, gvimServerName: string, pluginName: string, pluginPath: string, config: IPluginConfiguration) {
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
        this._config = config;
        this._io = io;
        this._port = port;
        this._commandExecutor = commandExecutor;
    }

    public start(): void {
        if (this._pluginHost)
            return;


        CHANNEL++;
        this._pluginHost = new BrowserWindowPluginHost(this._io, this._port, CHANNEL);
        this._pluginHost.start(this._gvimServerName, this._pluginName, this._pluginPath);

        this._pluginHost.on("message", (msg) => {
            this._handleMessage(msg);
        });
    }

    public showDevTools(): void {
        this._pluginHost.showDevTools();
    }

    public hideDevTools(): void {
        this._pluginHost.hideDevTools();
    }

    private _handleMessage(data): void {
        if (data && data.type) {
            if (data.type == "command") {

                var command = data.command.split("\"").join("\\\"");
                this._commandExecutor.executeCommand(this._gvimServerName, command);
            }
        }
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        console.log(this._pluginName + ": firing event - " + eventName + "|" + JSON.stringify(eventArgs));

        var commandInfo = {
            type: "event",
            eventName: eventName,
            callContext: eventArgs
        };

        this._writeToPlugin(commandInfo, eventArgs.currentBuffer);
    }

    public startOmniComplete(omniCompletionArgs: any): void {
        var commandInfo = {
            type: "omnicomplete",
            arguments: omniCompletionArgs
        };

        this._writeToPlugin(commandInfo, omniCompletionArgs.currentBuffer);
    }

    public onBufferChanged(bufferChangedEventArgs: any): void {
        var commandInfo = {
            type: "bufferChanged",
            arguments: bufferChangedEventArgs
        };
        this._writeToPlugin(commandInfo, bufferChangedEventArgs.bufferName);
    }

    public execute(commandName: string, callContext: any) {
        var commandInfo = {
            type: "execute",
            command: commandName,
            callContext: callContext
        };
        this._writeToPlugin(commandInfo, callContext.currentBuffer);
    }

    private _writeToPlugin(command: any, bufferName: string): void {
        if (this._pluginHost) {
            if (this._isCommandHandled(bufferName)) {
                console.log("Writing to plugin: " + this._pluginName);
                this._pluginHost.sendCommand(command);
            } else {
                console.log("Command ignored for buffer: " + bufferName);
            }
        }
    }

    private _isCommandHandled(bufferName: string): boolean {
        if (!bufferName)
            return false;

        if (this._config.supportedFiles) {
            var anyMatches = false;

            var matches = this._config.supportedFiles.filter((fileFilter) => minimatch(bufferName, fileFilter, { matchBase: true }));
            return matches.length > 0;
        } else {
            return true;
        }
    }

    public dispose(): void {
        if(this._pluginHost) {
            this._pluginHost.dispose();
            this._pluginHost = null;
        }
    }
}
