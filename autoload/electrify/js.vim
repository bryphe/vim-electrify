" Js.vim
" Core utilities for integrating with the external server

let s:plugindir = expand('<sfile>:p:h:h:h')
let s:serverJsPath = s:plugindir . "/js/lib/server/index.js"

let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') 
execute 'pyfile '.s:path. '\server.py'
execute 'pyfile '.s:path. '\request.py'

" Get context for messages to send to the server
" Every call made to the server will have this data available
python << EOF
def electrify_get_context():
    import vim
    currentBuffer = vim.eval("expand('%:p')")
    currentBufferNumber = vim.eval("bufnr('%')")
    line = vim.eval("line('.')")
    lineContents = vim.eval("getline('.')")
    col = vim.eval("col('.')")
    byte = vim.eval("line2byte(line('.')) + col('.')")
    filetype = vim.eval("&filetype")

    values = {
    "currentBufferNumber": currentBufferNumber,
    "currentBuffer": currentBuffer,
    "lineContents": lineContents,
    "line": line,
    "filetype": filetype,
    "col": col,
    "byte": byte
    }

    return values
EOF

function! electrify#js#start()
    if electrify#js#isEnabled() == 0
        return
    endif

python << EOF
import vim
import time
pluginDir = vim.eval("s:plugindir")
serverPath = vim.eval("s:serverJsPath")
tcpPort = vim.eval("g:electrify_tcp_port");
wsPort = vim.eval("g:electrify_ws_port");

server = Server(pluginDir, serverPath, tcpPort, wsPort)
server.start()
EOF

    call electrify#tcp#connect("127.0.0.1", g:electrify_tcp_port)
endfunction

function! electrify#js#reconnect()
    call electrify#tcp#reconnect()
    sleep 500m
    call electrify#js#notifyBufferEvent("BufEnter")
endfunction

function! electrify#js#notifyBufferEvent(eventName)
python << EOF
message = {
    'type': 'event',
    'args': {
        'eventName': vim.eval("a:eventName")
    },
    'context': electrify_get_context()
}

electrify_tcp_sendMessage(message)
EOF

endfunction

function! electrify#js#callJsFunction(pluginName, commandName, qArgs)
call electrify#debug#logInfo("electrify#js#callJsFunction: PluginName: ".a:pluginName." Command: ".a:commandName." Args: ".a:qArgs)
call electrify#tcp#warnIfNotConnected()
python << EOF
context = electrify_get_context()
context["qargs"] = vim.eval("a:qArgs")

jsFunctionMessage = {
    'type': 'command',
    'args': {
        'plugin': vim.eval("a:pluginName"),
        'command': vim.eval("a:commandName"),
    },
    'context': context
}

electrify_tcp_sendMessage(jsFunctionMessage)
EOF
endfunction

function! electrify#js#restartServer()
    call electrify#js#stopServer()
    call electrify#js#start()
endfunction

function! electrify#js#stopServer()

call electrify#tcp#disconnect()
" TODO - use tcp instead
endfunction

function! electrify#js#notifyBufferUpdated()
    if electrify#js#isEnabled() == 0
        return
    endif

    if &ma == 0
        call electrify#debug#logInfo("Ignore buffer update because buffer is not modifiable")
    endif

    if !exists("b:electrify_change_tick")
        let b:electrify_change_tick = -1
    endif

    if b:changedtick == b:electrify_change_tick
        return
    endif

    let b:electrify_change_tick = b:changedtick

    call electrify#debug#logInfo("Sending update for change tick: ".b:changedtick)

python << EOF
import vim
currentBuffer = vim.eval("expand('%:p')")

lines = []
for line in vim.current.buffer:
    lines.append(line)

args = {
"bufferName": currentBuffer,
"lines": lines
}

bufferChangedMessage = {
    'type': 'bufferChanged',
    'args': args,
    'context': electrify_get_context()
}

electrify_tcp_sendMessage(bufferChangedMessage)
EOF

endfunction

function! electrify#js#deserialize(obj)
    let splitted = join(split(a:obj, "\\"), "")
    execute "let remoteCompletion = ".splitted
    return remoteCompletion
endfunction

function! electrify#js#isEnabled() 
    return g:electrify_enabled
endfunction
