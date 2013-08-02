x=[1,2]
z = iter(x)
assert z.__next__()==1
assert z.__next__()==2
z=iter(x)
assert next(z)==1
next(z)
try:
    next(z)
except StopIteration:
    pass

x="az"
z = iter(x)
assert z.__next__()=='a'
assert z.__next__()=='z'
z=iter(x)
assert next(z)=='a'
next(z)
try:
    next(z)
except StopIteration:
    pass
    
x = {'a':1,'b':2}
z = iter(x)

assert next(z)=='a'
assert next(z)=='b'

x = {'a',1}
z = iter(x)

assert next(z)=='a'
assert next(z)==1

x = {'a':1}.items()
y = iter(x)
assert next(y)==['a',1]
try:
    next(y)
except StopIteration:
    pass

class Counter:

    def __init__(self, low, high):
        self.current = low
        self.high = high

    def __iter__(self):
        return self

    def __next__(self):
        if self.current > self.high:
            raise StopIteration
        else:
            self.current += 1
            return self.current - 1

x = Counter(2,8)
assert next(x)==2

assert isinstance(range(5),range)
x = (i for i in range(3))
assert str(x.__class__)=="<class 'generator'>"

x = iter([1,2,3])
assert str(x.__class__) == "<class 'list_iterator'>"

print("passed all tests...")
