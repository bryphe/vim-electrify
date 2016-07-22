import Session from "./Session";
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");
import { EventEmitter } from "events";
import { IPluginHostFactory } from "./IPluginHostFactory";
export default class SessionManager extends EventEmitter {
    private _sessions;
    private _commandExecutor;
    private _pluginHostFactory;
    constructor(commandExecutor: IRemoteCommandExecutor, pluginHostFactory: IPluginHostFactory);
    getSessions(): Session[];
    getOrCreateSession(sessionName: string): Session;
    getSession(sessionName: string): Session;
    endSession(sessionName: string): void;
}
