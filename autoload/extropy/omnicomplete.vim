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

function! extropy#omnicomplete#openCompletionMenu(completionArgs)
    let s:completionArgs = a:completionArgs
    if mode() == "i" && !pumvisible()
        call UltiSnips#Anon("##", "derp")

        let s:originalCompleteOptions = &completeopt
        let s:originalOmnifunc = &omnifunc

        " set completeopt=menuone
        " No preview mode - the info flag is going to be used for rich
        " behavior
        set completeopt=noselect,noinsert,menuone
        set completeopt-=preview
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
    " call extropy#snippet#expandAnonymousSnippet(0)
    " execute("inoremap <silent> <Plug>(extropy_nodejs_execute_snippet) $$<C-R>=UltiSnips#Anon('derp${1:somestuff}derp${2:someotherstuff}')<cr>")
    " echom "Mode: " . mode()
    " call feedkeys("\<Plug>(extropy_nodejs_execute_snippet)")
endfunction
