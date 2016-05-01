import subprocess
import time
import threading

# AsyncWatcher is a helper class to sidestep the
# limitations of CursorHold/CursorHoldI + updatetime.
# This is designed to use remote-expr to flush commands
class AsyncWatcher:
    def __init__(self, serverName, sleepTimeInSeconds=0.1):
        self._serverName = serverName
        self._sleepTime = sleepTimeInSeconds

    def start(self):
        self._stopEvent = threading.Event()
        self._watchThread = threading.Thread(target = self._triggerCommandFlush)
        self._watchThread.start()

    def stop(self):
        self._stopEvent.set()

    def _triggerCommandFlush(self):
        while (not self._stopEvent.is_set()):
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW
            subprocess.Popen("vim --servername " + self._serverName + " --remote-expr extropy#command#flushIncomingCommands()", startupinfo=startupinfo)
            # subprocess.Popen("vim --servername GVIM --remote-expr extropy#command#echo('derp3')", startupinfo=startupinfo)
            self._stopEvent.wait(self._sleepTime)

