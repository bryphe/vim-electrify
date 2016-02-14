var path = require("path");
var gulp = require("gulp");
var ts = require("gulp-typescript");

var serverTsConfigPath = path.join(__dirname, "src/server/tsconfig.json");

var tsProject = ts.createProject(serverTsConfigPath);

gulp.task("build:server", function () {
    var tsResult = tsProject.src()
        .pipe(ts(tsProject));

    return tsResult.js.pipe(gulp.dest(path.join(__dirname, "lib/server")));
});

gulp.task("default", ["build:server"]);
