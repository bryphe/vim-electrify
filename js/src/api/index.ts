import Promise = require("bluebird");
import childProcess = require("child_process");
import events = require("events");
import os = require("os");

import omni = require("./IOmniCompleter");

declare var log;

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
        };
        Command.sendCommand(commandToSend);
    }

    private _executeEvent(command: any): void {
        var eventName = command.eventName;
        this.emit(eventName, command.callContext);
    }

    private _executeCommand(command: any): void {
        var commandName = command.command;
        this._commandNameToFunction[commandName](command.callContext);
    }

    private _startOmniCompletion(omniInfo: any): void {
        log.verbose("Omnicompletion: starting");
        var promises = [];

        this._omniCompleters.forEach((completer) => {
            promises.push(completer.getCompletions(omniInfo));
        });

        Promise.all(promises).then((ret) => {

            var allSuggestions = [];
            ret = ret || [];
            ret.forEach(r => {
                allSuggestions = allSuggestions.concat(r);
            });
            log.verbose(JSON.stringify(ret));

            log.info("Omnicompletion: total values returned: " + allSuggestions.length);
            this._rawExec("extropy#omnicomplete#setCachedCompletion('" + JSON.stringify(allSuggestions) + "')");
        });
    }

    private _updateOmniCompletion(omniInfo: any): void {
            log.verbose("Omnicompletion: updating file: " + JSON.stringify(omniInfo));
            log.info("Received file update: " + omniInfo.lines.length + " lines.");

            var newContent = omniInfo.lines.join(os.EOL);

            log.verbose(newContent);

        this._omniCompleters.forEach((completer) => {
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

    private _console;
    constructor(console: any) {
        this._console = console;
    }

    public debug(msg: string, properties?: any): void {
        this._logCore(msg, "debug", properties);
    }

    public verbose(msg: string, properties?: any): void {
        this._logCore(msg, "verbose", properties);
    }

    public info(msg: string, properties?: any): void {
        this._logCore(msg, "info", properties);
    }

    public log(msg: string, properties?: any): void {
        this._logCore(msg, "info", properties);
    }

    public warn(msg: string, properties?: any): void {
        this._logCore(msg, "warn", properties);
    }

    public error(msg: string, properties?: any): void {
        this._logCore(msg, "error", properties);
    }
    
    private _logCore(msg: string, logLevel: string, properties?: any): void {
        
        var commandToSend = {
            type: "log",
            logLevel: logLevel,
            msg: msg,
            properties: properties
        }
        Command.sendCommand(commandToSend);
    }
}

export class Command {
    public static sendCommand(commandToSend: any): void {
        process.stdout.write(JSON.stringify(commandToSend) + os.EOL);
    }
}
