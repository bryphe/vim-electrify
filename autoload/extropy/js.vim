let s:plugindir = expand('<sfile>:p:h:h:h')
let s:clientJsPath = s:plugindir . "/js/lib/client/index.js"
let s:serverJsPath = s:plugindir . "/js/lib/server/index.js"

function! extropy#js#start()

python << EOF
import urllib2
import subprocess
import os
import vim

serverPath = vim.eval("s:serverJsPath")

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
    startupinfo.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW

    # TODO: Pass in port specified in config
    subprocess.Popen("node " + serverPath, startupinfo=startupinfo)

EOF
    call extropy#js#executeRemoteCommand("/api/start/".v:servername)
endfunction

function! extropy#js#initializeEventListeners()
    augroup ExtropyEventListeners
        autocmd!
        autocmd! BufEnter * :call extropy#js#notifyBufferEvent("BufEnter")
        autocmd! VimLeave * :call extropy#js#notifyBufferEvent("VimLeave")
    augroup END
endfunction

function! extropy#js#notifyBufferEvent(eventName)
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/event/".a:eventName)
endfunction

function! extropy#js#callJsFunction(pluginName, commandName)
    call extropy#js#executeRemoteCommand("/api/plugin/".v:servername."/".a:pluginName."/".a:commandName)
endfunction

function! extropy#js#executeRemoteCommand(path)

python << EOF
import urllib2
import json
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

headers = { "Content-Type": "application/json"}

data = json.dumps(values)

try:
    req = urllib2.Request("http://127.0.0.1:3000" + path, data, headers)
    response = urllib2.urlopen(req)
except:
    print "NodeJS: There was an error communicating with NodeJS plugin server"
    pass
# TODO: Handle error case error (connection refused / server goes down / etc)

EOF
endfunction


