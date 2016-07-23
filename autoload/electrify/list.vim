" list.vim
"
" Helper scripts for setting quick-fix list and location list

function! electrify#list#setloclist(serializedLocList)
    call electrify#debug#logInfo("setloclist: ".a:serializedLocList)
    let loc = electrify#js#deserialize(a:serializedLocList)

    call setloclist(0, loc)
endfunction

function! electrify#list#setqflist(serializedLocList)
    call electrify#debug#logInfo("setqflist: ".a:serializedLocList)
    let loc = electrify#js#deserialize(a:serializedLocList)

    call setqflist(loc)
endfunction
