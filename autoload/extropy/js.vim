let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientjspath = s:plugindir . "/js/lib/client/index.js"
echom s:clientjspath

function! extropy#js#execute(command)
    echom 'hey2' . a:command
    :execute a:command
    :redraw
endfunction

function! extropy#js#echo(msg)
    echom a:msg
endfunction

function! extropy#js#loadplugin(fullPathToJavascriptFile)
    echom "script: " .s:clientjspath
    echom "called loadplugin" . a:fullPathToJavascriptFile
  call xolox#misc#os#exec({"command": "node " .s:clientjspath. " --start --servername " .v:servername. "", "async": 1})
endfunction
