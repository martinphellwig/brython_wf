x = set(['a','r','bg','Z'])
assert x==set(['bg','Z','a','r'])

assert len(x)==4
x.add('tail')
assert len(x)==5
x.add('tail')
assert len(x)==5
assert 'r' in x
assert 'rty' not in x

x = frozenset(['a','r','bg','Z'])
print(x)
assert x==set(['bg','Z','a','r'])

assert len(x)==4
x.add('tail')
assert len(x)==5
x.add('tail')
assert len(x)==5
assert 'r' in x
assert 'rty' not in x

print("passed all tests..")
