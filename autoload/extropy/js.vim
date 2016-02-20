let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientjspath = s:plugindir . "/js/lib/client/index.js"
"echom s:clientjspath

function! extropy#js#execute(command)
    echom 'hey2' . a:command
    :execute a:command
    :redraw
endfunction

function! extropy#js#echo(msg)
    echom a:msg
endfunction

function! extropy#js#loadplugin(pluginName, fullPathToJavascriptFile)
    "echom "script: " .s:clientjspath
    "echom "called loadplugin" . a:fullPathToJavascriptFile
    echom a:pluginName
  call xolox#misc#os#exec({"command": "node " .s:clientjspath. " --loadPlugin " .a:pluginName. " --servername " .v:servername. " --path " .a:fullPathToJavascriptFile, "async": 1})
endfunction

" TODO:
" Add real 'start' method to the plugin
" Callback if node client reports an error talking to the server
" Load plugin as separate process
" Add plugin-name argument to script file
" Create plugin in vim-node-test-plugin that just does :TestRoundTrip and
" calls extropy#js#exec("myPlugin", "myFunction", args)
" Add logging to the server to see calls that came in
