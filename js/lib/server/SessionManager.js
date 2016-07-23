"use strict";
const Session_1 = require("./Session");
const events_1 = require("events");
var SessionStartEvent = "start";
var SessionEndEvent = "end";
class SessionManager extends events_1.EventEmitter {
    constructor(commandExecutor, pluginHostFactory) {
        super();
        this._sessions = {};
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHostFactory;
    }
    getSessions() {
        return Object.keys(this._sessions).map((k) => (this._sessions[k]));
    }
    getOrCreateSession(sessionName) {
        if (this._sessions[sessionName]) {
            console.log("Session exists: " + sessionName);
            return this._sessions[sessionName];
        }
        console.log("Creating new session: " + sessionName);
        var newSession = new Session_1.default(sessionName, this._commandExecutor, this._pluginHostFactory);
        this._sessions[sessionName] = newSession;
        this.emit(SessionStartEvent, newSession);
        return newSession;
    }
    getSession(sessionName) {
        if (!this._sessions[sessionName]) {
            return null;
        }
        return this._sessions[sessionName];
    }
    endSession(sessionName) {
        console.log("Deleting session: " + sessionName);
        if (this._sessions[sessionName]) {
            var session = this._sessions[sessionName];
            this.emit(SessionEndEvent, session);
            session.dispose();
            session = null;
            delete this._sessions[sessionName];
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionManager;
