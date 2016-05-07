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
        let items = extropy#omnicomplete#filterItems(s:completionArgs.items)
        return items
    endif
endfunction

function! extropy#omnicomplete#filterItems(items)
    let ret = []

    for item in a:items
        if type(item) == type("")
            call add(ret, item)
            continue
        endif

        if type(item) != type({})
            continue
        endif

        if has_key(item, "snippet")
            let abbr = ''
            if has_key(item, "abbr")
                let abbr = item.abbr
            endif

            let description = ''
            if has_key(item, "menu")
                let description = item.menu
            endif

            let newItem = { 'word': '', 'empty': 1, 'kind': '[snippet]', 'abbr': abbr, 'menu': description, 'info': item.snippet }
            call add(ret, newItem)
        else
            call add(ret, item)
        endif
    endfor

    return ret
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

    if type(v:completed_item) == type({})
        if has_key(v:completed_item, "kind")
            if v:completed_item.kind == "[snippet]" 
                call extropy#snippet#expandAnonymousSnippet(v:completed_item.info)
            endif
        endif
    endif
    " call extropy#snippet#expandAnonymousSnippet(0)
    " execute("inoremap <silent> <Plug>(extropy_nodejs_execute_snippet) $$<C-R>=UltiSnips#Anon('derp${1:somestuff}derp${2:someotherstuff}')<cr>")
    " echom "Mode: " . mode()
    " call feedkeys("\<Plug>(extropy_nodejs_execute_snippet)")
endfunction
