import collections

_d=collections.defaultdict(int)

_d['a']+=1
_d['a']+=2
_d['b']+=4

assert _d['a'] == 3
assert _d['b'] == 4

s = 'mississippi'
_d = collections.defaultdict(int)
for k in s:
    _d[k] += 1

_values=list(_d.values())
_values.sort()
assert _values == [1, 2, 4, 4]

_keys=list(_d.keys())
_keys.sort()
assert _keys == ['i', 'm', 'p', 's']

#now try with default being list (ie, empty list)
_listdict=collections.defaultdict(list)

for _i in range(10):
    _listdict['mylist'].append(_i)

assert _listdict['not called'] == []
assert _listdict['mylist'] == [0,1,2,3,4,5,6,7,8,9]
