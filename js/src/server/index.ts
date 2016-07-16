import * as Electron from "electron";

const shouldQuit = Electron.app.makeSingleInstance((commandLine, workingDirectory) => {
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

var program = require("commander");

program
    .option("-t, --tcpPort <n>", "The tcp port to use for vim <-> electrify")
    .option("-w, --wsPort <n>", "The websocket port to use for electrify <-> js plugins")
    .parse(process.argv);

console.log("Using tcp port: " + program.tcpPort);
console.log("Using ws port: " + program.wsPort);

require("colors").enabled = true;

import SessionManager from "./SessionManager"
import CommandLineRemoteCommandExecutor from "./Commands/CommandLineRemoteCommandExecutor"
import TcpSocketRemoteCommandExecutor from "./Commands/TcpSocketRemoteCommandExecutor"

// TCP Server
var serverToSocket = {};
var sessionManager;

var tcpServer = net.createServer((tcpSocket) => {
    console.log("tcp: client connected");

    var session = null;
    var currentBuffer = "";

    tcpSocket.on("data", (data) => {
        var dataAsString = data.toString("utf8");

        console.log("tcp: received data of length: " + dataAsString.length + "|" + currentBuffer);
        currentBuffer += dataAsString;

        if(currentBuffer.indexOf("\n") == -1)
            return;

        var parsedData = null;
        try {
            parsedData = JSON.parse(currentBuffer);
            currentBuffer = "";
        } catch(ex) {
            currentBuffer = "";
            console.error("tcp: error parsing data: " + ex.toString(), { error: ex});
        }

        if(parsedData.type === "connect") {
            console.log("Got connect event - registering server: " + parsedData.args.serverName);
            session = sessionManager.getOrCreateSession(parsedData.args.serverName);
            serverToSocket[session.name] = tcpSocket;
        } else if(parsedData.type === "event") {
            var eventName = parsedData.args.eventName;
            var context = parsedData.context;
            console.log("Got event: " + eventName);
            session.notifyEvent(eventName, context)

            if(eventName === "VimLeave") {
                end();
            }
        } else if(parsedData.type === "command") {
            var plugin = parsedData.args.plugin;
            var command = parsedData.args.command;
            var context = parsedData.context;

            console.log("Got command: " + command);

            var plugin = session.plugins.getPlugin(plugin);
            plugin.execute(command, context);
        } else if(parsedData.type === "bufferChanged") {
            var bufferName = parsedData.args.bufferName;
            var lines = parsedData.args.lines;
            console.log(JSON.stringify(lines));

            console.log("BufferChanged: " + bufferName + "| Lines: " + lines.length);
            session.plugins.onBufferChanged(parsedData.args);
        }
    });

    tcpSocket.on("close", () => {
        console.log("tcp: close");
        end();
    });

    tcpSocket.on("error", (err) => {
        console.log("tcp: disconnect");
        end();
    });

    function getServerName() {
        console.log("No session... requesting connect.");
        tcpSocket.write("electrify#tcp#sendConnectMessage()\n");
    }

    function end() {
        if(session) {
            sessionManager.endSession(session.name);
            session = null;
        }
    }

});

tcpServer.listen(program.tcpPort, "127.0.0.1");

var commandExecutor = new TcpSocketRemoteCommandExecutor(serverToSocket);
sessionManager = new SessionManager(io, commandExecutor, program.wsPort);

io.on("connection", (socket) => {
    console.log("A socket connected.");

    socket.on("room", (room) => {
        console.log("Socket joining room: " + room);
        socket.join(room);
    });

});

process.on("error", (err) => {
    console.log("error: ", err);
});

process.on("uncaughtException", (err) => {
    console.log("error: ", err);
});

server.listen(program.wsPort);
console.log("Server up-and-running|" + process.pid);

import ContextMenuCreator from "./ContextMenuCreator";

let appIcon = null;
Electron.app.on('ready', () => {
  appIcon = new Electron.Tray(path.join(__dirname, "..", "assets", "32x32.png"));
  var contextMenuCreator = new ContextMenuCreator(appIcon, sessionManager);
});

