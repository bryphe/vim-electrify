"use strict";
const PluginManager_1 = require("./PluginManager");
class Session {
    constructor(session, commandExecutor, pluginHostFactory) {
        this._session = session;
        this._commandExecutor = commandExecutor;
        this._pluginManager = new PluginManager_1.default(session, this._commandExecutor, pluginHostFactory);
    }
    get name() {
        return this._session;
    }
    get plugins() {
        return this._pluginManager;
    }
    notifyEvent(eventName, eventArgs) {
        this._pluginManager.notifyEvent(eventName, eventArgs);
    }
    dispose() {
        this._pluginManager.dispose();
        this._pluginManager = null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Session;
