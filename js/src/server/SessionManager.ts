import Session from "./Session";

var log = require("winston");

export default class SessionManager {

    private _sessions = {};

    public getOrCreateSession(sessionName: string): Session {
        if(this._sessions[sessionName]) {
            log.info("Session exists: " + sessionName);
            return this._sessions[sessionName];
        }

        log.info("Creating new session: " + sessionName);
        var newSession = new Session(sessionName);
        this._sessions[sessionName] = newSession;
        return newSession;
    }
}
