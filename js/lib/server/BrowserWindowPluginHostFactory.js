"use strict";
var BrowserWindowPluginHost_1 = require("./BrowserWindowPluginHost");
var BrowserWindowPluginHostFactory = (function () {
    function BrowserWindowPluginHostFactory(io, port) {
        this._channel = 0;
        this._io = io;
        this._port = port;
    }
    BrowserWindowPluginHostFactory.prototype.createPluginHost = function () {
        this._channel++;
        return new BrowserWindowPluginHost_1.default(this._io, this._port, this._channel);
    };
    return BrowserWindowPluginHostFactory;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BrowserWindowPluginHostFactory;
