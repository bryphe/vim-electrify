let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientJsPath = s:plugindir . "/js/lib/client/index.js"
let s:serverJsPath = s:plugindir . "/js/lib/server/index.js"

let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') 
execute 'pyfile '.s:path. '\server.py'
execute 'pyfile '.s:path. '\request.py'

" Tracking if there was an error connecting to the server
let s:isServerError = 0

python << EOF

def extropy_get_context():
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

function! extropy#js#start()
    if extropy#js#isEnabled() == 0
        return
    endif

python << EOF
import vim
serverPath = vim.eval("s:serverJsPath")
debugMode = vim.eval("g:extropy_nodeplugins_debugmode")

request = Request("http://127.0.0.1:3000/")
response = request.send();

if response == None:
    server = Server(serverPath, 3000)
    server.start(debugMode)

    # Validate response after starting it
    request = Request("http://127.0.0.1:3000")
    response2 = request.send()

    if response2 == None:
        print "Issue starting up server - please report this issue."
EOF

    call extropy#tcp#connect("127.0.0.1", 4001)
endfunction

function! extropy#js#disconnectTcp()
    call extropy#tcp#disconnect()
endfunction

function! extropy#js#reconnect()
    call extropy#tcp#reconnect()
    sleep 500m
    call extropy#js#notifyBufferEvent("BufEnter")
endfunction

function! extropy#js#notifyBufferEvent(eventName)
python << EOF
message = {
    'type': 'event',
    'args': {
        'eventName': vim.eval("a:eventName")
    },
    'context': extropy_get_context()
}

extropy_tcp_sendMessage(message)
EOF

endfunction

function! extropy#js#callJsFunction(pluginName, commandName, qArgs)
call extropy#debug#logInfo("extropy#js#callJsFunction: PluginName: ".a:pluginName." Command: ".a:commandName." Args: ".a:qArgs)
call extropy#tcp#warnIfNotConnected()
python << EOF
jsFunctionMessage = {
    'type': 'command',
    'args': {
        'plugin': vim.eval("a:pluginName"),
        'command': vim.eval("a:commandName"),
        'qargs': vim.eval("a:qArgs")
    },
    'context': extropy_get_context()
}

extropy_tcp_sendMessage(jsFunctionMessage)
EOF
endfunction

function! extropy#js#restartServer()
    call extropy#js#stopServer()
    call extropy#js#clearServerError()
    call extropy#js#start()
endfunction

function! extropy#js#clearServerError() 
    let s:isServerError = 0
endfunction

function! extropy#js#stopServer()

call extropy#tcp#disconnect()
python << EOF
request = Request("http://127.0.0.1:3000/api/stop")
response = request.send({});
EOF
endfunction

function! extropy#js#notifyBufferUpdated()
    if extropy#js#isEnabled() == 0
        return
    endif

    if &ma == 0
        call extropy#debug#logInfo("Ignore buffer update because buffer is not modifiable")
    endif

    if !exists("b:extropy_change_tick")
        let b:extropy_change_tick = -1
    endif

    if b:changedtick == b:extropy_change_tick
        return
    endif

    let b:extropy_change_tick = b:changedtick

    call extropy#debug#logInfo("Sending update for change tick: ".b:changedtick)

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
    'context': extropy_get_context()
}

extropy_tcp_sendMessage(bufferChangedMessage)
EOF

endfunction

function! extropy#js#deserialize(obj)
    let splitted = join(split(a:obj, "\\"), "")
    execute "let remoteCompletion = ".splitted
    return remoteCompletion
endfunction

function! extropy#js#isEnabled() 
    return g:extropy_nodejs_enabled
endfunction
