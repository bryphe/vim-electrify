let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientjspath = s:plugindir . "/js/lib/client/index.js"
"echom s:clientjspath


function! extropy#js#initializeEventListeners()

    augroup ExtropyEventListeners
        autocmd! BufEnter * :call extropy#js#notifyBufferEvent("BufEnter", expand("%:p"))
    augroup END
endfunction

function! extropy#js#notifyBufferEvent(eventName, buffer)
    echom a:eventName.a:buffer
endfunction

function! extropy#js#execute(command)
    :execute a:command
    :redraw
endfunction

function! extropy#js#echo(msg)
    echom a:msg
endfunction

function! extropy#js#loadplugin(pluginName, fullPathToJavascriptFile)
    "echom "script: " .s:clientjspath
    "echom "called loadplugin" . a:fullPathToJavascriptFile
    echom a:pluginName
  call xolox#misc#os#exec({"command": "node " .s:clientjspath. " --loadPlugin " .a:pluginName. " --servername " .v:servername. " --path " .a:fullPathToJavascriptFile, "async": 1})
endfunction

function! extropy#js#createCommand(pluginName, commandName) 
    echom "CreateCommand: " . a:pluginName
    execute "command! -nargs=0 " . a:commandName . " call extropy#js#callJsFunction('" . a:pluginName . "', '" . a:commandName . "')"
endfunction

function! extropy#js#callJsFunction(pluginName, commandName)
    let state = extropy#js#getEditingState()
    echom "callJsFunction: " . a:pluginName . a:commandName .state
    call xolox#misc#os#exec({"command": "node " .s:clientjspath. " --exec --plugin " . a:pluginName. " --servername " .v:servername. " --command " .a:commandName. " --state \"" .state. "\"", "async": 1})
endfunction

function! extropy#js#getEditingState() 
    let currentBuffer = expand("%:p")
    let currentWord = expand("<cword>");
    let state = { "currentBuffer": currentBuffer, "currentWord": currentWord }
    return string(state)
endfunction

" TODO:
" Add real 'start' method to the plugin
" Callback if node client reports an error talking to the server
" Load plugin as separate process
" Add plugin-name argument to script file
" Create plugin in vim-node-test-plugin that just does :TestRoundTrip and
" calls extropy#js#exec("myPlugin", "myFunction", args)
" Add logging to the server to see calls that came in
