import Promise = require("bluebird");
export default class CommandLineRemoteCommandExecutor {
    executeCommand(serverName: string, command: string): Promise<void>;
}
