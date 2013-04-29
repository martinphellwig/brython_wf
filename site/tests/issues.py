# issue 3
matrix = ['%s%d'%(a,n) for a in 'abc' for n in [1,2,3]]
assert 'a1' in matrix

# issue 5
range_tuple = tuple(range(7))
assert range_tuple == (0,1,2,3,4,5,6)

# issue 6
map_tuples = zip( 'abc', [1,2,3])
map_array = ['%s%d'%(l, n) for l, n in map_tuples
    if '%s%d'%(l, n) in 'a1b2']
assert 'a1' in map_array, 'incorrect tuple %s'%map_array

# issue 7
def fail_local():
    local_abc = 'abc'
    letnum = [[letter+str(num) for letter in local_abc]
            for num in range(3)]
    return letnum

local_fail = fail_local()
assert ['a0', 'b0', 'c0'] in local_fail, 'failed local %s'%local_fail

def fail_local1():
    local_abc = 'abc'
    letnum = dict((num,[letter+str(num) for letter in local_abc]) for num in range(3))
    return letnum

fail_local1()

# issue 14
a = {1:1,2:4}
assert a.pop(1) == 1, 'Error in pop'
assert a=={2:4}

# issue 15
def no_lambda(fail_arg):
    lbd = lambda arg= fail_arg: arg
    return [i for i in lbd()]

assert no_lambda([1,2]) == [1,2], 'Fail lambda namespace'

# issue 16
class Noeq:
    def __init__(self,oid):
        self.oid = oid

ne1, ne2 = Noeq(0),Noeq(1)
fail_rmv = [ne1, ne2]
fail_rmv.remove(ne1)
assert fail_rmv == [ne2], 'Fail remove obj from list'

# issue 17
class No_dic_comp:
    def __init__(self,oid):
        self.oid = oid
        self.ldic = {i: self.oid for i in 'ab'}

ndc = No_dic_comp(0)
assert ndc.ldic['a'] == 0, ne1

# issue 18
class Base:
    pass

class No_inherit(Base):
    def __init__(self,oid,ab):
        self.oid , self.ab= oid, ab

ndc = No_inherit(0,'ab')
assert  isinstance(ndc,No_inherit),'Not instance %s'%ndc
assert ndc.oid == 0,  ndc.oid

# issue 19
class No_static:
    OBJID = 0
    def __init__(self,oid):
        self.oid = oid
        self.gid = No_static.OBJID
        No_static.OBJID += 1

gids = (No_static(0).gid,No_static(1).gid)
assert gids == (0,1), 'Fail incrementing static (%d,%d)'%gids

# issue 20
assert 'fail slice string!'[5:-1] == 'slice string', 'Failure in string slicing'

#issue 21
_s='   abc   '
assert _s.rjust(15, 'b') == 'bbbbbb   abc   '

# issue 24
import math
eval_zero = eval('math.sin(0)')
exec('exec_zero=math.sin(0)')
assert eval_zero == exec_zero, 'no math in exe or eval for sin(0) = %f'%math.sin(0)

# issue 29
import math
eval_zero = eval('math.sin(%d)'%0)
#eval_zero = 0
exec('exec_zero=math.sin(%d)'%0)
assert eval_zero == exec_zero, ' exe or eval for fails string subs = %f'%math.sin(0)

# issue 30
def delete(delete):
    return delete

class Delete:
    def delete(self):
        delete = 0
        return delete

delete = delete(Delete().delete())
assert delete == 0, 'name delete cannot be used %s'%delete

# issue 31
SEED= 0
class Base:
    def __init__(self):
        global SEED
        self.value = SEED = SEED + 1

class Inherit(Base):
    def __init__(self):
        global SEED
        self.value = SEED = SEED + 1

one = (Inherit().value)
assert one == 1, 'Init recursed: %d'%one

#issue 43
class myclass:
  @property
  def getx(self):
      return 5

c=myclass()
assert c.getx == 5

#issue 45

assert 2**2 == 4
assert 2.0**2 == 4.0
assert 2**2.0 == 4.0
assert 2.0**2.0 == 4.0
#also do 3**2 since 2**2 == 2*2
assert 3**2 == 9
assert 3.0**2 == 9.0
assert 3**2.0 == 9.0
assert 3.0**2.0 == 9.0

print('passed all tests')
