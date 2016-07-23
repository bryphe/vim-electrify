import IPluginConfiguration = require("./IPluginConfiguration");

var defaultConfiguration: IPluginConfiguration = {
    supportedFiles: ["*"],
    supportedFileTypes: ["*"]
}

export function getVimConfig(packageJsonObject: any): IPluginConfiguration {
        packageJsonObject = packageJsonObject || { };
        var electrifyConfig = packageJsonObject.electrify || { };
        var config = Object.assign({}, defaultConfiguration)
        Object.assign(config, electrifyConfig);
        return config;
}
