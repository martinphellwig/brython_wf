class ProxyType:

    def __init__(self,obj):
        self.obj = obj

CallableProxyType = ProxyType
ProxyTypes = [ProxyType,CallableProxyType]

class ReferenceType:

    def __init__(self,obj):
        self.obj = obj

class ref:

    def __init__(self,obj):
        self.obj = ReferenceType(obj)

def getweakrefcount(obj):
    return 1

def getweakrefs(obj):
    return obj


def proxy(obj,callback):
    return ProxyType(obj)

