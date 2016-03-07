let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientjspath = s:plugindir . "/js/lib/client/index.js"
"echom s:clientjspath

let s:isAutoCompleting = 0
let s:completionEntries = []

function! extropy#js#initializeEventListeners()

    augroup ExtropyEventListeners
        autocmd! BufEnter * :call extropy#js#notifyBufferEvent("BufEnter", expand("%:p"))
        autocmd! VimLeave * :call extropy#js#notifyBufferEvent("VimLeave", expand("%:p"))
    augroup END
endfunction

function! extropy#js#start()
    call extropy#js#executeRemoteCommand(["start"], {})
endfunction

function! extropy#js#notifyBufferEvent(eventName, buffer)
    let state = extropy#js#getEditingState()
    call extropy#js#executeRemoteCommand([], {"event": a:eventName, "state": state })
endfunction

function! extropy#js#execute(command)
    :execute a:command
    :redraw
endfunction

function! extropy#js#echo(msg)
    echom a:msg
endfunction

function! extropy#js#createCommand(pluginName, commandName) 
    echom "CreateCommand: " . a:pluginName
    execute "command! -nargs=0 " . a:commandName . " call extropy#js#callJsFunction('" . a:pluginName . "', '" . a:commandName . "')"
endfunction

function! extropy#js#callJsFunction(pluginName, commandName)
    let state = extropy#js#getEditingState()
    echom "callJsFunction: " . a:pluginName . a:commandName .state
    call extropy#js#executeRemoteCommand(["exec"], { "plugin": a:pluginName, "command": a:commandName, "state": state })
endfunction

function! extropy#js#startAutocomplete()
    let state = extropy#js#getEditingState()
    call extropy#js#executeRemoteCommand(["startAutoComplete"], { "state": state })
    let s:isAutoCompleting = 0
endfunction

function! extropy#js#executeRemoteCommand(arguments, parameters)

    let basePath = "node " .s:clientjspath. " --servername " .v:servername

    for arg in a:arguments
        let basePath = basePath . " --" .arg
    endfor

    for param in keys(a:parameters)
        let key = param
        let value = a:parameters[key]
        let basePath = basePath . " --" .key. " " .value
    endfor

    echom "Executing: " .basePath
    call xolox#misc#os#exec({"command": basePath, "async": 1})
endfunction

function! extropy#js#completeEnd()
    let s:isAutoCompleting = 1
endfunction

function! extropy#js#completeAdd()
    let completionEntries = "[{\"word\":\"alpha\"}, {\"word\":\"alphabet\"}]"
    execute "let localDerp=".completionEntries
    for completion in localDerp
        call complete_add(completion)
    endfor
    let s:completionEntries = localDerp
endfunction

function! extropy#js#getEditingState()
    let currentBuffer = expand("%:p")
    let state = { "currentBuffer": currentBuffer }
    return "\"".string(state)."\""
endfunction

function! extropy#js#complete(findstart, base)
    if a:findstart
        " locate the start of the word
        let line = getline('.')
        let start = col('.') - 1
        while start > 0 && line[start - 1] =~# '\v[a-zA-z0-9_]'
            let start -= 1
        endwhile
        return start
    else
        call extropy#js#startAutocomplete()

        while s:isAutoCompleting == 0
            " for completion in s:completionEntries
            "     call complete_add(completion)
            " endfor
            " let s:completionEntries = []
            sleep 300m^I
        endwhile
        return []
    endif
endfun
" TODO:
" Add real 'start' method to the plugin
" Callback if node client reports an error talking to the server
" Load plugin as separate process
" Add plugin-name argument to script file
" Create plugin in vim-node-test-plugin that just does :TestRoundTrip and
" calls extropy#js#exec("myPlugin", "myFunction", args)
" Add logging to the server to see calls that came in
