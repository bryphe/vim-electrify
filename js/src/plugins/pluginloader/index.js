var fs = require("fs");
var path = require("path");

vim.eval("&runtimepath", function (err, result) {

    var runtimePaths = result.split(",");

    runtimePaths.forEach((runtimePath) => {
        var packageJsonPath = path.join(runtimePath, "package.json");

        if (fs.existsSync(packageJsonPath)) {
            vim.loadPlugin(packageJsonPath);
        }
    });
});