import childProcess = require("child_process");

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
        if(this._pluginProcess)
            return;

        this._pluginProcess = childProcess.exec("node " + this._pluginPath + " --servername " + this._gvimServerName + " --pluginname " + this._pluginName);
        this._pluginProcess.stdout.on("data", (data, err) => {
            console.log("Got data from plugin process:" + data);
        });

        this._pluginProcess.stderr.on("data", (data, err) => {
            console.log("Error from process: " + data + "|" + err);
        });

        this._pluginProcess.on("message", (msg) => {
            console.log("got message!");
        });

        this._pluginProcess.on("exit", () => {
            console.log("process disconnected");
        });
    }

    public execute(commandName: string, callContext: any) {
        var commandInfo = {
            command: commandName,
            callContext: callContext
        };
        this._pluginProcess.stdin.write(JSON.stringify(commandInfo));
    }
}
