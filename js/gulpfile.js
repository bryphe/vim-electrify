var path = require("path");
var gulp = require("gulp");
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var ts = require("gulp-typescript");

var tsProjects = [
    "server",
    "api",
    "plugin-shim-process"
];

tsProjects.forEach(function (project) {

    var tsConfigPath = path.join(__dirname, "src", project, "tsconfig.json");
    var tsProject = ts.createProject(tsConfigPath);
    gulp.task("build:" + project, function () {
        var tsResult = tsProject.src()
            .pipe(ts(tsProject));

        return tsResult.js.pipe(gulp.dest(path.join(__dirname, "lib", project)));
    });

    gulp.task("install-typings:" + project, function (cb) {
        var typingsPath = path.join(__dirname, "node_modules", ".bin", "typings.cmd")
        var child = exec(typingsPath + " install", { cwd: path.join(__dirname, "src", project)});
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
        cb();
    });
});

gulp.task("copy:html", () => {
    return gulp.src(path.join(__dirname, "src", "server", "**", "*.html"))
        .pipe(gulp.dest(path.join(__dirname, "lib", "server")));
});
gulp.task("copy:assets", () => {
    return gulp.src(path.join(__dirname, "src", "assets", "**", "*.*"))
        .pipe(gulp.dest(path.join(__dirname, "lib", "assets")));
});

var buildTasks = tsProjects.map(function (project) {
    return "build:" + project;
});

buildTasks.push("copy:assets");
buildTasks.push("copy:html");

var typingsTasks = tsProjects.map(function (project) {
    return "install-typings:" + project
});

gulp.task("build", gulp.parallel(buildTasks));
gulp.task("install-typings", gulp.parallel(typingsTasks));

gulp.task("start-server", function(cb) {
    var child = exec("npm run start-server");
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    cb();
});

gulp.task("stop-server", function(cb) {
    var child = execSync("npm run stop-server");
    cb();
});

gulp.task("watch", function() {
    var serverWatcher = gulp.watch("src/server/**/*.ts", gulp.series(gulp.parallel("stop-server", "build:server"), "start-server"));
    serverWatcher.on("change", function (args) {
        console.log("change: " + JSON.stringify(args));
    });

    tsProjects.forEach(function (project) {
        if(project !== "server") {
            gulp.watch("src/" + project + "/**/*.ts", gulp.series("build:" + project));
        }
    });
});

gulp.task("default", gulp.series("stop-server", "install-typings", "build", "start-server", "watch"));
