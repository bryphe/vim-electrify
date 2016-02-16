
"echom expand('<sfile>:p:h')
if exists("g:loaded_vim_node_plugins") 
    finish
elseif !has("clientserver")
    echom "vim-node-plugins requires clientserver"
    finish
endif

command! -nargs=+ AsyncHello call SendAsyncText(<q-args>)
command! -nargs=+ ExecuteCommandFromJavaScript call ExecuteCommand(<q-args>)
command! -nargs=+ Test call GetAsyncText(<q-args>)

function! SendAsyncText(hello_text)
  let temp_file = tempname()
  call xolox#misc#os#exec({"command": "node index.js " .v:servername, "async": 1})
endfunction

function! GetAsyncText(textFromCommandLine)
    call extropy#js#execute(a:textFromCommandLine)
endfunction

function! ExtropyExecute(command)
    call extropy#js#execute(a:command)
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
