"use strict";
var defaultConfiguration = {};
function getVimConfig(packageJsonObject) {
    packageJsonObject = packageJsonObject || {};
    var electrifyConfig = packageJsonObject.electrify || {};
    var config = Object.assign({}, defaultConfiguration);
    Object.assign(config, electrifyConfig);
    return config;
}
exports.getVimConfig = getVimConfig;
