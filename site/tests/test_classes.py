class baz:
  A = 8
class bar(baz):
  x = 0
  def test(self):
    return 'test in bar'
  def test1(self,x):
    return x*'test1'

class truc:
    machin = 99
    
class foo(bar,truc):
 def test(self):
  return 'test in foo'
 def test2(self):
   return 'test2'

obj = foo()
assert str(bar.test)=="<function bar.test>"
assert obj.A == 8
assert obj.x == 0
assert obj.test()=='test in foo'
assert obj.test1(2)=='test1test1'
assert obj.test2()=='test2'

assert obj.machin == 99

class stack(list):

    def dup(self):
        if len(self):
            self.append(self[-1])

x = stack([1,7])
assert str(x)=='[1,7]'
x.dup()
assert str(x)=='[1,7,7]'

class foo(list):
    pass
class bar(foo):
    pass
assert str(bar())=='[]'

# __call__

class StaticCall():
    def __init__(self):
        self.from_init = 88
    def __call__(self, *args, **kwargs):
        return 99

assert StaticCall().from_init == 88
assert StaticCall()() == 99

# property and object descriptors

class myclass:
  def __init__(self):
    self.a = 2

  @property
  def getx(self):
      return self.a + 5

assert myclass().getx == 7

@property
def gety(self):
    return self.a + 9

x.gety = gety

assert x.gety is gety

print('passed all tests..')
