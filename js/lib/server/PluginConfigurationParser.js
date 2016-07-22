"use strict";
var defaultConfiguration = {
    supportedFiles: ["*"]
};
module.exports = {
    getVimConfig: function (packageJsonObject) {
        var config = packageJsonObject.vimConfig || defaultConfiguration;
        return config;
    }
};
