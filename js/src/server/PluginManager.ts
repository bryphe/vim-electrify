import Plugin from "./Plugin";
import path = require("path");
import fs = require("fs");
import glob = require("glob");
import util = require("util");

export default class PluginManager {

    private _gvimServerName: string;
    private _pluginNameToInstance = {};

    constructor(gvimServerName: string) {
        this._gvimServerName = gvimServerName;
        this.loadGlobalPlugins();
    }

    public loadGlobalPlugins() {

        var jsPluginDirectory = path.join(__dirname, "../../../../../js-plugins");

        var plugins = glob.sync(path.join(jsPluginDirectory, "*/package.json"));

        plugins.forEach((plugin) => {
            this._loadPluginFromPackage(plugin);
        });
    }

    private _loadPluginFromPackage(packageFilePath: string): void {
        var packageInfo = JSON.parse(fs.readFileSync(packageFilePath, "utf8"));
        var main = packageInfo.main;
        var name = packageInfo.name;
        var version = packageInfo.version;
        util.format("Loading plugin: %s %s %s", name, version, main);

        this.start(name, path.join(packageFilePath, "..", main))
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

    public notifyEvent(eventName: string, eventArgs: any) {
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            var plugin = this._pluginNameToInstance[key];
            plugin.notifyEvent(eventName, eventArgs);
        });
    }
}
