
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\socket.py'
execute 'pyfile '.s:path

python << EOF
extropy_tcp_socket = None;
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

    initialMessage = {
        'type': 'connect',
        'args': {
            'serverName': serverName
        }
    }
    extropy_tcp_socket.sendMessage(initialMessage)
EOF
endfunction

function! extropy#tcp#disconnect()
python << EOF
if extropy_tcp_socket != None:
    extropy_tcp_socket.disconnect()
    extropy_tcp_socket = None
EOF
endfunction

function! extropy#tcp#sendMessage(message)
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

