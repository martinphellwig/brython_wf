import json
assert json.parse(json.stringify(1))==1
assert json.parse(json.stringify(1.2))==1.2
assert json.parse(json.stringify('a'))=='a'
assert json.parse(json.stringify([1,2]))==[1,2]
assert json.parse(json.stringify({1:2}))=={1:2}
assert json.parse(json.stringify({1,2}))=={1,2}

xx = '{"status": 0, "result": ["memit/logo00.png", "memit/logo01.png"]}'
abyss = json.parse(xx)
assert abyss.result[0]=='memit/logo00.png'
assert abyss.status==0
print('all tests ok..')