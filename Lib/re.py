I = 'i'

class MatchObject:

    def __init__(self,mo):
        self.mo = mo

    def groups(self):
        return self.mo[1:]

def search(pattern,src,flags=None):
    flag = 'g'
    if flags:
        flag += flags
    mo = __BRYTHON__.re(pattern,flag).exec(src)
    if not mo:
        return None
    else:
        return MatchObject(mo)
        
    