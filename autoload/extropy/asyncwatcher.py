import subprocess
import time
import threading
import Queue

# AsyncWatcher is a helper class to sidestep the
# limitations of CursorHold/CursorHoldI + updatetime.
# This is designed to use remote-expr to flush commands
class AsyncWatcher:
    def __init__(self, serverName, funcToGetMessages, sleepTimeInSeconds=0.1):
        self._serverName = serverName
        self._funcToGetMessages = funcToGetMessages
        self._sleepTime = sleepTimeInSeconds
        self._messages = Queue.Queue()

    def start(self):
        self._stopEvent = threading.Event()
        self._watchThread = threading.Thread(target = self._triggerCommandFlush)
        self._watchThread.start()

    def getMessages(self):
        ret = []
        try:
            while True:
                message = self._messages.get_nowait()
                ret.append(message);
        except:
            pass
        return ret

    def stop(self):
        self._stopEvent.set()

    def _triggerCommandFlush(self):
        while (not self._stopEvent.is_set()):

            messages = self._funcToGetMessages()

            if len(messages) > 0:
                for message in messages:
                    self._messages.put(message)

                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess._subprocess.STARTF_USESHOWWINDOW
                subprocess.Popen("vim --servername " + self._serverName + " --remote-expr extropy#command#flushIncomingCommands()", startupinfo=startupinfo)
                # subprocess.Popen("vim --servername GVIM --remote-expr extropy#command#echo('derp3')", startupinfo=startupinfo)

            self._stopEvent.wait(self._sleepTime)

