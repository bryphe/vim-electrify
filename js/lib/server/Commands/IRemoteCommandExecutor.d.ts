import Promise = require("bluebird");
interface IRemoteCommandExecutor {
    executeCommand(serverName: string, command: string): Promise<void>;
}
export = IRemoteCommandExecutor;
