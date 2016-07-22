"use strict";
var Promise = require("bluebird");
var childProcess = require("child_process");
var CommandLineRemoteCommandExecutor = (function () {
    function CommandLineRemoteCommandExecutor() {
    }
    CommandLineRemoteCommandExecutor.prototype.executeCommand = function (serverName, command) {
        try {
            console.log("CommandLineRemoteCommandExecutor - executing command for server", { serverName: serverName, command: command });
            var vimProcess = childProcess.spawn("vim", ["--servername", serverName, "--remote-expr", command], { detached: true, stdio: "ignore" });
        }
        catch (ex) {
            console.error("Error executing command: " + ex);
        }
        return Promise.resolve();
    };
    return CommandLineRemoteCommandExecutor;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CommandLineRemoteCommandExecutor;
