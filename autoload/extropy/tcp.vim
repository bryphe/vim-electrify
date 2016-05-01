
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\socket.py'
execute 'pyfile '.s:path

python << EOF
extropy_tcp_socket = None;

def extropy_tcp_sendConnectMessage():
    if extropy_tcp_socket != None:
        initialMessage = {
            'type': 'connect',
            'args': {
                'serverName': serverName
            }
        }
        extropy_tcp_socket.sendMessage(initialMessage)

def extropy_tcp_sendMessage(message):
    if extropy_tcp_socket != None:
        extropy_tcp_socket.sendMessage(message)
EOF

function! extropy#tcp#connect(ipAddress, port)
python << EOF
import json

if extropy_tcp_socket == None:
    ipAddress = vim.eval("a:ipAddress")
    port = int(vim.eval("a:port"))
    serverName = vim.eval("v:servername")
    extropy_tcp_socket = SocketListener(ipAddress, port)
    extropy_tcp_socket.connect()

extropy_tcp_sendConnectMessage()
EOF
endfunction

function! extropy#tcp#isConnected()
let connected = 0
python << EOF
import vim
if extropy_tcp_socket != None:
    if extropy_tcp_socket.isConnected():
        vim.command("let connected = 1")
EOF
return connected
endfunction

function! extropy#tcp#sendConnectMessage()
python << EOF
extropy_tcp_sendConnectMessage()
EOF
endfunction

function! extropy#tcp#disconnect()
python << EOF
if extropy_tcp_socket != None:
    extropy_tcp_socket.disconnect()
    extropy_tcp_socket = None
EOF
endfunction

function! extropy#tcp#warnIfNotConnected()
    if extropy#tcp#isConnected() == 0
        echohl WarningMsg
        echom "Warning: ExNodeJs server has been disconnected, javascript plugins will not work."
        echohl NONE
    endif
endfunction

function! extropy#tcp#sendMessage(message)

call extropy#tcp#warnIfNotConnected()

python << EOF
message = vim.eval("a:message")
if extropy_tcp_socket != None:
    extropy_tcp_socket.sendMessage(message)
EOF
endfunction

function! extropy#tcp#getMessages()
let ret = []
python << EOF
import json
if extropy_tcp_socket != None:
    messages = extropy_tcp_socket.getMessages()
    messagesAsJson = json.dumps(messages)
    vim.command("let ret = " + messagesAsJson)
EOF
return ret
endfunction

