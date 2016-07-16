/**
 * EXAMPLE: Omnicompleter
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *      - Create a new file 'test'
 *      - Run ":set filetype=test_file" 
 *      - Start typing - you'll see the omnicompletion occur
 */

var Promise = require("bluebird");

vim.omniCompleters.register("testomni", {
    getCompletions: function(eventContext) {
        return Promise.resolve({
            base: 0,
            line: eventContext.currentLine,
            items: [
                {word: "a", menu: "First letter"},
                {word: "b", menu: "Second letter"},
                {word: "c"},
                {word: "d"}
            ]
        });
    }
});

