"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require("events");
var minimatch = require("minimatch");
var Plugin = (function (_super) {
    __extends(Plugin, _super);
    function Plugin(commandExecutor, pluginHostFactory, gvimServerName, pluginName, pluginPath, config) {
        _super.call(this);
        this._config = null;
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
        this._config = config;
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHostFactory;
    }
    Object.defineProperty(Plugin.prototype, "pluginName", {
        get: function () {
            return this._pluginName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Plugin.prototype, "pluginPath", {
        get: function () {
            return this._pluginPath;
        },
        enumerable: true,
        configurable: true
    });
    Plugin.prototype.start = function () {
        var _this = this;
        if (this._pluginHost)
            return;
        this._pluginHost = this._pluginHostFactory.createPluginHost();
        this._pluginHost.start(this._gvimServerName, this._pluginName, this._pluginPath);
        this._pluginHost.on("message", function (msg) {
            _this._handleMessage(msg);
        });
    };
    Plugin.prototype.showDevTools = function () {
        this._pluginHost.showDevTools();
    };
    Plugin.prototype.hideDevTools = function () {
        this._pluginHost.hideDevTools();
    };
    Plugin.prototype._handleMessage = function (data) {
        if (data && data.type) {
            if (data.type === "command") {
                var command = data.command.split("\"").join("\\\"");
                this._commandExecutor.executeCommand(this._gvimServerName, command);
            }
            else if (data.type === "loadplugin") {
                this.emit("loadplugin", data.pluginPath);
            }
        }
    };
    Plugin.prototype.notifyEvent = function (eventName, eventArgs) {
        console.log(this._pluginName + ": firing event - " + eventName + "|" + JSON.stringify(eventArgs));
        var commandInfo = {
            type: "event",
            eventName: eventName,
            callContext: eventArgs
        };
        this._writeToPlugin(commandInfo, eventArgs.currentBuffer);
    };
    Plugin.prototype.startOmniComplete = function (omniCompletionArgs) {
        var commandInfo = {
            type: "omnicomplete",
            arguments: omniCompletionArgs
        };
        this._writeToPlugin(commandInfo, omniCompletionArgs.currentBuffer);
    };
    Plugin.prototype.onBufferChanged = function (bufferChangedEventArgs) {
        var commandInfo = {
            type: "bufferChanged",
            arguments: bufferChangedEventArgs
        };
        this._writeToPlugin(commandInfo, bufferChangedEventArgs.bufferName);
    };
    Plugin.prototype.execute = function (commandName, callContext) {
        var commandInfo = {
            type: "execute",
            command: commandName,
            callContext: callContext
        };
        this._writeToPlugin(commandInfo, callContext.currentBuffer);
    };
    Plugin.prototype._writeToPlugin = function (command, bufferName) {
        if (this._pluginHost) {
            if (this._isCommandHandled(bufferName)) {
                console.log("Writing to plugin: " + this._pluginName);
                this._pluginHost.sendCommand(command);
            }
            else {
                console.log("Command ignored for buffer: " + bufferName);
            }
        }
    };
    Plugin.prototype._isCommandHandled = function (bufferName) {
        if (!bufferName) {
            console.log("No buffername");
            return true;
        }
        if (this._config.supportedFiles) {
            var anyMatches = false;
            var matches = this._config.supportedFiles.filter(function (fileFilter) { return minimatch(bufferName, fileFilter, { matchBase: true }); });
            return matches.length > 0;
        }
        else {
            return true;
        }
    };
    Plugin.prototype.dispose = function () {
        if (this._pluginHost) {
            this._pluginHost.dispose();
            this._pluginHost = null;
        }
    };
    return Plugin;
}(events.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Plugin;
