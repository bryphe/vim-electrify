import * as events from "events";
import { IPluginHost } from "./IPluginHost";
export default class BrowserWindowPluginHost extends events.EventEmitter implements IPluginHost {
    private _io;
    private _nsp;
    private _port;
    private _channel;
    private _sockets;
    private _window;
    constructor(io: any, port: number, channel: number);
    start(gvimServerName: string, pluginName: string, pluginPath: string): void;
    sendCommand(command: string): void;
    showDevTools(): void;
    hideDevTools(): void;
    dispose(): void;
}
