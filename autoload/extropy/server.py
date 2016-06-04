import urllib2
import subprocess
import os
import vim

class Server:
    def __init__(self, serverPath, port):
        self._port = port
        self._started = False
        self._serverProcess = None

    def start(self, debugMode):
        if self.isRunning() == True:
            self.stop()

        startupinfo = subprocess.STARTUPINFO()
        if debugMode == "0":
            startupinfo.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW

        currentDir = os.path.dirname(os.path.realpath("__file__"))
        currentDir = os.path.dirname(currentDir);
        path = os.path.join(currentDir, "js", "node_modules", ".bin", "electron.cmd")

        # TODO: Pass in port specified in config
        self._serverProcess = subprocess.Popen(path + " " + serverPath, startupinfo=startupinfo)

    def stop(self):
        if self._serverProcess != None:
            self._serverProcess.kill()
            self._serverProcess = None
        self._started = False

    def isRunning(self):
        return self._started
