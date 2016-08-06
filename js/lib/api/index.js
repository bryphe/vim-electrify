"use strict";
const events = require("events");
const os = require("os");
const omni = require("./OmniCompletionmanager");
var channel = global["browserArgs"].channel;
var wsPort = global["browserArgs"].port;
var socket = require("socket.io-client")("http://localhost:" + wsPort + "/" + channel, { path: "/vim-node-plugins/socket.io", transports: ["websocket"] });
class Vim extends events.EventEmitter {
    constructor(serverName, pluginName, channel) {
        super();
        this._commandNameToFunction = {};
        this._evalSequence = 0;
        this._evalCallbacks = {};
        this._serverName = serverName;
        this._pluginName = pluginName;
        this._omniCompletionManager = new omni.OmniCompletionManager(this);
        socket.on("connect", () => {
            socket.emit("room", process.pid);
        });
        socket.on("disconnect", () => {
            process.exit();
        });
        socket.on("connect_error", (err) => {
            console.log("Error connecting to socket server: " + err.toString());
        });
        socket.on("command", (args) => {
            console.log("Received command: " + args.type);
            this._handleCommand(args);
        });
    }
    get omniCompleters() {
        return this._omniCompletionManager;
    }
    get serverName() {
        return this._serverName;
    }
    get pluginName() {
        return this._pluginName;
    }
    addCommand(name, callbackFunction) {
        this._commandNameToFunction[name] = callbackFunction;
        this._rawExec("electrify#command#createCommand('" + this._pluginName + "', '" + name + "')");
    }
    exec(command) {
        this._rawExec("electrify#command#execute('" + command + "')");
    }
    eval(command, callbackFunction) {
        this._evalSequence++;
        this._rawExec("electrify#command#eval('" + command + "', '" + this._pluginName + "', '" + this._evalSequence.toString() + "')");
        this._evalCallbacks[this._evalSequence] = callbackFunction;
    }
    loadPlugin(pluginPackageFilePath) {
        socket.emit("message", {
            type: "loadplugin",
            pluginPath: pluginPackageFilePath
        });
    }
    openBuffer(path, line, column) {
        line = line || 0;
        column = column || 0;
        this._rawExec("electrify#command#gotofile('" + path + "', " + line + ", " + column + ")");
    }
    rawExec(command) {
        this._rawExec(command);
    }
    echo(msg) {
        this._rawExec("electrify#command#echo('" + msg + "')");
    }
    echohl(msg, highlightGroup) {
        this._rawExec("electrify#command#echohl('" + msg + "', '" + highlightGroup + "')");
    }
    setSyntaxHighlighting(syntaxHighlightingInfo) {
        this._rawExec("electrify#syntax#setKeywordHighlighting('" + JSON.stringify(syntaxHighlightingInfo) + "')");
    }
    clearErrors(key) {
        this._rawExec("electrify#errors#clear('" + key + "')");
    }
    setErrors(key, errors) {
        this._rawExec("electrify#errors#set('" + key + "', '" + JSON.stringify(errors) + "')");
    }
    setLocationList(locations) {
        this._rawExec("electrify#list#setloclist('" + JSON.stringify(locations) + "')");
    }
    setQuickFixList(locations) {
        this._rawExec("electrify#list#setqflist('" + JSON.stringify(locations) + "')");
    }
    _rawExec(command) {
        if (command.indexOf("\n") >= 0) {
            console.warn("Command contains newlines. Please ensure newlines are escaped.");
            command = command.split("\n").join(" ");
        }
        var commandToSend = {
            type: "command",
            command: command
        };
        socket.emit("message", commandToSend);
    }
    _executeEvent(command) {
        var eventName = command.eventName;
        this.emit(eventName, command.callContext);
    }
    _executeCommand(command) {
        var commandName = command.command;
        if (commandName === "evalresult") {
            this._onEvalResult(command);
        }
        else {
            this._commandNameToFunction[commandName](command.callContext);
        }
    }
    _onBufferChanged(bufferChangeInfo) {
        console.log("Received file update: " + bufferChangeInfo.lines.length + " lines.");
        var newContent = bufferChangeInfo.lines.join(os.EOL);
        var args = {};
        Object.assign(args, bufferChangeInfo);
        delete args.lines;
        args.newContents = newContent;
        this.emit("BufferChanged", args);
    }
    _onEvalResult(command) {
        var seqNumber = command.callContext.seq;
        console.log("Got eval result");
        if (this._evalCallbacks[seqNumber]) {
            this._evalCallbacks[seqNumber](null, command.callContext.returnValue);
            this._evalCallbacks[seqNumber] = null;
        }
    }
    _handleCommand(command) {
        if (command) {
            if (command.type === "execute")
                this._executeCommand(command);
            else if (command.type === "event")
                this._executeEvent(command);
            else if (command.type === "bufferChanged")
                this._onBufferChanged(command.arguments);
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Vim;
