import urllib2
import json
import vim

class Request:
    def __init__(self, path):
        self._path = path

    def send(self, arguments=None):
        headers = { "Content-Type": "application/json"}

        if arguments != None:
            data = json.dumps(arguments)

        try:
            req = urllib2.Request(self._path, data, headers)
            response = urllib2.urlopen(req)
            ret = response
        except:
            ret = None
            pass

        return ret
