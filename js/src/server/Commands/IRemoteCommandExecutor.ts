import Promise = require("bluebird");

/**
 * Interface describing executing remote commands for VIM
 */
interface IRemoteCommandExecutor {
    executeCommand(serverName: string, command: string): Promise<void>;
}

export = IRemoteCommandExecutor;
