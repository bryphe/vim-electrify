var fs = require("fs");
vim.addCommand("SourceJS", (context) => {
    var sourceFile = context.currentBuffer;

    if (context.qargs) {
        sourceFile = context.qargs;
    }

    if (fs.existsSync(sourceFile)) {
        // Need to clear cache, to continually reload
        // See stackoverflow:
        // http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate

        delete require.cache[require.resolve(sourceFile)];
        require(sourceFile);
    }
});
