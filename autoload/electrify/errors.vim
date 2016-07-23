" Errors.vim
"
" Helper scripts for setting 'errors' (loc list, markers)

function! electrify#errors#set(serializedErrors)
    call electrify#debug#logInfo("setErrors: ".a:serializedErrors)
    let errors = electrify#js#deserialize(a:serializedErrors)

    " TODO:
    " matchaddpos("HighlightGroup", [[{line}, {col1}, {col2}]])

    call setloclist(0, errors)

    if len(errors) > 0
        :lopen
        :redraw
    endif
endfunction
