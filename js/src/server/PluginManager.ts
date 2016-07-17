import Plugin from "./Plugin";
import path = require("path");
import fs = require("fs");
import glob = require("glob");
import util = require("util");

import IPluginConfiguration = require("./IPluginConfiguration");
import PluginConfigurationParser = require("./PluginConfigurationParser");
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");
import {IPluginHostFactory} from "./IPluginHostFactory";

export default class PluginManager {

    private _gvimServerName: string;
    private _pluginNameToInstance = {};
    private _commandExecutor: IRemoteCommandExecutor;
    private _pluginHostFactory: IPluginHostFactory;

    constructor(gvimServerName: string, commandExecutor: IRemoteCommandExecutor, pluginHost: IPluginHostFactory) {
        this._gvimServerName = gvimServerName;
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHost;

        this.loadGlobalPlugins();
    }

    public loadGlobalPlugins() {
        var jsPluginDirectory = path.join(process.env.HOME, "vimfiles", "js-plugins");
        this._loadPluginsFromDirectory(jsPluginDirectory);

        var builtInPluginDirectory = path.join(__dirname, "..", "plugins");
        this._loadPluginsFromDirectory(builtInPluginDirectory);
    }

    private _loadPluginsFromDirectory(jsPluginDirectory: string): void {
        console.log("Loading plugins from: {0}", jsPluginDirectory)

        var plugins = glob.sync(path.join(jsPluginDirectory, "*/package.json"));

        plugins.forEach((plugin) => {
            this._loadPluginFromPackage(plugin);
        });
    }

    private _loadPluginFromPackage(packageFilePath: string): void {
        console.log("Loading plugin from package: " + packageFilePath);
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
            var plugin = new Plugin(this._commandExecutor, this._pluginHostFactory, this._gvimServerName, pluginName, pluginFilePath, config);
            plugin.start();
            plugin.on("loadplugin", (pluginPath) => this._loadPluginFromPackage(pluginPath));
            this._pluginNameToInstance[pluginName] = plugin;
        } else {
            console.log("Plugin [" + pluginName + "] already started.")
        }
    }

    public getPlugin(pluginName: string) {
        return this._pluginNameToInstance[pluginName];
    }

    public getAllPlugins(): Plugin[] {
        var ret = [];

        Object.keys(this._pluginNameToInstance).forEach((key) => {
            ret.push(this._pluginNameToInstance[key]);
        });
        return ret;
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

    public onBufferChanged(bufferChangedArgs: any): void {
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            var plugin = this._pluginNameToInstance[key];
            plugin.onBufferChanged(bufferChangedArgs);
        });
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            var plugin = this._pluginNameToInstance[key];
            plugin.notifyEvent(eventName, eventArgs);
        });
    }

    public dispose(): void {
        this.getAllPlugins()
            .forEach((plugin) => plugin.dispose());
    }
}
