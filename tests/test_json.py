import json
assert json.parse(json.stringify(1))==1
assert json.parse(json.stringify(1.2))==1.2
assert json.parse(json.stringify('a'))=='a'
assert json.parse(json.stringify([1,2]))==[1,2]
assert json.parse(json.stringify({1:2}))=={1:2}
assert json.parse(json.stringify({1,2}))=={1,2}

print('all tests ok..')