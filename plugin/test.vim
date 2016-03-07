
if exists("g:loaded_vim_node_plugins") 
    finish

elseif !has("clientserver")
    echom "vim-node-plugins requires clientserver"
    finish
endif

call extropy#js#initializeEventListeners()
call extropy#js#start()

command! -nargs=+ AsyncHello call SendAsyncText(<q-args>)
command! -nargs=+ ExecuteCommandFromJavaScript call ExecuteCommand(<q-args>)
command! -nargs=+ Test call GetAsyncText(<q-args>)

function! SendAsyncText(hello_text)
    let temp_file = tempname()
    call xolox#misc#os#exec({"command": "node index.js " .v:servername, "async": 1})
endfunction

function! GetAsyncText(textFromCommandLine)
    call extropy#js#execute(a:textFromCommandLine)
endfunction

function! ExtropyExecute(command)
    call extropy#js#execute(a:command)
endfunction

set omnifunc=extropy#js#complete

"call xolox#misc#os#exec({"command": "node plugin/index.js"})
