let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientJsPath = s:plugindir . "/js/lib/client/index.js"
let s:serverJsPath = s:plugindir . "/js/lib/server/index.js"

function! extropy#js#start()
    if extropy#js#isEnabled() == 0
        return
    endif

python << EOF
import urllib2
import subprocess
import os
import vim

serverPath = vim.eval("s:serverJsPath")
debugMode = vim.eval("g:extropy_nodeplugins_debugmode")

def isServerActive():
    active = False
    try: 
        output = urllib2.urlopen("http://127.0.0.1:3000/api/vim").read();
        # TODO: Validate that this actually a proper server
        # TODO: Use port specified here
        active = True
    except:
        pass
    return active

shouldStartServer = not isServerActive()
if shouldStartServer == True:

    startupinfo = subprocess.STARTUPINFO()
    if debugMode == "0":
        startupinfo.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW

    # TODO: Pass in port specified in config
    subprocess.Popen("node " + serverPath, startupinfo=startupinfo)

EOF
    call extropy#js#executeRemoteCommand("/api/start/".v:servername)
endfunction

function! extropy#js#initializeEventListeners()
    if extropy#js#isEnabled() == 0
        return
    endif

    augroup ExtropyEventListeners
        autocmd!
        autocmd! CursorHold * :call extropy#js#notifyBufferUpdated()
        autocmd! CursorHoldI * :call extropy#js#notifyBufferUpdated()
        autocmd! BufEnter * :call extropy#js#notifyBufferEvent("BufEnter")
        autocmd! VimLeave * :call extropy#js#notifyBufferEvent("VimLeave")
    augroup END
endfunction

function! extropy#js#notifyBufferEvent(eventName)
    if a:eventName == "BufEnter"
        let b:extropy_change_tick = -1
    endif
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/event/".a:eventName)
endfunction

function! extropy#js#callJsFunction(pluginName, commandName)
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/".a:pluginName."/".a:commandName)
endfunction

function! extropy#js#restartServer()
    call extropy#js#stopServer()
    call extropy#js#start()
endfunction

function! extropy#js#stopServer()
    call extropy#js#executeRemoteCommand("/api/stop")
endfunction

python << EOF
import urllib2
import json
import vim

class Request:
    def __init__(self, path, arguments):
        self._path = path
        self._arguments = arguments

    def send(self):
        headers = { "Content-Type": "application/json"}

        data = json.dumps(self._arguments)

        try:
            req = urllib2.Request("http://127.0.0.1:3000" + self._path, data, headers)
            response = urllib2.urlopen(req)
        except:
            print "NodeJS: There was an error communicating with NodeJS plugin server"
            pass
EOF

function! extropy#js#executeRemoteCommand(path)
    if extropy#js#isEnabled() == 0
        return

    endif
python << EOF
import vim
path = vim.eval("a:path")
currentBuffer = vim.eval("expand('%:p')")
line = vim.eval("line('.')")
col = vim.eval("col('.')")
byte = vim.eval("line2byte(line('.')) + col('.')")

values = {
"currentBuffer": currentBuffer,
"line": line,
"col": col,
"byte": byte
}

request = Request(path, values)
request.send()


EOF
endfunction

function! extropy#js#notifyBufferUpdated()

if extropy#js#isEnabled() == 0
    return
endif

if !exists("b:extropy_change_tick")
    let b:extropy_change_tick = -1
endif

if b:changedtick == b:extropy_change_tick
    return
endif

let b:extropy_change_tick = b:changedtick

python << EOF
import vim
import json

currentBuffer = vim.eval("expand('%:p')")
serverName = vim.eval("v:servername")

lines = []
for line in vim.current.buffer:
    lines.append(line)

args = {
"currentBuffer": currentBuffer,
"lines": lines
}

request = Request("/api/plugin/" + serverName + "/omnicomplete/update", args);
request.send()

EOF
endfunction

function! extropy#js#isEnabled() 
    return g:extropy_nodejs_enabled
endfunction
