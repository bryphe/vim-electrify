import PluginManager from "./PluginManager";
export default class Session {
    private _session;
    private _pluginManager;
    constructor(session: string);
    readonly plugins: PluginManager;
    notifyEvent(eventName: string, eventArgs: any): void;
}
