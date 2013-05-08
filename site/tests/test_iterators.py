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
    
print("passed all tests...")
