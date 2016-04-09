let g:extropy_omnicomplete_debugdata = { }
let s:isAutoCompleting = 0
let s:lastCompletion = { 'line': -1, 'col': -1 }

let s:cachedCompletion = []

function! extropy#omnicomplete#enableAutocomplete()
    set omnifunc=extropy#omnicomplete#complete
    set completeopt=longest,menuone,preview

    inoremap <silent> <Plug>(extropy_nodejs_start_completion) <C-x><C-o>

    augroup ExtropyNodeAutoCompleteGroup
        autocmd!
        autocmd CursorMovedI * :call extropy#omnicomplete#refreshOmnicomplete(0)
    augroup END
endfunction


function! extropy#omnicomplete#refreshOmnicomplete(forceRefresh)
    let shouldRefresh = !pumvisible() || a:forceRefresh
    echom shouldRefresh
    if mode() == "i" && shouldRefresh
        " Get delta between current column and completion base. Make sure the
        " user has typed some amount of characters
        execute("let base = " . &omnifunc . "(1, 0)")
        let currentColumn = col('.')
        let delta = currentColumn - base
        " echom "Delta: " . delta
        if delta >= 2
            call feedkeys("\<Plug>(extropy_nodejs_start_completion)")
        endif
    endif
endfunction



function! extropy#omnicomplete#startAutocomplete()
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/omnicomplete/start")
    let s:isAutoCompleting = 0
endfunction

function! extropy#omnicomplete#completeEnd()
    " let s:isAutoCompleting = 1
endfunction

function! extropy#omnicomplete#setCachedCompletion(completionEntries)
    echom "cached completion".a:completionEntries

    let splitted = join(split(a:completionEntries, "\\"), "")

    execute "let s:cachedCompletion = ". splitted
    let s:completionEntries = s:cachedCompletion
    " for entry in s:cachedCompletion
    "     call complete_add(entry)
    " endfor
    " let s:isAutoCompleting = 1
    " echom string(s:cachedCompletion)
    " call feedkeys("\<Esc>")
    " call feedkeys("a")

endfunction



function! extropy#omnicomplete#completeAdd(completionEntries)

    let splitted = join(split(a:completionEntries, "\\"), "")

    execute "let localDerp=".splitted
    let s:completionEntries = localDerp
    " for completion in localDerp
        " echom "Calling completeadd"
        " call complete_add(completion)
    " endfor

    call extropy#omnicomplete#completeEnd()
endfunction

function! extropy#omnicomplete#complete(findstart, base)
    let line = getline('.')
    let lineNumber = line(".")
    let col = col('.')
    if a:findstart
        call extropy#js#notifyBufferUpdated()

        " locate the start of the word
        let start = col - 1
        while start > 0 && line[start - 1] =~# '\v[a-zA-z0-9_]'
            let start -= 1
        endwhile

        " Don't autocomplete starting a string
        if start > 0
            if line[start] == '"' || line[start] == "'"
                echom "HIT THIS CASE"
                let start = -1
            endif
        endif

        " If this isn't the same cached completion, relookup
        if s:lastCompletion.line == lineNumber  && s:lastCompletion.col == start
            " Cached entries are still valid
            let s:isAutoCompleting = 1
        else
            " Not valid, new completion
            let s:completionEntries = []
            let s:isAutoCompleting = 0
            call extropy#js#notifyBufferUpdated()
            call extropy#omnicomplete#startAutocomplete()
        endif

        let s:lastCompletion.line = lineNumber
        let s:lastCompletion.col = start
        let g:extropy_omnicomplete_debugdata.start = start
        let g:extropy_omnicomplete_debugdata.line = lineNumber
        let g:extropy_omnicomplete_debugdata.col = col
        return start
    else
        let ret = []
        if len(a:base) <= 0
            return ret
        endif

        " TODO: Refactor to use common state code
        if len(s:completionEntries) == 0
            call add(ret, a:base)
            call add(ret, a:base."...")
        else
            " echom string(s:completionEntries)
            for completion in s:completionEntries
                " echom string(completion)
                if completion =~# '^' .a:base
                    call add(ret, completion)
                    " call complete_add(completion)
                endif
            endfor
        endif
        let g:extropy_omnicomplete_debugdata.lastBase = a:base
        let g:extropy_omnicomplete_debugdata.lastCompletions = ret
        return ret
    endif
endfun



function! extropy#omnicomplete#test_completion(findstart, base)
    let line = getline('.')
    let lineNumber = line(".")
    let col = col('.')
    if a:findstart
        " locate the start of the word
        let start = col - 1
        while start > 0 && line[start - 1] =~# '\v[a-zA-z0-9_]'
            let start -= 1
        endwhile

        if s:lastCompletion.line == lineNumber  && s:lastCompletion.col == start
        else
            let s:cachedCompletion = []
        endif

        let s:lastCompletion.line = lineNumber
        let s:lastCompletion.col = start
        return start
    else
        if len(s:cachedCompletion) > 0
            echom "Got cached completion"
            return s:cachedCompletion
        else
            let omniCompleteState = { "currentBuffer": expand("%:p"), "line": line, "col": col, "byte": line2byte(lineNumber) + col }
            let omniCompleteState.base = a:base
            call extropy#omnicomplete#startAutocomplete()
            call complete_add(a:base)
            call complete_add(a:base."...")
            return [a:base, a:base."..."]
        endif
    endif
endfun
