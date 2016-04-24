import Promise = require("bluebird");
import childProcess = require("child_process");
var log = require("./../log");
var os = require("os");

/**
 * Implementation of IRemoteCommandExecutor that uses tcp sockes
 */
export default class TcpSocketRemoteCommandExecutor {
    private _nameToSocketMap: any;

    constructor(nameToSocketMap: any) {
        this._nameToSocketMap = nameToSocketMap;
    }

    public executeCommand(serverName: string, command: string): Promise<void> {
        if(!this._nameToSocketMap[serverName])
            return Promise.reject("socket not found for servername: " + serverName);

        this._nameToSocketMap[serverName].write("call " + command + "\n");
        return Promise.resolve();
    }
}
