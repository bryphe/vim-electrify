# Server.py
#
# Helper class for creating the electron server, hosting the JS plugins

import urllib2
import subprocess
import os
import vim

class Server:
    def __init__(self, pluginPath, serverPath, tcpPort, wsPort):
        self._tcpPort = tcpPort
        self._wsPort = wsPort
        self._started = False
        self._serverProcess = None
        self._pluginPath = pluginPath
        self._serverPath = serverPath

    def start(self):
        if self.isRunning() == True:
            self.stop()

        startupinfo = subprocess.STARTUPINFO()

        # TODO: Remove 'cmd' in non-windows platforms
        path = os.path.join(self._pluginPath, "js", "node_modules", ".bin", "electron.cmd")

        # TODO: Pass in port specified in config
        self._serverProcess = subprocess.Popen(path + " " + self._serverPath + " --tcpPort " + str(self._tcpPort) + " --wsPort " + str(self._wsPort), startupinfo=startupinfo)

    def stop(self):
        if self._serverProcess != None:
            self._serverProcess.kill()
            self._serverProcess = None
        self._started = False

    def isRunning(self):
        return self._started
