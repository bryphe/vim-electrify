/** * EXAMPLE: Command
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *      - Run ":TestLocList World"
 *      - Run ":ll"
 *
 *      - Run "TestQuickFixList"
 *      - Run ":cw"
 */

vim.addCommand("TestLocList", function(context) {
    vim.setLocationList([{
        filename: context.currentBuffer,
        lnum: 5,
        col: 5,
        text: "location 1"
    }, {
        filename: context.currentBuffer,
        lnum: 6,
        col: 6,
        text: "location 2"
    }]);
});

vim.addCommand("TestQuickFixList", function(context) {
    vim.setLocationList([{
        filename: context.currentBuffer,
        lnum: 5,
        col: 5,
        text: "error 1"
    }, {
        filename: context.currentBuffer,
        lnum: 6,
        col: 6,
        text: "error 2"
    }]);
});

