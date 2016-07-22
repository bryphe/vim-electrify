"use strict";
var Electron = require("electron");
var shouldQuit = Electron.app.makeSingleInstance(function (commandLine, workingDirectory) {
    console.log("Tried to start second instance");
});
if (shouldQuit) {
    console.log("Second instance... quitting.");
    Electron.app.quit();
}
var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io")(server, { path: "/vim-node-plugins/socket.io" });
var os = require("os");
var path = require("path");
var net = require("net");
var SessionManager_1 = require("./SessionManager");
var TcpSocketRemoteCommandExecutor_1 = require("./Commands/TcpSocketRemoteCommandExecutor");
var TcpServer_1 = require("./TcpServer");
var ContextMenuCreator_1 = require("./ContextMenuCreator");
var BrowserWindowPluginHostFactory_1 = require("./BrowserWindowPluginHostFactory");
var program = require("commander");
program
    .option("-t, --tcpPort <n>", "The tcp port to use for vim <-> electrify")
    .option("-w, --wsPort <n>", "The websocket port to use for electrify <-> js plugins")
    .parse(process.argv);
console.log("Using tcp port: " + program.tcpPort);
console.log("Using ws port: " + program.wsPort);
require("colors").enabled = true;
var tcpServer = new TcpServer_1.default();
var commandExecutor = new TcpSocketRemoteCommandExecutor_1.default(tcpServer);
var pluginHostFactory = new BrowserWindowPluginHostFactory_1.default(io, program.wsPort);
var sessionManager = new SessionManager_1.default(commandExecutor, pluginHostFactory);
tcpServer.start(sessionManager, program.tcpPort);
io.on("connection", function (socket) {
    console.log("A socket connected.");
    socket.on("room", function (room) {
        console.log("Socket joining room: " + room);
        socket.join(room);
    });
});
process.on("error", function (err) {
    console.log("error: ", err);
});
process.on("uncaughtException", function (err) {
    console.log("error: ", err);
});
server.listen(program.wsPort);
console.log("Server up-and-running|" + process.pid);
var appIcon = null;
Electron.app.on('ready', function () {
    appIcon = new Electron.Tray(path.join(__dirname, "..", "assets", "32x32.png"));
    var contextMenuCreator = new ContextMenuCreator_1.default(appIcon, sessionManager);
});
