let s:logs = []

function! extropy#debug#openServerLogs()
    let logPath = expand("$TEMP") . "/extropy_node_plugins_vim.log"
    execute(":e " .logPath)
endfunction

function! extropy#debug#openLogs()
    execute(":new")
    :setlocal buftype=nofile
    :setlocal noswapfile
    for log in s:logs
        call append('$', [log.message])
    endfor
    :setlocal noma
    :setlocal ro
endfunction

function! extropy#debug#_log(level, msg)
    call add(s:logs, { 'level': a:level, 'message': a:msg})
endfunction

function! extropy#debug#logInfo(msg)
    call extropy#debug#_log(3, a:msg)
endfunction

