import Plugin from "./Plugin";
import { IPluginConfiguration } from "./IPluginConfiguration";
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");
import { IPluginHostFactory } from "./IPluginHostFactory";
export default class PluginManager {
    private _gvimServerName;
    private _pluginNameToInstance;
    private _commandExecutor;
    private _pluginHostFactory;
    constructor(gvimServerName: string, commandExecutor: IRemoteCommandExecutor, pluginHost: IPluginHostFactory);
    loadGlobalPlugins(): void;
    private _loadPluginsFromDirectory(jsPluginDirectory);
    private _loadPluginFromPackage(packageFilePath);
    start(pluginName: string, pluginFilePath: string, config: IPluginConfiguration): void;
    getPlugin(pluginName: string): any;
    getAllPlugins(): Plugin[];
    startOmniComplete(omniCompletionArgs: any): void;
    onBufferChanged(bufferChangedArgs: any): void;
    notifyEvent(eventName: string, eventArgs: any): void;
    dispose(): void;
}
