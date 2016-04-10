import fs = require("fs");

var argv = require("minimist")(process.argv.slice(2));

var serverName = argv.servername;
var pluginName = argv.pluginname;
var apiPath = argv.apipath;
var pluginPath = argv.pluginpath;

var Vim = require(apiPath);
global["vim"] = new Vim.default(serverName, pluginName);
var replacementConsole = new Vim.Log(console);
global["log"] = replacementConsole;
global["__realConsole"] = console;

var logLevels = [
    "log",
    "info",
    "verbose",
    "warn",
    "error",
    "debug"
];

logLevels.forEach((level) => {
    global["console"][level] = replacementConsole[level].bind(replacementConsole);
});

require(pluginPath);
