import fs = require("fs");

var argv = require("minimist")(process.argv.slice(2));

var serverName = argv.servername;
var pluginName = argv.pluginname;
var apiPath = argv.apipath;
var pluginPath = argv.pluginpath;

var Vim = require(apiPath);
global["vim"] = new Vim.default(serverName, pluginName);
global["log"] = new Vim.Log();

require(pluginPath);
