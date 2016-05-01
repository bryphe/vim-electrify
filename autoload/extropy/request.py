import urllib2
import json
import vim

class Request:
    def __init__(self, path):
        self._path = path

    def send(self, arguments=None):
        try:
            req = urllib2.Request(self._path)
            response = urllib2.urlopen(req)
            ret = response.read()
        except:
            ret = None
            pass

        return ret
