"use strict";
var path = require("path");
var Electron = require("electron");
function default_1(pathToModule, args) {
    var browserWindow = new Electron.BrowserWindow({ width: 800, height: 600, show: false });
    browserWindow["__electrify_data__"] = {
        pathToModule: pathToModule,
        args: args
    };
    var url = path.join(__dirname, "index.html");
    browserWindow.loadURL(url);
    return browserWindow;
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
