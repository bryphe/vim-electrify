
function! extropy#errors#set(serializedErrors)
    call extropy#debug#logInfo("setErrors: ".a:serializedErrors)
    let errors = extropy#js#deserialize(a:serializedErrors)

    call setloclist(0, errors)

    if len(errors) > 0
        :lopen
        :redraw
    endif
endfunction
