import threading
import Queue
import socket
import time
import json

class SocketListener:

    def __init__(self, ip, port):
        self.sock = None
        self.ip = ip
        self.port = port
        self.connected = False

    def isConnected(self):
        return self.connected

    def connect(self):
        import socket 

        BUFFER_SIZE = 1

        if self.sock == None:
            self.messagesToSend = Queue.Queue()
            self.receivedMessages = Queue.Queue()
            self.stopEvent = threading.Event()

            self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_NODELAY, 1)
            try:
                self.sock.connect((self.ip, self.port))
                self.receivedThread = threading.Thread(target = self._listenForMessages)
                self.receivedThread.Daemon = True
                self.sendThread = threading.Thread(target = self._sendMessages)
                self.sendThread.Daemon = True
                self.receivedThread.start()
                self.sendThread.start()
                self.connected = True
            except:
                self.sock = None
                self.connected = False

    def disconnect(self):
        import socket
        if self.sock == None:
            return

        print "closing"
        try:
            self.sock.shutdown(socket.SHUT_RDWR)
        except:
            pass
        self.stopEvent.set()
        self.sock.close()
        self.sock = None
        self.connected = False

    def sendMessage(self, msg):
        if self.connected == False:
            self.connect()

        import json
        msg = json.dumps(msg) + "\n"
        self.messagesToSend.put(msg)

    def getMessages(self):
        ret = []
        try:
            while True:
                message = self.receivedMessages.get_nowait()
                ret.append(message);
        except:
            pass
        return ret

    def _listenForMessages(self):
        while (not self.stopEvent.is_set()):
            try:
                message = self.messagesToSend.get_nowait()
                self.sock.send(message)
            except:
                pass
            self.stopEvent.wait(0.01)

    def _sendMessages(self):
        buffer = ""
        character = ""
        characters = ""
        while (not self.stopEvent.is_set()):
            try:
                characters = self.sock.recv(1024)
            except:
                buffer = ""
                self.connected = False
                # TODO: Set error flag
                # print "Exception receiving characters"
                pass

            if self.connected == True:
                for character in characters:
                    if '\n' in character:
                        self.receivedMessages.put(buffer)
                        # print "Got message: " + buffer
                        buffer = ""
                    else:
                        buffer += character

            self.stopEvent.wait(0.01)

