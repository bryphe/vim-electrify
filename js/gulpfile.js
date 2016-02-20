var path = require("path");
var gulp = require("gulp");
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

gulp.task("build", gulp.parallel("build:server", "build:client"));
gulp.task("default", gulp.series("build"));

gulp.watch("src/**/*.ts", gulp.series("build"));
