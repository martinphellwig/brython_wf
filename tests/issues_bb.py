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

print('passed all tests')
