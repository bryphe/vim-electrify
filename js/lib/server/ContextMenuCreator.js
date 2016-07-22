"use strict";
var Electron = require("electron");
var ContextMenuCreator = (function () {
    function ContextMenuCreator(tray, sessionManager) {
        var _this = this;
        this._trayMenu = tray;
        this._sessionManager = sessionManager;
        sessionManager.on("start", function (session) {
            _this._rebuildContextMenu();
        });
        this._rebuildContextMenu();
    }
    ContextMenuCreator.prototype._rebuildContextMenu = function () {
        var contextMenu = new Electron.Menu();
        this._sessionManager.getSessions()
            .forEach(function (session) {
            var subMenu = new Electron.Menu();
            session.plugins.getAllPlugins().forEach(function (plugin) {
                var subMenuItem = new Electron.MenuItem({
                    label: plugin.pluginName,
                    click: function () {
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
            click: function () {
                Electron.app.quit();
            }
        });
        contextMenu.append(menuItem);
        this._trayMenu.setToolTip('This is my application.');
        this._trayMenu.setContextMenu(contextMenu);
    };
    return ContextMenuCreator;
}());
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ContextMenuCreator;
