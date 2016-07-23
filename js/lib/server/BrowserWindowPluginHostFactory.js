"use strict";
const BrowserWindowPluginHost_1 = require("./BrowserWindowPluginHost");
class BrowserWindowPluginHostFactory {
    constructor(io, port) {
        this._channel = 0;
        this._io = io;
        this._port = port;
    }
    createPluginHost() {
        this._channel++;
        return new BrowserWindowPluginHost_1.default(this._io, this._port, this._channel);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrowserWindowPluginHostFactory;
