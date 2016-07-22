/**
 * EXAMPLE: Eval
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *
 *  This example uses runtimepath, but you can also check the values of global variables, for example:
 *  vim.eval("g:electrify_enabled", function(err, value) { ... );
 */

vim.eval("&runtimepath", function(err, value) {
    vim.echo(value);
});
