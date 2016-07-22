/**
 * EXAMPLE: Command
 *
 *  To run:
 *      - Load this file in VIM
 *      - Run ":SourceJS"
 *      - Run ":Test1 World"
 */

vim.addCommand("Test1", function(context) {
    vim.echo("Hello " + context.qargs + "!");
});
