import IPluginConfiguration = require("./IPluginConfiguration");

var defaultConfiguration = {
    supportedFiles: ["*.*"]
}

export = {

    getVimConfig: function (packageJsonObject: any): IPluginConfiguration {
        var config = packageJsonObject.vimConfig || defaultConfiguration;
        return config;
    }
};
