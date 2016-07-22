import * as events from "events";
export interface IPluginHost extends events.EventEmitter {
    start(gvimServerName: string, pluginName: string, pluginPath: string): void;
    sendCommand(command: string): void;
    showDevTools(): void;
    hideDevTools(): void;
    dispose(): void;
}
