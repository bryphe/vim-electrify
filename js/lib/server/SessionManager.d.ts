import Session from "./Session";
export default class SessionManager {
    private _sessions;
    getOrCreateSession(sessionName: string): Session;
    endSession(sessionName: string): void;
}
