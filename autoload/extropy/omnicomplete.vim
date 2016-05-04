
let s:completionArgs = {
    \'column': -1,
    \'line': -1,
    \'base': -1,
    \'items': []
\}

function! extropy#omnicomplete#initializeCompletion()
    execute("inoremap <silent> <Plug>(extropy_nodejs_start_completion) <C-x><C-o>")

    augroup ExtropyOmnicompleteAutogroup
        autocmd!
        autocmd CompleteDone * :call extropy#omnicomplete#onCompleteDone()
    augroup END
endfunction


function! extropy#omnicomplete#startRemoteCompletion()
    echom "Start"
    let s:completionEntries = []
endfunction

function! extropy#omnicomplete#addRemoteCompletion(completionEntries)
    let remoteCompletion = extropy#js#deserialize(a:completionEntries)
    let s:completionEntries = s:completionEntries + remoteCompletion
endfunction

function! extropy#omnicomplete#endRemoteCompletion()
    " Force refresh, because we have updated autocomplete values
    " call extropy#omnicomplete#openCompletionMenu()
endfunction

function! extropy#omnicomplete#openCompletionMenu(completionArgs)
    let s:completionArgs = a:completionArgs
    if mode() == "i" && !pumvisible()
        call UltiSnips#Anon("##", "derp")

        let s:originalCompleteOptions = &completeopt
        let s:originalOmnifunc = &omnifunc

        " set completeopt=menuone
        set completeopt=noselect,noinsert,menuone,preview
        set omnifunc=extropy#omnicomplete#complete

        call feedkeys("\<Plug>(extropy_nodejs_start_completion)")
    endif
endfunction

function! extropy#omnicomplete#initiateCompletion(completionArgsAsString)
    let completionInfo = extropy#js#deserialize(a:completionArgsAsString)
    call extropy#omnicomplete#openCompletionMenu(completionInfo)
endfunction

function! extropy#omnicomplete#complete(findstart, base)
    let line = getline('.')
    let lineNumber = line(".")
    let col = col('.')
    if a:findstart
        return s:completionArgs.base
    else
        return s:completionArgs.items
    endif
endfunction

function! extropy#omnicomplete#onCompleteDone()
    if exists("s:originalCompleteOptions")
        execute("set completeopt=".s:originalCompleteOptions)
        unlet s:originalCompleteOptions
    endif

    if exists("s:originalOmnifunc")
        execute("set omnifunc=".s:originalOmnifunc)
    endif

    echom "Completed item: ".string(v:completed_item)
    " execute("inoremap <silent> <Plug>(extropy_nodejs_execute_snippet) $$<C-R>=UltiSnips#Anon('derp${1:somestuff}derp${2:someotherstuff}')<cr>")
    " echom "Mode: " . mode()
    " call feedkeys("\<Plug>(extropy_nodejs_execute_snippet)")
endfunction
