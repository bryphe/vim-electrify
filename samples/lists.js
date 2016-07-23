/** * EXAMPLE: loclist/quickfixlist
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *      - Run ":TestLocList World"
 *      - Run ":lopen"
 *
 *      - Run "TestQuickFixList"
 *      - Run ":cw"
 */

vim.addCommand("TestLocList", function(context) {
    vim.setLocationList([{
        fileName: context.currentBuffer,
        lineNumber: 5,
        column: 5,
        text: "location 1"
    }, {
        fileName: context.currentBuffer,
        lineNumber: 6,
        column: 6,
        text: "location 2"
    }]);
});

vim.addCommand("TestQuickFixList", function(context) {
    vim.setQuickFixList([{
        fileName: context.currentBuffer,
        lineNumber: 5,
        column: 5,
        type: 1,
        text: "error 1"
    }, {
        fileName: context.currentBuffer,
        lineNumber: 6,
        column: 6,
        type: 2setLocationList,
        text: "error 2"
    }]);
});

