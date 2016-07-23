"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events = require("events");
var os = require("os");
var omni = require("./OmniCompletionmanager");
var channel = global["browserArgs"].channel;
var wsPort = global["browserArgs"].port;
var socket = require("socket.io-client")("http://localhost:" + wsPort + "/" + channel, { path: "/vim-node-plugins/socket.io", transports: ["websocket"] });
var Vim = (function (_super) {
    __extends(Vim, _super);
    function Vim(serverName, pluginName, channel) {
        var _this = this;
        _super.call(this);
        this._commandNameToFunction = {};
        this._evalSequence = 0;
        this._evalCallbacks = {};
        this._serverName = serverName;
        this._pluginName = pluginName;
        this._omniCompletionManager = new omni.OmniCompletionManager(this);
        socket.on("connect", function () {
            socket.emit("room", process.pid);
        });
        socket.on("disconnect", function () {
            process.exit();
        });
        socket.on("connect_error", function (err) {
            console.log("Error connecting to socket server: " + err.toString());
        });
        socket.on("command", function (args) {
            console.log("Received command: " + args.type);
            _this._handleCommand(args);
        });
    }
    Object.defineProperty(Vim.prototype, "omniCompleters", {
        get: function () {
            return this._omniCompletionManager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vim.prototype, "serverName", {
        get: function () {
            return this._serverName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vim.prototype, "pluginName", {
        get: function () {
            return this._pluginName;
        },
        enumerable: true,
        configurable: true
    });
    Vim.prototype.addCommand = function (name, callbackFunction) {
        this._commandNameToFunction[name] = callbackFunction;
        this._rawExec("electrify#command#createCommand('" + this._pluginName + "', '" + name + "')");
    };
    Vim.prototype.exec = function (command) {
        this._rawExec("electrify#command#execute('" + command + "')");
    };
    Vim.prototype.eval = function (command, callbackFunction) {
        this._evalSequence++;
        this._rawExec("electrify#command#eval('" + command + "', '" + this._pluginName + "', '" + this._evalSequence.toString() + "')");
        this._evalCallbacks[this._evalSequence] = callbackFunction;
    };
    Vim.prototype.loadPlugin = function (pluginPackageFilePath) {
        socket.emit("message", {
            type: "loadplugin",
            pluginPath: pluginPackageFilePath
        });
    };
    Vim.prototype.rawExec = function (command) {
        this._rawExec(command);
    };
    Vim.prototype.echo = function (msg) {
        this._rawExec("electrify#command#echo('" + msg + "')");
    };
    Vim.prototype.echohl = function (msg, highlightGroup) {
        this._rawExec("electrify#command#echohl('" + msg + "', '" + highlightGroup + "')");
    };
    Vim.prototype.setSyntaxHighlighting = function (syntaxHighlightingInfo) {
        this._rawExec("electrify#syntax#setKeywordHighlighting('" + JSON.stringify(syntaxHighlightingInfo) + "')");
    };
    Vim.prototype.setErrors = function (key, errors) {
        this._rawExec("electrify#errors#set('" + JSON.stringify(errors) + "')");
    };
    Vim.prototype.setLocationList = function (locations) {
        this._rawExec("electrify#list#setloclist('" + JSON.stringify(locations) + "')");
    };
    Vim.prototype.setQuickFixList = function (locations) {
        this._rawExec("electrify#list#setqflist('" + JSON.stringify(locations) + "')");
    };
    Vim.prototype._rawExec = function (command) {
        var commandToSend = {
            type: "command",
            command: command
        };
        socket.emit("message", commandToSend);
    };
    Vim.prototype._executeEvent = function (command) {
        var eventName = command.eventName;
        this.emit(eventName, command.callContext);
    };
    Vim.prototype._executeCommand = function (command) {
        var commandName = command.command;
        if (commandName === "evalresult") {
            this._onEvalResult(command);
        }
        else {
            this._commandNameToFunction[commandName](command.callContext);
        }
    };
    Vim.prototype._onBufferChanged = function (bufferChangeInfo) {
        console.log("Received file update: " + bufferChangeInfo.lines.length + " lines.");
        var newContent = bufferChangeInfo.lines.join(os.EOL);
        this.emit("BufferChanged", { fileName: bufferChangeInfo.bufferName, newContents: newContent });
    };
    Vim.prototype._onEvalResult = function (command) {
        var seqNumber = command.callContext.seq;
        console.log("Got eval result");
        if (this._evalCallbacks[seqNumber]) {
            this._evalCallbacks[seqNumber](null, command.callContext.returnValue);
            this._evalCallbacks[seqNumber] = null;
        }
    };
    Vim.prototype._handleCommand = function (command) {
        if (command) {
            if (command.type === "execute")
                this._executeCommand(command);
            else if (command.type === "event")
                this._executeEvent(command);
            else if (command.type === "bufferChanged")
                this._onBufferChanged(command.arguments);
        }
    };
    return Vim;
}(events.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Vim;
