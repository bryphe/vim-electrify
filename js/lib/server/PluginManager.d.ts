import IPluginConfiguration = require("./IPluginConfiguration");
export default class PluginManager {
    private _gvimServerName;
    private _pluginNameToInstance;
    constructor(gvimServerName: string);
    loadGlobalPlugins(): void;
    private _loadPluginFromPackage(packageFilePath);
    start(pluginName: string, pluginFilePath: string, config: IPluginConfiguration): void;
    getPlugin(pluginName: string): any;
    startOmniComplete(omniCompletionArgs: any): void;
    updateOmniComplete(updateOmniCompletionArgs: any): void;
    notifyEvent(eventName: string, eventArgs: any): void;
}
