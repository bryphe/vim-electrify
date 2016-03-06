import childProcess = require("child_process");
import events = require("events");

var argv = require("minimist")(process.argv.slice(2));

class Vim extends events.EventEmitter {

    private _serverName: string;
    private _commandNameToFunction = {};
    private _pluginName: string;

    constructor(serverName?: string, pluginName?: string) {
        super();
        this._serverName = serverName || this._getServerNameFromArgs();
        this._pluginName = pluginName || this._getPluginNameFromArgs();

        console.log("vim driver: servername" + this._serverName + " " + this._pluginName);

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
        console.log("Registering command: " + name);
        this._commandNameToFunction[name] = callbackFunction;

        this._rawExec("extropy#js#createCommand('" + this._pluginName + "', '" + name + "')")
    }

    public exec(command: string) {
        this._rawExec("extropy#js#execute('" + command + "')");
    }

    public echo(msg: string): void {
        this._rawExec("extropy#js#echo('" + msg + "')");
    }

    private _rawExec(command: string) {

        var vimProcess = childProcess.exec("vim --servername " + this._serverName + " --remote-expr \"" +command + "\"");
    }

    private _getServerNameFromArgs(): string {
        return argv.servername;
    }

    private _getPluginNameFromArgs(): string {
        return argv.pluginname || "unnamedplugin";
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
        }
    }
}

export = Vim;


