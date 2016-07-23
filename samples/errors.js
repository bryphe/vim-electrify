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

vim.addCommand("ErrorSource1", function(context) {
    vim.setErrors("errorSource1Key", [{
        fileName: context.currentBuffer,
        lineNumber: 5,
        startColumn: 5,
        endColumn: 10,
        type: "1",
        text: "error from source 1"
    }, {
        fileName: context.currentBuffer,
        lineNumber: 6,
        startColumn: 6,
        endColumn: 16,
        type: "2",
        text: "error from source 2"
    }]);
});

vim.addCommand("ErrorSource2", function(context) {
    vim.setErrors("errorSource2Key", [{
        fileName: context.currentBuffer,
        lineNumber: 15,
        startColumn: 10,
        endColumn: 11,
        type: "1",
        text: "error from source 2"
    }, {
        fileName: context.currentBuffer,
        lineNumber: 16,
        startColumn: 0,
        endColumn: 15,
        type: "2",
        text: "error from source 2"
    }]);
});

vim.addCommand("ClearErrorSource1", function(context) {
    vim.clearErrors("errorSource1Key");
});

vim.addCommand("ClearErrorSource2", function(context) {
    vim.clearErrors("errorSource2Key");
});

