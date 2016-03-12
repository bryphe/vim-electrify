import childProcess = require("child_process");
import path = require("path");

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

        // Get absolute path to plugin
        var pluginWorkingDirectory = path.resolve(path.dirname(this._pluginPath));

        // Get api path
        var apiPath = path.resolve(path.join(__dirname, "..", "api", "index.js"));

        // Get plugin shim path
        var pluginShimPath = path.resolve(path.join(__dirname, "..", "plugin-shim-process", "index.js"));

        // TODO: The spawn window is flashing very quickly. Previously, with exec, it was staying open, so this is an improvement... but still needs to be addressed.
        // Instead of a separate process - maybe we could use the 'cluster' module?
        this._pluginProcess = childProcess.spawn("node",  [pluginShimPath, "--apipath="+apiPath, "--pluginpath=" + this._pluginPath, "--servername=" + this._gvimServerName, "--pluginname=" + this._pluginName], { cwd: pluginWorkingDirectory, detached: true });
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

    public startOmniComplete(omniCompletionArgs: any): void {
        var commandInfo = {
            type: "omnicomplete",
            arguments: omniCompletionArgs
        };

        if(this._pluginProcess)
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
