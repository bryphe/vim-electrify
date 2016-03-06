import childProcess = require("child_process");
var colors = require("colors/safe");


export default class Plugin {

    private _pluginPath: string;
    private _pluginName: string;
    private _pluginProcess: childProcess.ChildProcess;
    private _gvimServerName: string;

    constructor(gvimServerName: string, pluginName: string, pluginPath: string) {
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
    }

    public start(): void {
        if (this._pluginProcess)
            return;

        this._pluginProcess = childProcess.exec("node " + this._pluginPath + " --servername " + this._gvimServerName + " --pluginname " + this._pluginName);
        this._pluginProcess.stdout.on("data", (data, err) => {
            console.log("[" + colors.cyan(this._pluginName) + ":" + colors.green(this._gvimServerName) + "]" + data);
        });

        this._pluginProcess.stderr.on("data", (data, err) => {
            this._pluginProcess = null;
            console.log("Error from process: " + data + "|" + err);
        });

        this._pluginProcess.on("message", (msg) => {
            console.log("got message!");
        });

        this._pluginProcess.on("exit", () => {
            this._pluginProcess = null;
            console.log("process disconnected");
        });
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        console.log(this._pluginName + ": firing event - " + eventName + "|" + JSON.stringify(eventArgs));

        var commandInfo = {
            type: "event",
            eventName: eventName,
            callContext: eventArgs
        };

        if (this._pluginProcess)
            this._pluginProcess.stdin.write(JSON.stringify(commandInfo));
    }

    public execute(commandName: string, callContext: any) {
        var commandInfo = {
            type: "execute",
            command: commandName,
            callContext: callContext
        };
        if (this._pluginProcess)
            this._pluginProcess.stdin.write(JSON.stringify(commandInfo));
    }
}
