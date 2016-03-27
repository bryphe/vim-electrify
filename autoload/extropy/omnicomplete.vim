let s:isAutoCompleting = 0
let s:lastCompletion = { 'line': -1, 'col': -1 }

let s:cachedCompletion = []
function! extropy#omnicomplete#startAutocomplete(omniCompleteState)
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/omnicomplete/start")
    let s:isAutoCompleting = 0
endfunction

function! extropy#omnicomplete#completeEnd()
    let s:isAutoCompleting = 1
endfunction

function! extropy#omnicomplete#setCachedCompletion(completionEntries)
    echom "cached completion".a:completionEntries

    let splitted = join(split(a:completionEntries, "\\"), "")

    execute "let s:cachedCompletion = ". splitted
    for entry in s:cachedCompletion
        call complete_add(entry)
    endfor
    let s:isAutoCompleting = 1
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
        endif

        let s:lastCompletion.line = lineNumber
        let s:lastCompletion.col = start
        return start
    else
        " TODO: Refactor to use common state code
        if s:isAutoCompleting == 0
            call extropy#js#notifyBufferUpdated()
            let omniCompleteState = { "currentBuffer": expand("%:p"), "line": line, "col": col, "byte": line2byte(lineNumber) + col }
            let omniCompleteState.base = a:base

            let tempFileName = tempname()
            call extropy#omnicomplete#startAutocomplete(omniCompleteState)
        endif

        while s:isAutoCompleting == 0
            call complete_check()
            sleep 1m^I
        endwhile

        " echom string(s:completionEntries)
        for completion in s:completionEntries
            " echom string(completion)
            if completion =~ '^' .a:base
                call complete_add(completion)
            endif
        endfor
        return []
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
            call extropy#omnicomplete#startAutocomplete(omniCompleteState)
            call complete_add(a:base)
            call complete_add(a:base."...")
            return [a:base, a:base."..."]
        endif
    endif
endfun
