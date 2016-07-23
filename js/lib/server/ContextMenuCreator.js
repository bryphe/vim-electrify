"use strict";
const Electron = require("electron");
class ContextMenuCreator {
    constructor(tray, sessionManager) {
        this._trayMenu = tray;
        this._sessionManager = sessionManager;
        sessionManager.on("start", (session) => {
            this._rebuildContextMenu();
        });
        this._rebuildContextMenu();
    }
    _rebuildContextMenu() {
        var contextMenu = new Electron.Menu();
        this._sessionManager.getSessions()
            .forEach((session) => {
            var subMenu = new Electron.Menu();
            session.plugins.getAllPlugins().forEach(plugin => {
                var subMenuItem = new Electron.MenuItem({
                    label: plugin.pluginName,
                    click: () => {
                        plugin.showDevTools();
                    } });
                subMenu.append(subMenuItem);
            });
            var sessionItem = new Electron.MenuItem({
                label: session.name,
                submenu: subMenu
            });
            contextMenu.append(sessionItem);
        });
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextMenuCreator;
