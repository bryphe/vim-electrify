var fs = require("fs");
vim.addCommand("SourceJS", (context) => {
    handleSourceCommand(context);
});

vim.addCommand("SoJS", (context) => {
    handleSourceCommand(context);
});

function handleSourceCommand(context) {
    var sourceFile = context.currentBuffer;

    if (context.qargs) {
        sourceFile = context.qargs;
    }

    if (fs.existsSync(sourceFile)) {
        // Need to clear cache, to continually reload
        // See stackoverflow:
        // http://stackoverflow.com/questions/9210542/node-js-require-cache-possible-to-invalidate

        try {
            delete require.cache[require.resolve(sourceFile)];
            require(sourceFile);
        } catch (ex) {
            vim.echohl("SourceJS - Error: " + ex.toString(), "Error");
        }
    }
}
