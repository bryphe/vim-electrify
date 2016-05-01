let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\asyncwatcher.py'
execute 'pyfile '.s:path
" extropy#command
"
" Set of commands that the node-vim interop layer can call back into

python << EOF
extropy_command_asyncWatcher = None
EOF

function! extropy#command#execute(command)
    call extropy#debug#logInfo("Executing: ".a:command)
    :execute a:command
endfunction

function! extropy#command#echom(msg)
    call extropy#debug#logInfo("echom: ".a:msg)
    echom a:msg
endfunction

function! extropy#command#echo(msg)
    call extropy#debug#logInfo("echo: ".a:msg)
    echo a:msg
endfunction

function! extropy#command#echohl(msg, highlightGroup)
    call extropy#debug#logInfo("echohl: ".a:msg. "|".a:highlightGroup)
    execute "echohl ".a:highlightGroup
    echom a:msg
    echohl NONE
endfunction

function! extropy#command#createCommand(pluginName, commandName) 
    call extropy#debug#logInfo("CreateCommand: " . a:pluginName . a:commandName)
    execute "command! -nargs=0 " . a:commandName . " call extropy#js#callJsFunction('" . a:pluginName . "', '" . a:commandName . "')"
endfunction

function! extropy#command#flushIncomingCommands()
    let commands = extropy#tcp#getMessages()
    " echom "Flushing = " . string(len(commands))
    call extropy#debug#logInfo("extropy#command#flushIncomingCommands: ".len(commands)." commands to flush.")
    for command in commands
        call extropy#command#execute(command)
    endfor
endfunction

function! extropy#command#startWatcher() 
python << EOF
serverName = vim.eval("v:servername")
extropy_command_asyncWatcher = AsyncWatcher(serverName)
extropy_command_asyncWatcher.start()
EOF

augroup ExtropyWatcherListeners
    autocmd!
    autocmd! VimLeave * :call extropy#command#stopWatcher()
augroup END

endfunction

function! extropy#command#stopWatcher()
python << EOF
if extropy_command_asyncWatcher != None:
    extropy_command_asyncWatcher.stop()
    extropy_command_asyncWatcher = None
EOF
endfunction



" TODO:
" Add real 'start' method to the plugin
" Callback if node client reports an error talking to the server
" Load plugin as separate process
" Add plugin-name argument to script file
" Create plugin in vim-node-test-plugin that just does :TestRoundTrip and
" calls extropy#js#exec("myPlugin", "myFunction", args)
" Add logging to the server to see calls that came in
