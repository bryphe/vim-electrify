"use strict";
const Plugin_1 = require("./Plugin");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const util = require("util");
const PluginConfigurationParser = require("./PluginConfigurationParser");
class PluginManager {
    constructor(gvimServerName, commandExecutor, pluginHost) {
        this._pluginNameToInstance = {};
        this._gvimServerName = gvimServerName;
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHost;
        this.loadGlobalPlugins();
    }
    loadGlobalPlugins() {
        var jsPluginDirectory = path.join(process.env.HOME, "vimfiles", "js-plugins");
        this._loadPluginsFromDirectory(jsPluginDirectory);
        var builtInPluginDirectory = path.join(__dirname, "..", "plugins");
        this._loadPluginsFromDirectory(builtInPluginDirectory);
    }
    _loadPluginsFromDirectory(jsPluginDirectory) {
        console.log("Loading plugins from: {0}", jsPluginDirectory);
        var plugins = glob.sync(path.join(jsPluginDirectory, "*/package.json"));
        plugins.forEach((plugin) => {
            this._loadPluginFromPackage(plugin);
        });
    }
    _loadPluginFromPackage(packageFilePath) {
        console.log("Loading plugin from package: " + packageFilePath);
        var packageInfo = JSON.parse(fs.readFileSync(packageFilePath, "utf8"));
        var main = packageInfo.main;
        var name = packageInfo.name;
        var version = packageInfo.version;
        var config = PluginConfigurationParser.getVimConfig(packageInfo);
        console.log(util.format("Loading plugin: %s %s %s", name, version, main));
        console.log("-Supported files: " + config.supportedFiles);
        this.start(name, path.join(packageFilePath, "..", main), config);
    }
    start(pluginName, pluginFilePath, config) {
        if (!this._pluginNameToInstance[pluginName]) {
            console.log("Starting plugin: " + pluginName + " path: " + pluginFilePath);
            var plugin = new Plugin_1.default(this._commandExecutor, this._pluginHostFactory, this._gvimServerName, pluginName, pluginFilePath, config);
            plugin.start();
            plugin.on("loadplugin", (pluginPath) => this._loadPluginFromPackage(pluginPath));
            this._pluginNameToInstance[pluginName] = plugin;
        }
        else {
            console.log("Plugin [" + pluginName + "] already started.");
        }
    }
    getPlugin(pluginName) {
        return this._pluginNameToInstance[pluginName];
    }
    getAllPlugins() {
        var ret = [];
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            ret.push(this._pluginNameToInstance[key]);
        });
        return ret;
    }
    startOmniComplete(omniCompletionArgs) {
        console.log("PluginManager - starting omnicomplete");
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            if (key.indexOf("typescript") >= 0) {
                var plugin = this._pluginNameToInstance[key];
                plugin.startOmniComplete(omniCompletionArgs);
            }
        });
    }
    onBufferChanged(bufferChangedArgs) {
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            var plugin = this._pluginNameToInstance[key];
            plugin.onBufferChanged(bufferChangedArgs);
        });
    }
    notifyEvent(eventName, eventArgs) {
        Object.keys(this._pluginNameToInstance).forEach((key) => {
            var plugin = this._pluginNameToInstance[key];
            plugin.notifyEvent(eventName, eventArgs);
        });
    }
    dispose() {
        this.getAllPlugins()
            .forEach((plugin) => plugin.dispose());
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PluginManager;
