" electrify#command
"
" Set of commands that the node-vim interop layer can call back into

" Import relevant python scripts
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\asyncwatcher.py'
execute 'pyfile '.s:path

" Create global instance of async watcher
python << EOF
electrify_command_asyncWatcher = None
EOF

call electrify#tcp#isConnected()

" Execute a command incoming from the JS integration
function! electrify#command#execute(command)
    call electrify#debug#logInfo("Executing: ".a:command)
    :execute a:command
endfunction

function! electrify#command#eval(expression, pluginName, seq)
    call electrify#debug#logInfo("Evaluating: ".a:expression)
    :execute "let evalResult = ".a:expression
    call electrify#debug#logInfo("Got value: ".a:expression)
    call electrify#js#callJsFunction(a:pluginName, "evalresult", {seq: a:seq, returnValue: evalResult})
endfunction

function! electrify#command#echom(msg)
    call electrify#debug#logInfo("echom: ".a:msg)
    echom a:msg
endfunction

function! electrify#command#echo(msg)
    call electrify#debug#logInfo("echo: ".a:msg)
    echo a:msg
endfunction

function! electrify#command#echohl(msg, highlightGroup)
    call electrify#debug#logInfo("echohl: ".a:msg. "|".a:highlightGroup)
    execute "echohl ".a:highlightGroup
    echom a:msg
    echohl NONE
endfunction

" Create a local vim command
function! electrify#command#createCommand(pluginName, commandName) 
    call electrify#debug#logInfo("CreateCommand: " . a:pluginName . a:commandName)
    execute "command! -nargs=* " . a:commandName . " call electrify#js#callJsFunction('" . a:pluginName . "', '" . a:commandName . "', {'qargs': <q-args>})"
endfunction

" Callback from the remote server to execute the incoming commands
function! electrify#command#flushIncomingCommands()
    let commands = electrify#command#getMessages()
    call electrify#debug#logInfo("electrify#command#flushIncomingCommands: ".len(commands)." commands to flush.")
    for command in commands
        call electrify#command#execute(command)
    endfor
endfunction

function! electrify#command#startWatcher() 
python << EOF
serverName = vim.eval("v:servername")
electrify_command_asyncWatcher = AsyncWatcher(serverName, electrify_tcp_getMessages)
electrify_command_asyncWatcher.start()
EOF

augroup electrifyWatcherListeners
    autocmd!
    autocmd! VimLeavePre * :call electrify#command#stopWatcher()
augroup END

endfunction

function! electrify#command#getMessages()
let ret = []
python << EOF
import json
if electrify_command_asyncWatcher != None:
    messages = electrify_command_asyncWatcher.getMessages()
    messagesAsJson = json.dumps(messages)
    vim.command("let ret = " + messagesAsJson)
EOF
return ret
endfunction


function! electrify#command#stopWatcher()
python << EOF
if electrify_command_asyncWatcher != None:
    electrify_command_asyncWatcher.stop()
    electrify_command_asyncWatcher = None
EOF
endfunction
