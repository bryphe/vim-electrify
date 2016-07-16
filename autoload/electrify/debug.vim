" Debug.vim
"
" Debug utilities for logging purposes

let s:logs = []

function! electrify#debug#openLogs()
    execute(":new")
    :setlocal buftype=nofile
    :setlocal noswapfile
    for log in s:logs
        call append('$', [log.message])
    endfor
    :setlocal noma
    :setlocal ro
endfunction

function! electrify#debug#_log(level, msg)
    call add(s:logs, { 'level': a:level, 'message': a:msg."|".expand("%:p")})
endfunction

function! electrify#debug#logInfo(msg)
    call electrify#debug#_log(3, a:msg)
endfunction
