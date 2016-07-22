import { IPluginHost } from "./IPluginHost";
import { IPluginHostFactory } from "./IPluginHostFactory";
export default class BrowserWindowPluginHostFactory implements IPluginHostFactory {
    private _io;
    private _port;
    private _channel;
    constructor(io: any, port: number);
    createPluginHost(): IPluginHost;
}
