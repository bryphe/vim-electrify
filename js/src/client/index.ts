var argv = require("minimist")(process.argv.slice(2));
var path = require("path");
console.dir(argv);
var childProcess = require("child_process");
var HTTP = require("q-io/http");
var log = require("winston");

var port = argv.port || 3000;
// Handle start process
if(argv.start) {

    HTTP.request(getBaseUrl())
        .then((response) => {
            // TODO: Validate proper schema
            console.log("Server up-and-running");
        }, (err) => {
            console.log("Server not up, starting")
            startServer(port);
        });
} else if(argv.stop) {
    HTTP.request({url: getBaseUrl() + "/api/stop", method: "POST"})
        .then((response) => {
            console.log("Server closing");
        }, (error) => console.log("Error closing server: " + error));
}

if(argv.loadPlugin) {
    var serverName = argv.servername;
    var pluginName = argv.loadPlugin;
    var jsfile = argv.path;

    HTTP.request({url: getBaseUrl() + "/api/vim/start/" + serverName + "/" + pluginName, body: [JSON.stringify({path: argv.path})], headers: { "Content-Type": "application/json" }, method: "POST"});
} else if(argv.exec) {
    var serverName = argv.servername;
    var pluginName = argv.plugin;
    var commandName = argv.command;
    var state = getState();

    HTTP.request({url: getBaseUrl() + "/api/vim/exec/" + serverName + "/" + pluginName + "/" + commandName, body: [JSON.stringify(state)], headers: { "Content-Type": "application/json" }, method: "POST"});
} else if(argv.event) {
    var serverName = argv.servername;
    var eventName = argv.event;
    var state = getState();
    
    HTTP.request({url: getBaseUrl() + "/api/vim/event/" + serverName + "/" + eventName, body: JSON.stringify(state), headers: { "Content-Type": "application/json"}, method: "POST"});
}

function getState(): any { 
    var state = JSON.parse(argv.state.split("'").join('"'));
    console.log(state);

}

function getBaseUrl(): string {
    return "http://localhost:" + port;
}

function startServer(port): void {
    var serverPath = path.join(__dirname, "../server/index.js");
    var child = childProcess.spawn("node", [serverPath, "--port=" + port], { detached: true, cwd: path.join(__dirname, "../server"), stdio: ['ignore', 'ignore', 'ignore']});
    child.on("error", (err) => {
        console.log(err);
    });
    console.log("Server process started: " + child.pid);
    child.unref();
}




