"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Session_1 = require("./Session");
var events_1 = require("events");
var SessionStartEvent = "start";
var SessionEndEvent = "end";
var SessionManager = (function (_super) {
    __extends(SessionManager, _super);
    function SessionManager(commandExecutor, pluginHostFactory) {
        _super.call(this);
        this._sessions = {};
        this._commandExecutor = commandExecutor;
        this._pluginHostFactory = pluginHostFactory;
    }
    SessionManager.prototype.getSessions = function () {
        var _this = this;
        return Object.keys(this._sessions).map(function (k) { return (_this._sessions[k]); });
    };
    SessionManager.prototype.getOrCreateSession = function (sessionName) {
        if (this._sessions[sessionName]) {
            console.log("Session exists: " + sessionName);
            return this._sessions[sessionName];
        }
        console.log("Creating new session: " + sessionName);
        var newSession = new Session_1.default(sessionName, this._commandExecutor, this._pluginHostFactory);
        this._sessions[sessionName] = newSession;
        this.emit(SessionStartEvent, newSession);
        return newSession;
    };
    SessionManager.prototype.getSession = function (sessionName) {
        if (!this._sessions[sessionName]) {
            return null;
        }
        return this._sessions[sessionName];
    };
    SessionManager.prototype.endSession = function (sessionName) {
        console.log("Deleting session: " + sessionName);
        if (this._sessions[sessionName]) {
            var session = this._sessions[sessionName];
            this.emit(SessionEndEvent, session);
            session.dispose();
            session = null;
            delete this._sessions[sessionName];
        }
    };
    return SessionManager;
}(events_1.EventEmitter));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SessionManager;
