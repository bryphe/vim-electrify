"use strict";
const Promise = require("bluebird");
const childProcess = require("child_process");
class CommandLineRemoteCommandExecutor {
    executeCommand(serverName, command) {
        try {
            console.log("CommandLineRemoteCommandExecutor - executing command for server", { serverName: serverName, command: command });
            var vimProcess = childProcess.spawn("vim", ["--servername", serverName, "--remote-expr", command], { detached: true, stdio: "ignore" });
        }
        catch (ex) {
            console.error("Error executing command: " + ex);
        }
        return Promise.resolve();
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommandLineRemoteCommandExecutor;
