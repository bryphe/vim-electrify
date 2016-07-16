import { IPluginHost } from "./IPluginHost";
import { IPluginHostFactory } from "./IPluginHostFactory";
import BrowserWindowPluginHost from "./BrowserWindowPluginHost";

export default class BrowserWindowPluginHostFactory implements IPluginHostFactory {

    private _io: any;
    private _port: number;
    private _channel: number = 0;

    constructor(io: any, port: number) {
        this._io = io;
        this._port = port;
    }

    public createPluginHost(): IPluginHost {
        this._channel++;
        return new BrowserWindowPluginHost(this._io, this._port, this._channel);
    }
}
