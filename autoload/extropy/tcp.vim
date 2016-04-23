
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\socket.py'
execute 'pyfile '.s:path

python << EOF
socket = None;
EOF

function! extropy#tcp#connect(ipAddress, port)
python << EOF
import json

if socket == None:
    ipAddress = vim.eval("a:ipAddress")
    port = int(vim.eval("a:port"))
    serverName = vim.eval("v:servername")
    socket = SocketListener(ipAddress, port)
    socket.connect()

    initialMessage = {
        'type': 'connect',
        'args': {
            'serverName': serverName
        }
    }
    socket.sendMessage(json.dumps(initialMessage))
EOF
endfunction

function! extropy#tcp#disconnect()
python << EOF
if socket != None:
    socket.disconnect()
EOF
endfunction

function! extropy#tcp#sendMessage(message)
python << EOF
message = vim.eval("a:message")
if socket != None:
    socket.sendMessage(message)
EOF
endfunction

function! extropy#tcp#getMessages()
ret = []
python << EOF
import json
if socket != None:
    messages = socket.getMessages()
    messagesAsJson = json.dumps(messages)
    vim.command("let ret = " + messagesAsJson)
EOF
return ret
endfunction

