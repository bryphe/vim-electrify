import childProcess = require("child_process");
import events = require("events");

export default class Vim extends events.EventEmitter {

    private _serverName: string;
    private _commandNameToFunction = {};
    private _pluginName: string;

    constructor(serverName: string, pluginName: string) {
        super();
        this._serverName = serverName;
        this._pluginName = pluginName;

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
        console.log("_rawExec: " + command);
        command = command.split("\"").join("\\\"");
        var vimProcess = childProcess.spawn("vim", ["--servername", this._serverName, "--remote-expr", command], { detached: true, stdio: "ignore"});
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

    private _startOmniCompletion(command: any): void {
        console.log("API: Got omnicompletion request: " + JSON.stringify(command));
        this._rawExec("extropy#js#completeAdd('" + JSON.stringify([{word: "alpha"}, {word: "beta"}, {word:"derp"}]) + "')");
        setTimeout(() => {
            this._rawExec("extropy#js#completeEnd()");
        }, 1000);
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
                this._startOmniCompletion(command);
        }
    }
}
