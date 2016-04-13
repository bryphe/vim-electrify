import Plugin from "./Plugin";
import path = require("path");
import fs = require("fs");
import glob = require("glob");
import util = require("util");

import IPluginConfiguration = require("./IPluginConfiguration");
import PluginConfigurationParser = require("./PluginConfigurationParser");

export default class PluginManager {

    private _gvimServerName: string;
    private _pluginNameToInstance = {};

    constructor(gvimServerName: string) {
        this._gvimServerName = gvimServerName;
        this.loadGlobalPlugins();
    }

    public loadGlobalPlugins() {

        var jsPluginDirectory = path.join(process.env.HOME, "vimfiles", "js-plugins");
        console.log("Loading plugins from: {0}", jsPluginDirectory)

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
        var config = PluginConfigurationParser.getVimConfig(packageInfo);
        console.log(util.format("Loading plugin: %s %s %s", name, version, main));
        console.log("-Supported files: " + config.supportedFiles);

        this.start(name, path.join(packageFilePath, "..", main), config)
    }

    public start(pluginName: string, pluginFilePath: string, config: IPluginConfiguration): void {
        if(!this._pluginNameToInstance[pluginName]) {
            console.log("Starting plugin: " + pluginName + " path: " + pluginFilePath)
            var plugin = new Plugin(this._gvimServerName, pluginName, pluginFilePath, config);
            plugin.start();
            this._pluginNameToInstance[pluginName] = plugin;
            return;
        }

        console.log("Plugin [" + pluginName + "] already started.")
    }

    public getPlugin(pluginName: string) {
        return this._pluginNameToInstance[pluginName];
    }

    public startOmniComplete(omniCompletionArgs: any): void {
        console.log("PluginManager - starting omnicomplete");

        Object.keys(this._pluginNameToInstance).forEach((key) => {
            if(key.indexOf("typescript") >= 0)  {
                var plugin = this._pluginNameToInstance[key];
                plugin.startOmniComplete(omniCompletionArgs);
            }
        });
    }

    public updateOmniComplete(updateOmniCompletionArgs: any): void {
        var commandInfo = {
            type: "omnicomplete-update",
            arguments: updateOmniCompletionArgs
        };

        Object.keys(this._pluginNameToInstance).forEach((key) => {
            if(key.indexOf("typescript") >= 0)  {
                var plugin = this._pluginNameToInstance[key];
                plugin.updateOmniComplete(updateOmniCompletionArgs);
            }
        });
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            var plugin = this._pluginNameToInstance[key];
            plugin.notifyEvent(eventName, eventArgs);
        });
    }
}
