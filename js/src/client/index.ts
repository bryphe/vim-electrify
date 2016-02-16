var argv = require("minimist")(process.argv.slice(2));
var path = require("path");
console.dir(argv);
var childProcess = require("child_process");
var HTTP = require("q-io/http");

console.log("Hello world");

// Handle start process
if(argv.start) {
    var port = argv.port || 3000;

    HTTP.request("http://localhost:" + port)
        .then((response) => {
            // TODO: Validate proper schema
            console.log("Server up-and-running");
        }, (err) => {
            console.log("Server not up, starting")
            startServer(port);
        });
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




