
let s:path = fnamemodify(resolve(expand('<sfile>:p')), ':h') . '\socket.py'
execute 'pyfile '.s:path

python << EOF
socket = None;
EOF

function! extropy#tcp#connect(ipAddress, port)
python << EOF
ipAddress = vim.eval("a:ipAddress")
port = int(vim.eval("a:port"))
socket = SocketListener(ipAddress, port)
socket.connect()
EOF
endfunction

function! extropy#tcp#disconnect()
python << EOF
if socket != None:
    socket.disconnect()
EOF
endfunction

