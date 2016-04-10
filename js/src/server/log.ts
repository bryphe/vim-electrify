var os = require("os");
var winston = require("winston");
var path = require("path");

var fileToLog = path.join(os.tmpdir(), "extropy_node_plugins_vim.log");
winston.add(winston.transports.File, { filename: fileToLog, level: "debug", options: {
    flags: "w"
}});

export = winston;


