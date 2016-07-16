import TcpSocketInstance from "../../lib/server/TcpSocketInstance";
import SessionManager from "../../lib/server/SessionManager";

import * as assert from "assert";
import * as events from "events";

class MockCommandExecutor {

    public executeCommand(): Promise<void> {
        return Promise.resolve();
    }
}

class MockPluginHostFactory {


    public createPluginHost(): MockPluginHost {
        return new MockPluginHost();
    }
}

class MockPluginHost extends events.EventEmitter {

    public start(): void {

    }

    public sendCommand(): void {

    }

    public showDevTools(): void {

    }

    public hideDevTools(): void {

    }

    public dispose(): void {

    }
}

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
