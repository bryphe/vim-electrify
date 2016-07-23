import TcpSocketInstance from "../../lib/server/TcpSocketInstance";
import SessionManager from "../../lib/server/SessionManager";
import {MockPluginHostFactory} from "./MockPluginHost";
import {MockCommandExecutor} from "./MockCommandExecutor";

import * as assert from "assert";
import * as events from "events";

class MockSocket extends events.EventEmitter {

}

describe("TcpSocketInstance", () => {
    it("creates a new session when receiving connect command", () => {
        var sessionManager = new SessionManager(new MockCommandExecutor(), new MockPluginHostFactory());
        var socket = <any>(new MockSocket());
        var tcpSocketInstance = new TcpSocketInstance(socket, sessionManager);

        var connectCommand = {
            type: "connect",
            args: {
                serverName: "test1"
            }
        };

        socket.emit("data", new Buffer(JSON.stringify(connectCommand), "utf8"))
        socket.emit("data", new Buffer("\n", "utf8"))

        assert.strictEqual(sessionManager.getSessions().length, 1);
    });
});
