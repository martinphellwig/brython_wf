import browser.ajax

class FileIO:
  def __init__(self, data):
      self._data=data

  def read(self):
      return self._data

def urlopen(url, data=None, timeout=None):
    global result
    result=None

    def on_error(req):
        global result
        result=req

    def on_complete(req):
        global result
        result=req

    _ajax=browser.ajax.ajax()
    _ajax.bind('complete', on_complete)
    _ajax.bind('error', on_error)
    if timeout is not None:
       _ajax.set_timeout(timeout)

    _ajax.open('GET', url, False)
    if data is None:
       _ajax.send()
    else:
       _ajax.send(data)

    _dict_header={}
    for _header in result.headers:
        try:
          _key, _value = _header.split(':',1)
          if _key.strip() != '':
             _dict_header[_key]=_value.strip()
        except:
          pass

    try:
      _dict_header['status']="%s" % result.status
    except:
      pass
    return FileIO(result.text), url, _dict_header
