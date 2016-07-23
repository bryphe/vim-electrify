import * as events from "events";
import { IPluginConfiguration } from "./IPluginConfiguration";
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");
import { IPluginHost } from "./IPluginHost";
import { IPluginHostFactory } from "./IPluginHostFactory";
export default class Plugin extends events.EventEmitter {
    private _pluginPath;
    private _pluginName;
    private _gvimServerName;
    private _config;
    private _commandExecutor;
    private _pluginHost;
    private _pluginHostFactory;
    pluginName: string;
    pluginPath: string;
    pluginHost: IPluginHost;
    constructor(commandExecutor: IRemoteCommandExecutor, pluginHostFactory: IPluginHostFactory, gvimServerName: string, pluginName: string, pluginPath: string, config: IPluginConfiguration);
    start(): void;
    showDevTools(): void;
    hideDevTools(): void;
    private _handleMessage(data);
    notifyEvent(eventName: string, eventArgs: any): void;
    startOmniComplete(omniCompletionArgs: any): void;
    onBufferChanged(bufferChangedEventArgs: any): void;
    execute(commandName: string, callContext: any): void;
    private _writeToPlugin(command, context);
    private _isCommandHandled(context);
    dispose(): void;
}
