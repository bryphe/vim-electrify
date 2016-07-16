" Tcp.vim
" Utilities for integrating with the TCP server

let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\socket.py'
execute 'pyfile '.s:path

python << EOF
electrify_tcp_socket = None;

def electrify_tcp_sendConnectMessage():
    if electrify_tcp_socket != None:
        initialMessage = {
            'type': 'connect',
            'args': {
                'serverName': serverName
            }
        }
        electrify_tcp_socket.sendMessage(initialMessage)

def electrify_tcp_sendMessage(message):
    if electrify_tcp_socket != None:
        electrify_tcp_socket.sendMessage(message)

def electrify_tcp_getMessages():
    if electrify_tcp_socket != None:
        return electrify_tcp_socket.getMessages()
    else:
        return []
EOF

function! electrify#tcp#connect(ipAddress, port)
let s:previousIpAddress = a:ipAddress
let s:previousPort = a:port
python << EOF
import json

if electrify_tcp_socket == None:
    ipAddress = vim.eval("a:ipAddress")
    port = int(vim.eval("a:port"))
    serverName = vim.eval("v:servername")
    electrify_tcp_socket = SocketListener(ipAddress, port)
    electrify_tcp_socket.connect()

electrify_tcp_sendConnectMessage()
EOF
endfunction

function! electrify#tcp#isConnected()
let connected = 0
python << EOF
import vim
if electrify_tcp_socket != None:
    if electrify_tcp_socket.isConnected():
        vim.command("let connected = 1")
EOF
return connected
endfunction

function! electrify#tcp#sendConnectMessage()
python << EOF
electrify_tcp_sendConnectMessage()
EOF
endfunction

function! electrify#tcp#disconnect()
python << EOF
if electrify_tcp_socket != None:
    electrify_tcp_socket.disconnect()
    electrify_tcp_socket = None
EOF
endfunction

function! electrify#tcp#reconnect()
    call electrify#tcp#disconnect()
    call electrify#tcp#connect(s:previousIpAddress, s:previousPort)
endfunction

function! electrify#tcp#warnIfNotConnected()
    if electrify#tcp#isConnected() == 0
        echohl WarningMsg
        echom "Warning: ExNodeJs server has been disconnected, javascript plugins will not work."
        echohl NONE
    endif
endfunction

function! electrify#tcp#sendMessage(message)

call electrify#tcp#warnIfNotConnected()

python << EOF
message = vim.eval("a:message")
if electrify_tcp_socket != None:
    electrify_tcp_socket.sendMessage(message)
EOF
endfunction
