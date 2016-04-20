import childProcess = require("child_process");
import path = require("path");
import readline = require("readline");
import log = require("./log")
import minimatch = require("minimatch");

var colors = require("colors/safe");

import IPluginConfiguration = require("./IPluginConfiguration");

export default class Plugin {

    private _pluginPath: string;
    private _pluginName: string;
    private _pluginProcess: childProcess.ChildProcess;
    private _gvimServerName: string;
    private _rl: any;
    private _config: IPluginConfiguration = null;

    public get process(): childProcess.ChildProcess {
        return this._pluginProcess;
    }

    public get pluginName(): string {
        return this._pluginName;
    }

    public get pluginPath(): string {
        return this._pluginPath;
    }

    constructor(gvimServerName: string, pluginName: string, pluginPath: string, config: IPluginConfiguration) {
        this._gvimServerName = gvimServerName;
        this._pluginName = pluginName;
        this._pluginPath = pluginPath;
        this._config = config;
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
        this._pluginProcess = childProcess.spawn("node", [pluginShimPath, "--apipath=" + apiPath, "--pluginpath=" + this._pluginPath, "--servername=" + this._gvimServerName, "--pluginname=" + this._pluginName], { cwd: pluginWorkingDirectory, detached: true });

        log.info("Plugin created: " + this._pluginName + " | " + this._pluginProcess.pid);
        log.info("-- Path: " + this._pluginPath);
        log.info("-- Working directory: " + pluginWorkingDirectory);

        this._rl = readline.createInterface({
            input: this._pluginProcess.stdout,
            output: this._pluginProcess.stdin
        });

        this._pluginProcess.stderr.on("data", (data, err) => {
            this._pluginProcess = null;
            log.error("Error from process: " + data + "|" + err);
        });

        this._rl.on("line", (msg) => {
            var data = null;
            try {
                data = JSON.parse(msg);
            } catch (ex) {
                log.error(ex);
            }

            if (data && data.type) {
                if (data.type == "command") {

                    var command = data.command.split("\"").join("\\\"");
                    log.verbose("got command: " + command);
                    try {
                        var vimProcess = childProcess.spawn("vim", ["--servername", this._gvimServerName, "--remote-expr", command], { detached: true, stdio: "ignore" });
                    }
                    catch (ex) {
                        log.error("[" + colors.cyan(this._pluginName) + "|" + colors.yellow(this._pluginProcess.pid) + "|Exception]" + ex);
                    }
                    return;
                } else if (data.type == "log") {
                    var logLevel = data.logLevel || "warn";
                    log[logLevel]("[" + colors.cyan(this._pluginName) + "|" + colors.yellow(this._pluginProcess.pid) + "]" + data.msg);
                    return;
                }
            }

            log.error(colors.red("UNHANDLED MESSAGE: " + msg));
        });

        this._pluginProcess.on("exit", () => {
            this._pluginProcess = null;
            log.error("process disconnected");
        });
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        log.verbose(this._pluginName + ": firing event - " + eventName + "|" + JSON.stringify(eventArgs));

        var commandInfo = {
            type: "event",
            eventName: eventName,
            callContext: eventArgs
        };

        this._writeToPlugin(commandInfo, eventArgs.currentBuffer);
    }

    public startOmniComplete(omniCompletionArgs: any): void {
        var commandInfo = {
            type: "omnicomplete",
            arguments: omniCompletionArgs
        };

        this._writeToPlugin(commandInfo, omniCompletionArgs.currentBuffer);
    }

    public updateOmniComplete(updateOmniCompletionArgs: any): void {
        var commandInfo = {
            type: "omnicomplete-update",
            arguments: updateOmniCompletionArgs
        };

        this._writeToPlugin(commandInfo, updateOmniCompletionArgs.currentBuffer);
    }

    public execute(commandName: string, callContext: any) {
        var commandInfo = {
            type: "execute",
            command: commandName,
            callContext: callContext
        };
        this._writeToPlugin(commandInfo, callContext.currentBuffer);
    }

    private _writeToPlugin(command: any, bufferName: string): void {
        if (this._pluginProcess) {

            if (this._isCommandHandled(bufferName)) {
                this._pluginProcess.stdin.write(JSON.stringify(command));
            } else {
                log.info("Command ignored for buffer: " + bufferName);
            }
        }
    }

    private _isCommandHandled(bufferName: string): boolean {
        if (!bufferName)
            return false;

        if (this._config.supportedFiles) {
            var anyMatches = false;

            var matches = this._config.supportedFiles.filter((fileFilter) => minimatch(bufferName, fileFilter, { matchBase: true }));
            return matches.length > 0;
        } else {
            return true;
        }
    }

}
