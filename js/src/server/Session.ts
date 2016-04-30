import PluginManager from "./PluginManager";
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");

export default class Session {

    private _session: string;
    private _pluginManager: PluginManager;
    private _commandExecutor: IRemoteCommandExecutor;

    public get name(): string {
        return this._session;
    }

    constructor(session: string, io: any, commandExecutor: IRemoteCommandExecutor) {
        this._session = session;
        this._commandExecutor = commandExecutor;
        this._pluginManager = new PluginManager(session, io, this._commandExecutor);
    }

    public get plugins(): PluginManager {
        return this._pluginManager;
    }

    public notifyEvent(eventName: string, eventArgs: any) {
        this._pluginManager.notifyEvent(eventName, eventArgs);
    }

    public dispose(): void {
        this._pluginManager.dispose();
        this._pluginManager = null;
    }
}
