"use strict";
const events = require("events");
const minimatch = require("minimatch");
class Plugin extends events.EventEmitter {
    constructor(commandExecutor, pluginHostFactory, gvimServerName, pluginName, pluginPath, config) {
        super();
        this._config = null;
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
        this._config = config;
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHostFactory;
    }
    get pluginName() {
        return this._pluginName;
    }
    get pluginPath() {
        return this._pluginPath;
    }
    get pluginHost() {
        return this._pluginHost;
    }
    start() {
        if (this._pluginHost)
            return;
        this._pluginHost = this._pluginHostFactory.createPluginHost();
        this._pluginHost.start(this._gvimServerName, this._pluginName, this._pluginPath);
        this._pluginHost.on("message", (msg) => {
            this._handleMessage(msg);
        });
    }
    showDevTools() {
        this._pluginHost.showDevTools();
    }
    hideDevTools() {
        this._pluginHost.hideDevTools();
    }
    _handleMessage(data) {
        if (data && data.type) {
            if (data.type === "command") {
                var command = data.command.split("\"").join("\\\"");
                this._commandExecutor.executeCommand(this._gvimServerName, command);
            }
            else if (data.type === "loadplugin") {
                this.emit("loadplugin", data.pluginPath);
            }
        }
    }
    notifyEvent(eventName, eventArgs) {
        console.log(this._pluginName + ": firing event - " + eventName + "|" + JSON.stringify(eventArgs));
        var commandInfo = {
            type: "event",
            eventName: eventName,
            callContext: eventArgs
        };
        this._writeToPlugin(commandInfo, eventArgs);
    }
    startOmniComplete(omniCompletionArgs) {
        var commandInfo = {
            type: "omnicomplete",
            arguments: omniCompletionArgs
        };
        this._writeToPlugin(commandInfo, omniCompletionArgs);
    }
    onBufferChanged(bufferChangedEventArgs) {
        var commandInfo = {
            type: "bufferChanged",
            arguments: bufferChangedEventArgs
        };
        this._writeToPlugin(commandInfo, bufferChangedEventArgs);
    }
    execute(commandName, callContext) {
        var commandInfo = {
            type: "execute",
            command: commandName,
            callContext: callContext
        };
        this._writeToPlugin(commandInfo, callContext);
    }
    _writeToPlugin(command, context) {
        if (this._pluginHost) {
            if (this._isCommandHandled(context)) {
                console.log("Writing to plugin: " + this._pluginName);
                this._pluginHost.sendCommand(command);
            }
            else {
                console.log("Command ignored for buffer: " + context.currentBuffer);
            }
        }
    }
    _isCommandHandled(context) {
        var filterPassed = true;
        if (this._config.supportedFiles) {
            var anyMatches = false;
            var matches = this._config.supportedFiles.filter((fileFilter) => minimatch(context.currentBuffer, fileFilter, { matchBase: true }));
            filterPassed = filterPassed && matches.length > 0;
        }
        if (this._config.supportedFileTypes) {
            var matches = this._config.supportedFileTypes.filter(f => f === context.filetype);
            filterPassed = filterPassed && matches.length > 0;
        }
        return filterPassed;
    }
    dispose() {
        if (this._pluginHost) {
            this._pluginHost.dispose();
            this._pluginHost = null;
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Plugin;
