import fs = require("fs");

var socket = require("socket.io-client")("http://localhost:3001");

socket.on("connect", () => {

});

socket.emit("test");

// var argv = require("minimist")(process.argv.slice(2));
var argv = global["browserArgs"];

var serverName = argv.servername;
var pluginName = argv.pluginname;
var apiPath = argv.apipath;
var pluginPath = argv.pluginpath;

// TODO:
// process.cwd(argv.cwd);

var Vim = require(apiPath);
global["vim"] = new Vim.default(serverName, pluginName);
var replacementConsole = new Vim.Log(console);
global["log"] = replacementConsole;

require(pluginPath);
