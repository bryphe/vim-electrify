import fs = require("fs");

var argv = require("minimist")(process.argv.slice(2));

var serverName = argv.vimservername;
var pluginName = argv.pluginname;
var apiPath = argv.apipath;
var pluginPath = argv.pluginpath;

var Vim = require(apiPath);
var vim = new Vim.default(serverName, pluginName);

var pluginContents = fs.readFileSync(pluginPath, "utf8");
eval(pluginContents);

console.log("Plugin loaded.");
