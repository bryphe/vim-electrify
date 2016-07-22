"use strict";
var PluginManager_1 = require("./PluginManager");
var Session = (function () {
    function Session(session, commandExecutor, pluginHostFactory) {
        this._session = session;
        this._commandExecutor = commandExecutor;
        this._pluginManager = new PluginManager_1.default(session, this._commandExecutor, pluginHostFactory);
    }
    Object.defineProperty(Session.prototype, "name", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Session.prototype, "plugins", {
        get: function () {
            return this._pluginManager;
        },
        enumerable: true,
        configurable: true
    });
    Session.prototype.notifyEvent = function (eventName, eventArgs) {
        this._pluginManager.notifyEvent(eventName, eventArgs);
    };
    Session.prototype.dispose = function () {
        this._pluginManager.dispose();
        this._pluginManager = null;
    };
    return Session;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Session;
