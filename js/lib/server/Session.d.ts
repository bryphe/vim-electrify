import PluginManager from "./PluginManager";
import IRemoteCommandExecutor = require("./Commands/IRemoteCommandExecutor");
import { IPluginHostFactory } from "./IPluginHostFactory";
export default class Session {
    private _session;
    private _pluginManager;
    private _commandExecutor;
    name: string;
    constructor(session: string, commandExecutor: IRemoteCommandExecutor, pluginHostFactory: IPluginHostFactory);
    plugins: PluginManager;
    notifyEvent(eventName: string, eventArgs: any): void;
    dispose(): void;
}
