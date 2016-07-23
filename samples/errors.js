/**
 *  EXAMPLE: Errors
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *      - Run ":ErrorSource1"
 *      - Run ":ErrorSource2"
 *      - Run ":ClearErrorSource1"
 */

vim.addCommand("Errors", function(context) {
    vim.setLocationList([{
        filename: context.currentBuffer,
        lineNumber: 5,
        column: 5,
        type: "1",
        text: "location 1"
    }, {
        filename: context.currentBuffer,
        lineNumber: 6,
        column: 6,
        type: "2",
        text: "location 2"
    }]);
});

vim.addCommand("TestQuickFixList", function(context) {
    vim.setLocationList([{
        filename: context.currentBuffer,
        lineNumber: 5,
        column: 5,
        type: "1",
        text: "error 1"
    }, {
        filename: context.currentBuffer,
        lineNumber: 6,
        column: 6,
        type: "2",
        text: "error 2"
    }]);
});

