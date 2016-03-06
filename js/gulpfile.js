var path = require("path");
var gulp = require("gulp");
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var ts = require("gulp-typescript");

var serverTsConfigPath = path.join(__dirname, "src/server/tsconfig.json");
var clientTsConfigPath = path.join(__dirname, "src/client/tsconfig.json");

var tsServerProject = ts.createProject(serverTsConfigPath);
var tsClientProject = ts.createProject(clientTsConfigPath);

gulp.task("build:server", function () {
    var tsResult = tsServerProject.src()
        .pipe(ts(tsServerProject));

    return tsResult.js.pipe(gulp.dest(path.join(__dirname, "lib/server")));
});

gulp.task("build:client", function () {
    var tsResult = tsClientProject.src()
        .pipe(ts(tsClientProject));

    return tsResult.js.pipe(gulp.dest(path.join(__dirname, "lib/client")));

});

gulp.task("start-server", function(cb) {
    var child = exec("npm run start-server");
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    cb();
});

gulp.task("build", gulp.parallel("build:server", "build:client"));
gulp.task("default", gulp.series("build", "start-server"));

sourceWatcher = gulp.watch("src/**/*.ts", gulp.series("build", "start-server"));
sourceWatcher.on("change", function () {
    console.log("Stopping existing server session");
    execSync("npm run stop-server");
    console.log("Stopping server complete.");
});
