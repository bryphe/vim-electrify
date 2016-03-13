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

function! extropy#js#startAutocomplete(omniCompleteState)
    let omniCompleteArgs = "\"".string(a:omniCompleteState)."\""
    echom omniCompleteArgs
    call extropy#js#executeRemoteCommand([], { "post": "/api/vim/omnicomplete/".v:servername."/start", "body": omniCompleteArgs })
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

    call xolox#misc#os#exec({"command": basePath, "async": 1})
endfunction

function! extropy#js#completeEnd()
    let s:isAutoCompleting = 1
endfunction

function! extropy#js#completeAdd(completionEntries)
    echom "Calling"
    echom "Calling completeadd".a:completionEntries

    let splitted = join(split(a:completionEntries, "\\"), "")
    echom "Fix up quotes".splitted

    execute "let localDerp=".splitted
    echom "localDerp populated2"
    echom "localDerp type:".type(localDerp)
    for completion in localDerp
        echom "Calling completeadd"
        call complete_add(completion)
    endfor

    call extropy#js#completeEnd()
endfunction

function! extropy#js#getEditingState()
    let currentBuffer = expand("%:p")
    let line = line(".")
    let col = col(".")
    let state = { "currentBuffer": currentBuffer, "line": line, "col": col, "byte": line2byte(line) + col }
    return "\"".string(state)."\""
endfunction

function! extropy#js#complete(findstart, base)
    echom "starting completion"
    let line = getline('.')
    let lineNumber = line(".")
    let col = col('.')
    if a:findstart
        " locate the start of the word
        let start = col - 1
        while start > 0 && line[start - 1] =~# '\v[a-zA-z0-9_]'
            let start -= 1
        endwhile
        return start
    else
        " TODO: Refactor to use common state code
        let omniCompleteState = { "currentBuffer": expand("%:p"), "line": line, "col": col, "byte": line2byte(lineNumber) + col }
        let omniCompleteState.base = a:base

        let tempFileName = tempname()
        execute "w ".tempFileName
        let omniCompleteState.tempFile = tempFileName
        " let omniCompleteState = { "base": a:base }
        call extropy#js#startAutocomplete(omniCompleteState)

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
