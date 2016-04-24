import IPluginConfiguration = require("./IPluginConfiguration");
export default class Plugin {
    private _pluginPath;
    private _pluginName;
    private _pluginProcess;
    private _gvimServerName;
    private _rl;
    private _config;
    constructor(gvimServerName: string, pluginName: string, pluginPath: string, config: IPluginConfiguration);
    start(): void;
    notifyEvent(eventName: string, eventArgs: any): void;
    startOmniComplete(omniCompletionArgs: any): void;
    updateOmniComplete(updateOmniCompletionArgs: any): void;
    execute(commandName: string, callContext: any): void;
    private _writeToPlugin(command);
}
