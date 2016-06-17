import * as Electron from "electron";
import SessionManager from "./SessionManager";

export default class ContextMenuCreator {

    private _trayMenu: Electron.Tray;
    private _sessionManager: SessionManager;

    constructor(tray: Electron.Tray, sessionManager: SessionManager) {
        this._trayMenu = tray;
        this._sessionManager = sessionManager;
        this._rebuildContextMenu();
    }

    private _rebuildContextMenu(): void {
      var contextMenu = new Electron.Menu();
      var menuItem = new Electron.MenuItem({
          label: "Quit",
          click: () => {
            Electron.app.quit();
          }
      });

      contextMenu.append(menuItem);
      
      this._trayMenu.setToolTip('This is my application.');
      this._trayMenu.setContextMenu(contextMenu);
    }
}
