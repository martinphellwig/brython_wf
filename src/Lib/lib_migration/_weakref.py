##  these are defined "quickly" to just satify import requirements.
##  please define properly later..

def getweakrefcount(obj):
    return 0

def getweakrefs(obj):
    return []

class ref:
  def __init__(self, obj, callback=None):
      self._obj=obj
      self._callback=callback

  def __getattr__(self):
      return self._obj

def proxy(obj):
    return obj

def CallableProxyType(obj):
    pass

def ProxyType(obj):
    pass

def ReferenceType(obj):
    pass
