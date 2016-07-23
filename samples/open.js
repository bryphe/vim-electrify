/**
 * EXAMPLE: openBuffer
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 */

var path = require("path");

vim.openBuffer(path.join(__dirname, "echo.js"), 5, 5);
