" Errors.vim
"
" Helper scripts for setting 'errors' (loc list, markers)

function! electrify#errors#set(serializedErrors)
    call electrify#debug#logInfo("setErrors: ".a:serializedErrors)
    let errors = electrify#js#deserialize(a:serializedErrors)

    call setloclist(0, errors)

    if len(errors) > 0
        :lopen
        :redraw
    endif
endfunction
