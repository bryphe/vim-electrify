
function! extropy#debug#openLogs()
    let logPath = expand("$TEMP") . "/extropy_node_plugins_vim.log"
    execute(":e " .logPath)
endfunction

