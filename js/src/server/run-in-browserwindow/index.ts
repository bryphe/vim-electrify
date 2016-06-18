var path = require("path");
import * as Electron from "electron";

export default function(pathToModule: string, args?: any) {
    var browserWindow = new Electron.BrowserWindow({width: 800, height: 600, show: false});
    browserWindow["__extropy_data__"] = {
        pathToModule: pathToModule,
        args: args
    };
    
    var url = path.join(__dirname, "index.html");
    browserWindow.loadURL(url);
    browserWindow.show();
    browserWindow.webContents.openDevTools();
}
