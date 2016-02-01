Jun

"echom expand('<sfile>:p:h')
if exists("g:loaded_vim_node_plugins") 
    finish
elseif !has("clientserver")
    echom "vim-node-plugins requires clientserver"
    finish
endif

command! -nargs=+ AsyncHello call SendAsyncText(<q-args>)

function! SendAsyncText(hello_text)
  let temp_file = tempname()
  exec 'silent !start cmd /c "echo '.a:hello_text.' > '.temp_file
        \ ' & vim --servername '.v:servername.' --remote-expr "GetAsyncText('."'".a:hello_text."')\"".
        \ ' & pause"'
endfunction

function! GetAsyncText(temp_file_name)
    echomsg a:temp_file_name
  "echomsg readfile(a:temp_file_name)[0]
  call delete(a:temp_file_name)
endfunction

fun! CompleteMonths(findstart, base)
  if a:findstart
    " locate the start of the word
    let line = getline('.')
    let start = col('.') - 1
    while start > 0 && line[start - 1] =~ '\a'
      let start -= 1
    endwhile
    return start
  else
    " find months matching with "a:base"
    for m in split("Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec")
      if m =~ '^' . a:base
    call complete_add({"word": m, "menu": "menu_item", "info": "info_item"})
      endif
      sleep 300m	" simulate searching for next match
      if complete_check()
    break
      endif
    endfor
    return []
  endif
endfun
set omnifunc=CompleteMonths

"call xolox#misc#os#exec({"command": "node plugin/index.js"})
