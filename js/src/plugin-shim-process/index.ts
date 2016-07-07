/**
 * Plugin-Shim-Process
 *
 * This brings 'Vim' into the global scope, and
 * then loads the plugin code
 */
import fs = require("fs");
var argv = global["browserArgs"];

var serverName = argv.servername;
var pluginName = argv.pluginname;
var apiPath = argv.apipath;
var pluginPath = argv.pluginpath;

process.chdir(argv.cwd);

var Vim = require(apiPath);
global["vim"] = new Vim.default(serverName, pluginName);
var replacementConsole = new Vim.Log(console);
global["log"] = replacementConsole;

require(pluginPath);
