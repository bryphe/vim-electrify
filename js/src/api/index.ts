import childProcess = require("child_process");
import events = require("events");
import os = require("os");

import omni = require("./IOmniCompleter");

export default class Vim extends events.EventEmitter {

    private _serverName: string;
    private _commandNameToFunction = {};
    private _pluginName: string;

    private _omniCompleters: omni.IOmniCompleter[] = [];

    constructor(serverName: string, pluginName: string) {
        super();
        this._serverName = serverName;
        this._pluginName = pluginName;


        var stdin = (<any>process).openStdin();
        stdin.on("data",  (commandInfo) =>  {
            console.log("Got some data!: " + commandInfo);
            this._handleCommand(commandInfo);
        });
    }

    public get serverName(): string {
        return this._serverName;
    }

    public get pluginName(): string {
        return this._pluginName;
    }

    public addCommand(name: string, callbackFunction: Function): void {
        // console.log("Registering command: " + name);
        this._commandNameToFunction[name] = callbackFunction;

        this._rawExec("extropy#command#createCommand('" + this._pluginName + "', '" + name + "')")
    }

    public addOmniCompleter(omniCompleter: omni.IOmniCompleter): void {
        this._omniCompleters.push(omniCompleter);
    }

    public exec(command: string) {
        this._rawExec("extropy#command#execute('" + command + "')");
    }

    public echo(msg: string): void {
        this._rawExec("extropy#command#echo('" + msg + "')");
    }

    private _rawExec(command: string) {
        var commandToSend = {
            type: "command",
            command: command
        }
        this._sendCommand(commandToSend);
    }

    private _sendCommand(command: any) {
        // The other process listens on stdin
        console.log(JSON.stringify(command) + os.EOL);
    }

    private _executeEvent(command: any): void {
        var eventName = command.eventName;
        this.emit(eventName, command.callContext);
    }

    private _executeCommand(command: any): void {
        var commandName = command.command;
        console.log("Executing command (type: " + command.type + "): " + commandName)
        this._commandNameToFunction[commandName](command.callContext);
    }

    private _startOmniCompletion(omniInfo: any): void {
        console.log("API: Got omnicompletion request: " + JSON.stringify(omniInfo));
        var ret = [];
        this._omniCompleters.forEach((completer) => {
            ret = ret.concat(completer.getCompletions(omniInfo));
        });
        this._rawExec("extropy#omnicomplete#setCachedCompletion('" + JSON.stringify(ret) + "')");
    }

    private _updateOmniCompletion(omniInfo: any): void {
        console.log("API: Got omnicompletion update request: " + JSON.stringify(omniInfo));

        this._omniCompleters.forEach((completer) => {
            var newContent = omniInfo.lines.join(os.EOL);
            completer.onFileUpdate(omniInfo.currentBuffer, newContent);
        });
    }

    private _handleCommand(commandInfo: any): void {
        var command = null;
        try {
            command = JSON.parse(commandInfo);
        } catch(ex) { 
            console.log("Invalid data from server: " + commandInfo + "|" + ex);
        }
        
        if(command) {

            if(command.type === "execute")
                this._executeCommand(command);
            else if(command.type === "event")
                this._executeEvent(command);
            else if(command.type === "omnicomplete")
                this._startOmniCompletion(command.arguments);
            else if(command.type === "omnicomplete-update")
                this._updateOmniCompletion(command.arguments);
        }
    }
}

export class Log {
    public verbose(msg: string, properties: any): void {
        
        var commandToSend = {
            type: "log",
            logLevel: "verbose",
            msg: msg,
            properties: properties
        }
        console.log(JSON.stringify(commandToSend));
    }

    public error(msg: string, properties: any): void {

        var commandToSend = {
            type: "log",
            logLevel: "error",
            msg: msg,
            properties: properties
        }
        console.log(JSON.stringify(commandToSend));
    }
}
