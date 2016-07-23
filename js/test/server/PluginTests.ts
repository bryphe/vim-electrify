import * as assert from "assert";
import * as events from "events";

import {MockPluginHost, MockPluginHostFactory} from "./MockPluginHost";
import {MockCommandExecutor} from "./MockCommandExecutor";
import Plugin from "../../lib/server/Plugin";
import {IPluginConfiguration} from "../../lib/server/IPluginConfiguration";

describe("Plugin", () => {

    var mockCommandExecutor: MockCommandExecutor;
    var mockPluginHostFactory: MockPluginHostFactory;
    var serverName = "testServer1";
    var testPluginName = "testPlugin1";
    var testPluginPath = "\\testpluginpath";

    beforeEach(() => {
        mockCommandExecutor = new MockCommandExecutor();
        mockPluginHostFactory = new MockPluginHostFactory();
    });

    describe("configuration", () => {
        it("sends event if supportedFileType matches", () => {
            var config = {
                supportedFileType: ["testtype"]
            };

            var simulatedEventContext = {
                currentBuffer: "test1",
                filetype: "testtype"
            };

            var plugin = createPluginFromConfig(config);
            plugin.notifyEvent("testevent", simulatedEventContext);

            var mockHost = <MockPluginHost>plugin.pluginHost;
            assert.strictEqual(mockHost.getSentCommands().length, 1);
        });

        it("does not send event if supportedFileType doesn't match", () => {
            var config = {
                supportedFileTypes: ["testtype"]
            };

            var simulatedEventContext = {
                currentBuffer: "test1",
                filetype: "testanothertype"
            };

            var plugin = createPluginFromConfig(config);
            plugin.notifyEvent("testevent", simulatedEventContext);

            var mockHost = <MockPluginHost>plugin.pluginHost;
            assert.strictEqual(mockHost.getSentCommands().length, 0);
        });

        it("always sends event if supportedFileType/supportedFiles are not specified", () => {
            var config = { };

            var simulatedEventContext = {
                currentBuffer: "test1",
                filetype: "testtype"
            };

            var plugin = createPluginFromConfig(config);
            plugin.notifyEvent("testevent", simulatedEventContext);

            var mockHost = <MockPluginHost>plugin.pluginHost;
            assert.strictEqual(mockHost.getSentCommands().length, 1);
        });
    });

    function createPluginFromConfig(config: IPluginConfiguration): Plugin {
        var plugin = new Plugin(mockCommandExecutor, mockPluginHostFactory, serverName, testPluginName, testPluginPath, config);
        plugin.start();
        return plugin;
    }
});
