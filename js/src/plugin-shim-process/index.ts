import fs = require("fs");

var socket = require("socket.io-client")("http://localhost:3001");

socket.on("connect", () => {

});

socket.emit("test");

var argv = require("minimist")(process.argv.slice(2));

var serverName = argv.servername;
var pluginName = argv.pluginname;
var apiPath = argv.apipath;
var pluginPath = argv.pluginpath;

var Vim = require(apiPath);
global["vim"] = new Vim.default(serverName, pluginName);
var replacementConsole = new Vim.Log(console);
global["log"] = replacementConsole;

require(pluginPath);
