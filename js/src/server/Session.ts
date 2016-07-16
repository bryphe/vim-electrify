import PluginManager from "./PluginManager";
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");

import {IPluginHostFactory} from "./IPluginHostFactory";

/**
 * Session is a 1 <-> 1 map with a VIM/GVIM session.
 * Each session has an associated set of active plugins.
 */
export default class Session {

    private _session: string;
    private _pluginManager: PluginManager;
    private _commandExecutor: IRemoteCommandExecutor;

    public get name(): string {
        return this._session;
    }

    constructor(session: string, commandExecutor: IRemoteCommandExecutor, pluginHostFactory: IPluginHostFactory) {
        this._session = session;
        this._commandExecutor = commandExecutor;
        this._pluginManager = new PluginManager(session, this._commandExecutor, pluginHostFactory);
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
