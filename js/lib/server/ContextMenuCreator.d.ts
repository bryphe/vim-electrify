import SessionManager from "./SessionManager";
export default class ContextMenuCreator {
    private _trayMenu;
    private _sessionManager;
    constructor(tray: Electron.Tray, sessionManager: SessionManager);
    private _rebuildContextMenu();
}
