var path = require("path");
var gulp = require("gulp");
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var ts = require("gulp-typescript");

var tsProjects = [
    "server",
    "client",
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
});

var buildTasks = tsProjects.map(function (project) {
    return "build:" + project;
});
gulp.task("build", gulp.parallel(buildTasks));

gulp.task("start-server", function(cb) {
    var child = exec("npm run start-server");
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    cb();
});

gulp.task("default", gulp.series("build", "start-server"));

sourceWatcher = gulp.watch("src/**/*.ts", gulp.series("build", "start-server"));
sourceWatcher.on("change", function () {
    console.log("Stopping existing server session");
    execSync("npm run stop-server");
    console.log("Stopping server complete.");
});
