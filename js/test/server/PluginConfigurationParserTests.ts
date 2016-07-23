import * as PluginConfigurationParser from "../../lib/server/PluginConfigurationParser";

import * as assert from "assert";
import * as events from "events";

describe("PluginConfigurationParser", () => {
    it("Uses default config, if not specified", () => {

        var nullConfig = { };

        var resolvedConfig = PluginConfigurationParser.getVimConfig(nullConfig);

        assert.deepEqual(resolvedConfig.supportedFiles, ["*"]);
        assert.deepEqual(resolvedConfig.supportedFileTypes, ["*"]);
    });

    it("Gets config from 'electrify' node", () => {
        var config = {
            electrify: {
                supportedFiles: ["*.ts"],
                supportedFileTypes: ["typescript"]
            }
        };

        var resolvedConfig = PluginConfigurationParser.getVimConfig(config);

        assert.deepEqual(resolvedConfig, {
            supportedFiles: ["*.ts"],
            supportedFileTypes: ["typescript"]
        });
    });
});

