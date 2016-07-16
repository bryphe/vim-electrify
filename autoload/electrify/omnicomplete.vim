" Omnicomplete.vim
" Utilities for setting up omnicompletion integration

let s:completionArgs = {
    \'column': -1,
    \'line': -1,
    \'base': -1,
    \'items': []
\}

function! electrify#omnicomplete#initializeCompletion()
    execute("inoremap <silent> <Plug>(electrify_nodejs_start_completion) <C-x><C-o>")

    augroup electrifyOmnicompleteAutogroup
        autocmd!
        autocmd CompleteDone * :call electrify#omnicomplete#onCompleteDone()
    augroup END
endfunction

function! electrify#omnicomplete#openCompletionMenu(completionArgs)
    let s:completionArgs = a:completionArgs
    if mode() == "i" && !pumvisible()
        let s:originalCompleteOptions = &completeopt
        let s:originalOmnifunc = &omnifunc

        " set completeopt=menuone
        " No preview mode - the info flag is going to be used for rich
        " behavior
        set completeopt=noselect,noinsert,menuone
        set completeopt-=preview
        set omnifunc=electrify#omnicomplete#complete

        call feedkeys("\<Plug>(electrify_nodejs_start_completion)")
    endif
endfunction

function! electrify#omnicomplete#initiateCompletion(completionArgsAsString)
    let completionInfo = electrify#js#deserialize(a:completionArgsAsString)
    call electrify#omnicomplete#openCompletionMenu(completionInfo)
endfunction

function! electrify#omnicomplete#complete(findstart, base)
    let line = getline('.')
    let lineNumber = line(".")
    let col = col('.')
    if a:findstart
        return s:completionArgs.base
    else
        let items = electrify#omnicomplete#filterItems(s:completionArgs.items)
        return items
    endif
endfunction

function! electrify#omnicomplete#filterItems(items)
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

function! electrify#omnicomplete#onCompleteDone()
    if exists("s:originalCompleteOptions")
        execute("set completeopt=".s:originalCompleteOptions)
        unlet s:originalCompleteOptions
    endif

    if exists("s:originalOmnifunc")
        execute("set omnifunc=".s:originalOmnifunc)
    endif

    if type(v:completed_item) == type({})
        if has_key(v:completed_item, "kind")
            if v:completed_item.kind == "[snippet]" 
                call electrify#snippet#expandAnonymousSnippet(v:completed_item.info)
            endif
        endif
    endif
endfunction
