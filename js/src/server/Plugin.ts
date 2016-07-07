import childProcess = require("child_process");
import path = require("path");
import readline = require("readline");
import log = require("./log")
import minimatch = require("minimatch");

import * as Electron from "electron";
import runInBrowserWindow from "./run-in-browserwindow";

var colors = require("colors/safe");

import IPluginConfiguration = require("./IPluginConfiguration");
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");

var CHANNEL = 1;

export default class Plugin {

    private _pluginPath: string;
    private _pluginName: string;
    private _gvimServerName: string;
    private _config: IPluginConfiguration = null;
    private _io: any;
    private _nsp: any;
    private _sockets: any[] = [];
    private _commandExecutor: IRemoteCommandExecutor;
    private _window: Electron.BrowserWindow;

    public get pluginName(): string {
        return this._pluginName;
    }

    public get pluginPath(): string {
        return this._pluginPath;
    }

    constructor(io: any, commandExecutor: IRemoteCommandExecutor, gvimServerName: string, pluginName: string, pluginPath: string, config: IPluginConfiguration) {
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
        this._config = config;
        this._io = io;
        this._commandExecutor = commandExecutor;
    }

    public start(): void {
        if (this._window)
            return;

        // Get absolute path to plugin
        var pluginWorkingDirectory = path.resolve(path.dirname(this._pluginPath));

        // Get api path
        var apiPath = path.resolve(path.join(__dirname, "..", "api", "index.js"));

        // Get plugin shim path
        var pluginShimPath = path.resolve(path.join(__dirname, "..", "plugin-shim-process", "index.js"));

        CHANNEL++;

        this._window = runInBrowserWindow(pluginShimPath, {
            apipath: apiPath,
            pluginpath: this._pluginPath,
            servername: this._gvimServerName,
            pluginname: this._pluginName,
            cwd: pluginWorkingDirectory,
            channel: CHANNEL.toString()
        });

        this._nsp = this._io.of("/" + CHANNEL.toString());
        this._nsp.on("connection", (socket) => {
            console.log("Established socket connection to channel");
            log.info("--Established socket connection to: " + CHANNEL.toString());
            this._sockets.push(socket);
            socket.on("message", (msg) => {
                this._handleMessage(msg);
            });
        });

        this._nsp.on("connect_error", () => {
            console.log("Error connecting to plugin socket.");
        });

        this._nsp.on("error", () => {
            console.log("Error connecting to socket");
        });
    }

    public showDevTools(): void {
        this._window.show();
        this._window.webContents.openDevTools();
    }

    public hideDevTools(): void {
        this._window.hide();
    }

    private _handleMessage(data): void {
        if (data && data.type) {
            if (data.type == "command") {

                var command = data.command.split("\"").join("\\\"");
                log.verbose("got command: " + command);
                this._commandExecutor.executeCommand(this._gvimServerName, command);
            } else if (data.type == "log") {
                var logLevel = data.logLevel || "warn";
                this._log(logLevel, data.msg);
            }
        }
    }

    private _log(level: string, message: string) {
        log[level]("[" + colors.cyan(this._pluginName) + "]" + message);
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        log.verbose(this._pluginName + ": firing event - " + eventName + "|" + JSON.stringify(eventArgs));

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
        if (this._window) {
            if (this._isCommandHandled(bufferName)) {
                console.log("Writing to plugin: " + this._pluginName);
                this._nsp.emit("command", command);
            } else {
                log.info("Command ignored for buffer: " + bufferName);
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
        if(this._nsp) {
            this._nsp = null;
            log.info("Disconnecting sockets: " + this._sockets.length);
            this._sockets.forEach((socket) => socket.disconnect());

            // this._pluginProcess = null;
            // TODO: Dispose of BrowserWindow
        }
    }
}
