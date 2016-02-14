var childProcess = require("child_process");

// console.log("test2");
var vimServerName = (process.argv[2]);
// var vimServerName = "GVIM";

var vimProcess = childProcess.exec("vim --servername " + vimServerName + " --remote-expr \"GetAsyncText('testing3')\"");

