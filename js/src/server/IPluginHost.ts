import * as events from "events";

export interface IPluginHost extends events.EventEmitter {
    // Message event - sent from plugin to this class
    // Error event
    //

    start(gvimServerName: string, pluginName: string, pluginPath: string): void;

    /** 
     * Send a command to the plugin
     */
    sendCommand(command: string): void;

    showDevTools(): void;

    hideDevTools(): void;

    dispose(): void;
}
