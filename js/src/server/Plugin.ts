import childProcess = require("child_process");
import path = require("path");
import readline = require("readline");
import minimatch = require("minimatch");

import IPluginConfiguration = require("./IPluginConfiguration");
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");

import { IPluginHost } from "./IPluginHost";
import { IPluginHostFactory } from "./IPluginHostFactory";

export default class Plugin {

    private _pluginPath: string;
    private _pluginName: string;
    private _gvimServerName: string;
    private _config: IPluginConfiguration = null;
    private _commandExecutor: IRemoteCommandExecutor;

    private _pluginHost: IPluginHost;
    private _pluginHostFactory: IPluginHostFactory;

    public get pluginName(): string {
        return this._pluginName;
    }

    public get pluginPath(): string {
        return this._pluginPath;
    }

    constructor(commandExecutor: IRemoteCommandExecutor, pluginHostFactory: IPluginHostFactory, gvimServerName: string, pluginName: string, pluginPath: string, config: IPluginConfiguration) {
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
        this._config = config;
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHostFactory;
    }

    public start(): void {
        if (this._pluginHost)
            return;

        this._pluginHost = this._pluginHostFactory.createPluginHost();
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
