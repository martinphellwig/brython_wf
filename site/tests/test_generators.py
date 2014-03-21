# examples from http://linuxgazette.net/100/pramode.html

def foo():
    yield 1
    yield 2

g = foo()
assert next(g)==1
assert next(g)==2

def foo():
    return
    yield 1

assert [x for x in foo()]==[]

def foo(n):
    for i in range(2):
        if (n < 3): 
            yield 1
        else: 
            return
        yield 2

assert [x for x in foo(2)]==[1, 2, 1, 2]
assert [x for x in foo(20)]==[]

def foo():
    i = 0
    while 1:
        yield i
        i = i + 1
g = foo()
for i in range(100):
    assert next(g)==i

def pi_series():
    sum = 0
    i = 1.0; j = 1
    while(1):
        sum = sum + j/i
        yield 4*sum
        i = i + 2; j = j * -1

g = pi_series()
for i in range(20):
    x = next(g)
assert x==3.09162380666784

def firstn(g, n):
    for i in range(n):
        yield next(g)
x = list(firstn(pi_series(), 8))
assert len(x)==8
assert x[-1]==3.017071817071818

def sqr(x):
    return x*x

def f():
    yield sqr(4)
    yield sqr(9)

assert [x for x in f()]==[16, 81]

def euler_accelerator(g):
    def sqr(x):
        return x*x
    s0 = next(g) # Sn-1
    s1 = next(g) # Sn
    s2 = next(g) # Sn+1
    while 1:
        yield s2 - (sqr(s2 - s1))/(s0 - 2*s1 + s2)
        s0, s1, s2 = s1, s2, next(g)
G = euler_accelerator(pi_series())
t = [next(G) for i in range(5)]
assert t[-1]==3.1427128427128435

# examples from unittests/test_generators.py
def f():
    yield 1
    raise StopIteration
    yield 2 # never reached

assert [x for x in f()] == [1]

def g1():
    try:
        return
    except:
        yield 1

assert list(g1())==[]

def g2():
    try:
        raise StopIteration
    except:
        yield 42

assert list(g2())==[42]

def g3():
    try:
        return
    finally:
        yield 1

assert list(g3())==[1]

def yrange(n):
    for i in range(n):
        yield i

assert list(yrange(5))==[0, 1, 2, 3, 4]

# Generators can call other generators:

def zrange(n):
    for i in yrange(n):
        yield i

assert list(zrange(5))==[0, 1, 2, 3, 4]

#     Restriction:  A generator cannot be resumed while it is actively
#    running:

def g():
    i = next(me)
    yield i

me = g()

try:
    next(me)
except ValueError:
    pass

# Specification: Generators and Exception Propagation

def f():
    return 1//0

def g():
    yield f()  # the zero division exception propagates
    yield 42   # and we'll never get here

k = g()
try:
    next(k)
except ZeroDivisionError:
    pass

assert list(k)==[]

# Specification: Try/Except/Finally
    
def f():
    try:
        yield 1
        try:
            yield 2
            1//0
            yield 3  # never get here
        except ZeroDivisionError:
            yield 4
            yield 5
            raise
        except:
            yield 6
        yield 7     # the "raise" above stops this
    except:
        yield 8
    yield 9
    try:
        x = 12
    finally:
        yield 10
    yield 11
assert list(f())==[1, 2, 4, 5, 8, 9, 10, 11]

# The difference between yielding None and returning it.

def g():
     for i in range(3):
         yield None
     yield None
     return
assert list(g())==[None, None, None, None]

# Ensure that explicitly raising StopIteration acts like any other exception
# in try/except, not like a return.

def g():
     yield 1
     try:
         raise StopIteration
     except:
         yield 2
     yield 3
assert list(g())==[1, 2, 3]