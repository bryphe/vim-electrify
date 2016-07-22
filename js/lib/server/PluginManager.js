"use strict";
var Plugin_1 = require("./Plugin");
var path = require("path");
var fs = require("fs");
var glob = require("glob");
var util = require("util");
var PluginConfigurationParser = require("./PluginConfigurationParser");
var PluginManager = (function () {
    function PluginManager(gvimServerName, commandExecutor, pluginHost) {
        this._pluginNameToInstance = {};
        this._gvimServerName = gvimServerName;
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHost;
        this.loadGlobalPlugins();
    }
    PluginManager.prototype.loadGlobalPlugins = function () {
        var jsPluginDirectory = path.join(process.env.HOME, "vimfiles", "js-plugins");
        this._loadPluginsFromDirectory(jsPluginDirectory);
        var builtInPluginDirectory = path.join(__dirname, "..", "plugins");
        this._loadPluginsFromDirectory(builtInPluginDirectory);
    };
    PluginManager.prototype._loadPluginsFromDirectory = function (jsPluginDirectory) {
        var _this = this;
        console.log("Loading plugins from: {0}", jsPluginDirectory);
        var plugins = glob.sync(path.join(jsPluginDirectory, "*/package.json"));
        plugins.forEach(function (plugin) {
            _this._loadPluginFromPackage(plugin);
        });
    };
    PluginManager.prototype._loadPluginFromPackage = function (packageFilePath) {
        console.log("Loading plugin from package: " + packageFilePath);
        var packageInfo = JSON.parse(fs.readFileSync(packageFilePath, "utf8"));
        var main = packageInfo.main;
        var name = packageInfo.name;
        var version = packageInfo.version;
        var config = PluginConfigurationParser.getVimConfig(packageInfo);
        console.log(util.format("Loading plugin: %s %s %s", name, version, main));
        console.log("-Supported files: " + config.supportedFiles);
        this.start(name, path.join(packageFilePath, "..", main), config);
    };
    PluginManager.prototype.start = function (pluginName, pluginFilePath, config) {
        var _this = this;
        if (!this._pluginNameToInstance[pluginName]) {
            console.log("Starting plugin: " + pluginName + " path: " + pluginFilePath);
            var plugin = new Plugin_1.default(this._commandExecutor, this._pluginHostFactory, this._gvimServerName, pluginName, pluginFilePath, config);
            plugin.start();
            plugin.on("loadplugin", function (pluginPath) { return _this._loadPluginFromPackage(pluginPath); });
            this._pluginNameToInstance[pluginName] = plugin;
        }
        else {
            console.log("Plugin [" + pluginName + "] already started.");
        }
    };
    PluginManager.prototype.getPlugin = function (pluginName) {
        return this._pluginNameToInstance[pluginName];
    };
    PluginManager.prototype.getAllPlugins = function () {
        var _this = this;
        var ret = [];
        Object.keys(this._pluginNameToInstance).forEach(function (key) {
            ret.push(_this._pluginNameToInstance[key]);
        });
        return ret;
    };
    PluginManager.prototype.startOmniComplete = function (omniCompletionArgs) {
        var _this = this;
        console.log("PluginManager - starting omnicomplete");
        Object.keys(this._pluginNameToInstance).forEach(function (key) {
            if (key.indexOf("typescript") >= 0) {
                var plugin = _this._pluginNameToInstance[key];
                plugin.startOmniComplete(omniCompletionArgs);
            }
        });
    };
    PluginManager.prototype.onBufferChanged = function (bufferChangedArgs) {
        var _this = this;
        Object.keys(this._pluginNameToInstance).forEach(function (key) {
            var plugin = _this._pluginNameToInstance[key];
            plugin.onBufferChanged(bufferChangedArgs);
        });
    };
    PluginManager.prototype.notifyEvent = function (eventName, eventArgs) {
        var _this = this;
        Object.keys(this._pluginNameToInstance).forEach(function (key) {
            var plugin = _this._pluginNameToInstance[key];
            plugin.notifyEvent(eventName, eventArgs);
        });
    };
    PluginManager.prototype.dispose = function () {
        this.getAllPlugins()
            .forEach(function (plugin) { return plugin.dispose(); });
    };
    return PluginManager;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = PluginManager;
