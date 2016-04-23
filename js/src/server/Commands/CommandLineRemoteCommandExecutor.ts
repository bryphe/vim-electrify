import Promise = require("bluebird");
import childProcess = require("child_process");
var log = require("./../log");

/**
 * Implementation of IRemoteCommandExecutor that uses the VIM command line
 *
 * Uses --remote-expr. The --remote-expr strategy seems unstable, because it
 * can cause intermittent crashes in the vim process.
 *
 * In addition, the command line has various limitations in terms of the size of the input strings.
 */
export default class CommandLineRemoteCommandExecutor {
    public executeCommand(serverName: string, command: string): Promise<void> {
        try {
            log.verbose("CommandLineRemoteCommandExecutor - executing command for server", { serverName: serverName, command: command });
            var vimProcess = childProcess.spawn("vim", ["--servername", serverName, "--remote-expr", command], { detached: true, stdio: "ignore" });
        }
        catch (ex) {
            log.error("Error executing command: " + ex);
        }
        return Promise.resolve();
    }
}
