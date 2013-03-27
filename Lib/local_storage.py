# local storage in browser

class LocalStorage:

    def __init__(self):
        if not __BRYTHON__.has_local_storage:
            raise NameError('local storage is not supported by the browser')
        self.store = __BRYTHON__.local_storage()
        
    def __delitem__(self,key):
        self.store.removeItem(key)

    def __getitem__(self,key):
        for _i in range(0, self.store.length):
            if self.store.key(_i) == key:
               return self.store.getItem(key)

        raise KeyError(key)
        return

    def __setitem__(self,key,value):
        self.store.setItem(key,value)

    #implement "in" functionality
    def __contains__(self, key):
        for _i in range(0, self.store.length):
            if self.store.key(_i) == key:
               return True

        return False

storage = LocalStorage()
