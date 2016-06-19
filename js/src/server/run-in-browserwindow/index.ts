var path = require("path");
import * as Electron from "electron";

// TODO: Change args to have the format as 
// {
//      cwd: string,
//      options: Electron.BrowserWindowOptions,
//      args: any[]
//}
export default function(pathToModule: string, args?: any): Electron.BrowserWindow {
    var browserWindow = new Electron.BrowserWindow({width: 800, height: 600, show: false});
    browserWindow["__extropy_data__"] = {
        pathToModule: pathToModule,
        args: args
    };
    
    var url = path.join(__dirname, "index.html");
    browserWindow.loadURL(url);
    return browserWindow;
}
