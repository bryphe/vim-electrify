/**
 * The TcpServer is used for integration between vim <-> electron
 * On the Vim side, there is a python TCP client listening to these messages,
 * and pushing data to the server.
 */

var net = require("net");

import SessionManager from "./SessionManager";

export default class TcpServer {
    private _serverToSocket = {};
    private _sessionManager: SessionManager;
    private _tcpServer: any;

    public start(sessionManager: SessionManager, port: number): void {
        this._tcpServer = this._createTcpServer();
        this._tcpServer.listen(port, "127.0.0.1");
        this._sessionManager = sessionManager;
    }

    public writeToSocket(serverName: string, data: string): void {
        return this._serverToSocket[serverName].write(data);
    }

    private _createTcpServer(): any {
        return net.createServer((tcpSocket) => {
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
                    session = this._sessionManager.getOrCreateSession(parsedData.args.serverName);
                    this._serverToSocket[session.name] = tcpSocket;
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
                    this._sessionManager.endSession(session.name);
                    session = null;
                }
            }

        });
    }
}

