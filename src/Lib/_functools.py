def partial(func, *args, **keywords):
    def newfunc(*fargs, **fkeywords):
        newkeywords = keywords.copy()
        newkeywords.update(fkeywords)
        return func(*(args + fargs), **newkeywords)
    newfunc.func = func
    newfunc.args = args
    newfunc.keywords = keywords
    return newfunc

def reduce(func,iterable,initializer=None):
    args = iter(iterable)
    if initializer is not None:
        res = initializer
    else:
        res = next(arg)
    while True:
        try:
            res = func(res,next(args))
        except StopIteration:
            return res

def cmp_to_key(func):
    """Transform an old-style comparison function to a key function. 
    
    A comparison function is any callable that accept two arguments, 
    compares them, and returns a negative number for less-than, zero for 
    equality, or a positive number for greater-than. A key function is a 
    callable that accepts one argument and returns another value indicating 
    the position in the desired collation sequence."""

    # http://stackoverflow.com/questions/16362744/how-does-pythons-cmp-to-key-function-work
    # by Martijn Pieters
    class K:
        __slots__ = ['obj']
        def __init__(self, obj, *args):
            self.obj = obj
        def __lt__(self, other):
            return mycmp(self.obj, other.obj) < 0
        def __gt__(self, other):
            return mycmp(self.obj, other.obj) > 0
        def __eq__(self, other):
            return mycmp(self.obj, other.obj) == 0
        def __le__(self, other):
            return mycmp(self.obj, other.obj) <= 0
        def __ge__(self, other):
            return mycmp(self.obj, other.obj) >= 0
        def __ne__(self, other):
            return mycmp(self.obj, other.obj) != 0
        def __hash__(self):
            raise TypeError('hash not implemented')
        
    return K(func)