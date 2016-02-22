import Plugin from "./Plugin";

export default class PluginManager {

    private _gvimServerName: string;
    private _pluginNameToInstance = {};

    constructor(gvimServerName: string) {
        this._gvimServerName = gvimServerName;
    }

    public start(pluginName: string, pluginFilePath: string): void {
        if(!this._pluginNameToInstance[pluginName]) {
            console.log("Starting plugin: " + pluginName + " path: " + pluginFilePath)
            var plugin = new Plugin(this._gvimServerName, pluginName, pluginFilePath);
            plugin.start();
            this._pluginNameToInstance[pluginName] = plugin;
            return;
        }

        console.log("Plugin [" + pluginName + "] already started.")
    }

    public getPlugin(pluginName: string) {
        return this._pluginNameToInstance[pluginName];
    }
}
