" Errors.vim
"
" Helper scripts for setting 'errors' (loc list, markers)


let s:errorDictionary = {}

let s:signCount = 1

:sign define electrify_error text=>> texthl=Error

function! electrify#errors#set(key, serializedErrors)
    call electrify#debug#logInfo("setErrors: ".a:serializedErrors)
    let errors = electrify#js#deserialize(a:serializedErrors)

    if has_key(s:errorDictionary, a:key)
        call electrify#errors#clear(a:key)
    endif

    let s:errorDictionary[a:key] = { }
    let s:errorDictionary[a:key].signs = []
    let s:errorDictionary[a:key].highlights = []
    let s:errorDictionary[a:key].loclist = []

    for errorInfo in errors

        let locEntry = {}

        if has_key(errorInfo, "fileName")
            let locEntry.filename = errorInfo.fileName
        endif

        if has_key(errorInfo, "lineNumber")
            let locEntry.lnum = errorInfo.lineNumber
        endif

        if has_key(errorInfo, "startColumn")
            let locEntry.col = errorInfo.startColumn
        endif

        if has_key(errorInfo, "column")
            let locEntry.col = errorInfo.column
        endif

        if has_key(errorInfo, "type")
            let locEntry.type = errorInfo.type
        endif

        if has_key(errorInfo, "text")
            let locEntry.text = errorInfo.text
        endif

        if has_key(errorInfo, "fileName") && has_key(errorInfo,"lineNumber")
            let signInfo = {"id": s:signCount, "line": errorInfo.lineNumber, "file": errorInfo.fileName}
            call add(s:errorDictionary[a:key].signs, signInfo)
            let s:signCount = s:signCount + 1

            if has_key(errorInfo, "startColumn") && has_key(errorInfo, "endColumn")
                let highlightInfo = {"line": errorInfo.lineNumber, "file": errorInfo.fileName, "start": errorInfo.startColumn, "end": errorInfo.endColumn}
                call add(s:errorDictionary[a:key].highlights, highlightInfo)
            endif
        endif

        call add(s:errorDictionary[a:key].loclist, locEntry)
    endfor

    " TODO:
    " matchaddpos("HighlightGroup", [[{line}, {col1}, {col2}]])

    " call setloclist(0, errors)

    call electrify#errors#_render()
endfunction

function! electrify#errors#_render()
    :sign unplace *
    call clearmatches()

    let currentPath = expand("%:p")

    let allLocEntries = []
    for key in keys(s:errorDictionary)
        let errorInfo = s:errorDictionary[key]

        for signInfo in errorInfo.signs
            exe ":sign place ".signInfo.id." line=".signInfo.line." name=electrify_error file=".signInfo.file
        endfor

        for locInfo in errorInfo.loclist
            call add(allLocEntries, locInfo)
        endfor

        for highlight in errorInfo.highlights
            if currentPath ==? highlight.file
                call matchaddpos("Error", [[highlight.line, highlight.start, highlight.end-highlight.start]])
            endif
        endfor
    endfor

    call setqflist(allLocEntries)
    :redraw

endfunction

function! electrify#errors#clear(key)

    if has_key(s:errorDictionary, a:key)
        call remove(s:errorDictionary, a:key)
    endif

    call electrify#errors#_render()
endfunction

