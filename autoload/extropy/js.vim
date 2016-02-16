function! extropy#js#execute(command)
    echom 'hey2' . a:command
    :execute a:command
    :redraw
endfunction
