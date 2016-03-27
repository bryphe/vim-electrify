var express = require("express");
var app = express();
var os = require("os");
var path = require("path");
var log = require("winston");
var bodyParser = require("body-parser");

require("colors").enabled = true;

import SessionManager from "./SessionManager"

var sessionManager = new SessionManager();

// TODO: Handle creating session

app.use(bodyParser.json());

app.get("/", function (req, res) {
    res.send("Open for business");
});

app.post("/api/start/:serverName", (req, res) => {
    console.log(req.params.serverName);
    console.log(req.params.pluginName);
    console.log("-pre body");
    console.log(req.body);
    console.log("-post body");

    var session = sessionManager.getOrCreateSession(req.params.serverName);

    res.send("done");
});

app.post("/api/log", (req, res) => {
    console.log("[LOG]:" + JSON.stringify(req.body));
});

app.post("/api/plugin/:serverName/event/:eventName", (req, res) => {
    log.info(req.params);
    log.info(req.body);

    var eventName = req.params.eventName;

    var state = req.body;
    log.info("Received event: " + eventName + " data:" + JSON.stringify(state));
    var session = sessionManager.getOrCreateSession(req.params.serverName);
    session.notifyEvent(eventName, state)

    if(eventName === "VimLeave") {
        sessionManager.endSession(req.params.serverName);
    }

    res.send("done");
});

app.post("/api/plugin/:serverName/omnicomplete/start", (req, res) => {
    console.log("start omnicomplete");

    var body = req.body;

    var session = sessionManager.getOrCreateSession(req.params.serverName);
    session.plugins.startOmniComplete(body);

    res.send("done");
});

// Notify omnicompletion that a file has been updated
app.post("/api/plugin/:serverName/omnicomplete/update", (req, res) => {
    console.log("update omnicomplete");

    var body = req.body;

    var session = sessionManager.getOrCreateSession(req.params.serverName);
    session.plugins.updateOmniComplete(body);

    res.send("done");
});

app.post("/api/plugin/:serverName/:pluginName/:commandName", (req, res) => {
    log.info(req.params);
    log.info(req.body);

    var callContext = req.body;

    var session = sessionManager.getOrCreateSession(req.params.serverName);
    var plugin = session.plugins.getPlugin(req.params.pluginName);
    plugin.execute(req.params.commandName, callContext);

    res.send("done");
});

app.post("/api/stop", function(req, res) {
    console.log("stopping server");
    res.send("closing server.");
    process.exit();
});

app.listen(3000, function () {
    console.log("Listening on 3000");
});

console.log("Server up-and-running4");
