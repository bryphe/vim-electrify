let g:extropy_omnicomplete_debugdata = { }
let s:isAutoCompleting = 0
let s:lastCompletion = { 'line': -1, 'col': -1 }

let s:dontStartAutocomplete = 0
let s:cachedCompletion = []

function! extropy#omnicomplete#enableKeywordAutocompletion()
    call extropy#omnicomplete#enableAutocomplete("<C-p>")
endfunction

function! extropy#omnicomplete#enableOmniAutocompletion()
    call extropy#omnicomplete#enableAutocomplete("<C-x><C-o>")
endfunction

function! extropy#omnicomplete#enableNodeAutocompletion()
    set omnifunc=extropy#omnicomplete#complete
    call extropy#omnicomplete#enableOmniAutocompletion()
endfunction

function! extropy#omnicomplete#enableAutocomplete(completionKeys)
    set completeopt=noinsert,menuone,preview
    execute("inoremap <silent> <Plug>(extropy_nodejs_start_completion) ". a:completionKeys)

    augroup ExtropyNodeAutoCompleteGroup
        autocmd!
        autocmd CursorMovedI * :call extropy#omnicomplete#refreshOmnicomplete(0)
    augroup END
endfunction

let g:extropy_max_refresh = 1
let s:lastRefreshInfo = { 'line': -1, 'col': -1, 'count': 0 }

function! extropy#omnicomplete#refreshOmnicomplete(forceRefresh)
    let shouldRefresh = !pumvisible() || a:forceRefresh
    if mode() == "i" && shouldRefresh
        let line = line(".")
        let currentColumn = col('.')
        let lineText = getline('.')
        
        if line == s:lastRefreshInfo.line && currentColumn == s:lastRefreshInfo.col
            if s:lastRefreshInfo.count > g:extropy_max_refresh
                return
            else
                let s:lastRefreshInfo.count = s:lastRefreshInfo.count + 1
            endif
        else
            let s:lastRefreshInfo = { 'line': line, 'col': currentColumn, 'count': 0 }
        endif

        " Get delta between current column and completion base. Make sure the
        " user has typed some amount of characters
        if extropy#omnicomplete#hasomni()
            let s:dontStartAutocomplete = 1
            execute("let base = " . &omnifunc . "(1, 0)")
            let s:dontStartAutocomplete = 0
        else
            let base = extropy#omnicomplete#getDefaultMeet()
        endif

        let delta = currentColumn - base
        let currentCharacter = lineText[currentColumn-2]
        " echom "Line: [" .lineText."] Character: ".currentCharacter." Column ".currentColumn. " Delta ".delta. " ForceRefresh ".a:forceRefresh

        " TODO: Factor out into trigger characters
        if delta > 1 || currentCharacter == "." || a:forceRefresh > 0
            echom "Feeding keys"
            call feedkeys("\<Plug>(extropy_nodejs_start_completion)")
        endif
    endif
endfunction

function! extropy#omnicomplete#hasomni()
    return &omnifunc != ""
endfunction

function! extropy#omnicomplete#startAutocomplete()
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/omnicomplete/start")
    let s:isAutoCompleting = 0
endfunction

function! extropy#omnicomplete#setCachedCompletion(completionEntries)
    let splitted = join(split(a:completionEntries, "\\"), "")

    execute "let s:cachedCompletion = ". splitted
    let s:completionEntries = s:cachedCompletion

    " Force refresh, because we have updated autocomplete values
    " 
    " Seems like this is causing problems with indenting - disabling for now.
    call extropy#omnicomplete#refreshOmnicomplete(1)
endfunction



function! extropy#omnicomplete#completeAdd(completionEntries)

    let splitted = join(split(a:completionEntries, "\\"), "")

    execute "let localDerp=".splitted
    let s:completionEntries = localDerp
endfunction

function! extropy#omnicomplete#getDefaultMeet()
    " locate the start of the word
    let line = getline('.')
    let col = col('.')
    let start = col - 1
    while start > 0 && line[start - 1] =~# '\v[a-zA-z0-9_]'
        let start -= 1
    endwhile

    " Don't autocomplete starting a string
    if start > 0
        if line[start] == '"' || line[start] == "'" || line[start] == "(" || line[start] == ")" || line[start-1] == ";"
            " -3 says to leave completion mode
            let start = -3
        endif
    endif
    return start
endfunction

function! extropy#omnicomplete#complete(findstart, base)
    let line = getline('.')
    let lineNumber = line(".")
    let col = col('.')
    if a:findstart
        call extropy#js#notifyBufferUpdated()

        " locate the start of the word
        let start = extropy#omnicomplete#getDefaultMeet()

        if s:dontStartAutocomplete == 1
            return start
        endif

        " If this isn't the same cached completion, relookup
        if s:lastCompletion.line == lineNumber  && s:lastCompletion.col == start
            " Cached entries are still valid
            let s:isAutoCompleting = 1
        else
            " Not valid, new completion
            let s:completionEntries = []
            let s:isAutoCompleting = 0
            if start >= 0
                call extropy#js#notifyBufferUpdated()
                call extropy#omnicomplete#startAutocomplete()
            endif
        endif

        let s:lastCompletion.line = lineNumber
        let s:lastCompletion.col = start
        let g:extropy_omnicomplete_debugdata.start = start
        let g:extropy_omnicomplete_debugdata.line = lineNumber
        let g:extropy_omnicomplete_debugdata.col = col
        return start
    else
        let ret = []
        if len(a:base) < 0
            return ret
        endif

        " TODO: Refactor to use common state code
        if len(s:completionEntries) == 0
            call add(ret, a:base)
            call add(ret, a:base."...")
        else
            for completion in s:completionEntries
                if type(completion) == 1
                    let testWord = completion
                else 
                    let testWord = completion.word
                endif

                if testWord =~# '^' .a:base
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
