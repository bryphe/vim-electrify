import PluginManager from "./PluginManager";

export default class Session {

    private _session: string;
    private _pluginManager: PluginManager;

    constructor(session: string, io: any) {
        this._session = session;
        this._pluginManager = new PluginManager(session, io);
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
