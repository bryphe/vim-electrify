/**
 * EXAMPLE: Command
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *      - Run ":OpenGitHub" <-- this opens GitHub in a new window
 *      - Run ":OpenIpcExample SomeSampleTextToRender" <-- this opens a new window, with 'SomeSampleTextToRender" shown
 */

// For documentation on the BrowserWindow object, see:
// https://github.com/electron/electron/blob/master/docs/api/browser-window.md
const {BrowserWindow} = require("electron").remote;

// This shows a very basic BrowserWindow scenario - opening a URL.
vim.addCommand("OpenGitHub", function(context) {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL("https://github.com");
});

// This is a more advanced scenario - this uses an IPC channel
// to send data from the plugin -> BrowserWindow
vim.addCommand("OpenIPCExample", function(context) {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(`file://${__dirname}/browserwindow_ipc.html`);
    win.webContents.on("did-finish-load", () => {
        win.webContents.send("init", context.qargs);
    });
});
