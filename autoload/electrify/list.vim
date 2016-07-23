" list.vim
"
" Helper scripts for setting quick-fix list and location list

function! electrify#list#setloclist(serializedLocList)
    call electrify#debug#logInfo("setloclist: ".a:serializedLocList)
    let loc = electrify#js#deserialize(a:serializedLocList)
    let convertedList = electrify#list#convertToLocList(loc)

    call setloclist(0, convertedList)
endfunction

function! electrify#list#setqflist(serializedLocList)
    call electrify#debug#logInfo("setqflist: ".a:serializedLocList)
    let loc = electrify#js#deserialize(a:serializedLocList)
    let convertedList = electrify#list#convertToLocList(loc)

    call setqflist(convertedList)
endfunction

function! electrify#list#convertToLocList(deserializedList) 
    let ret = deepcopy(a:deserializedList)
    call map(ret, "electrify#list#convertItem(v:val)")
    return ret
endfunction

function! electrify#list#convertItem(listItem)
    let ret = {}
    if has_key(a:listItem, 'filename')
        let ret.filename = a:listItem['filename']
    endif

    if has_key(a:listItem, 'lineNumber')
        let ret.lnum = a:listItem.lineNumber
    endif

    if has_key(a:listItem, 'column')
        let ret.col = a:listItem.column
    endif

    if has_key(a:listItem, 'text')
        let ret.text = a:listItem.text
    endif

    if has_key(a:listItem, 'type')
        let ret.type = a:listItem.type
    endif

    return ret
endfunction

