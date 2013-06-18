import json
assert json.loads(json.dumps(1))==1
assert json.loads(json.dumps(1.2))==1.2
assert json.loads(json.dumps('a'))=='a'
assert json.loads(json.dumps([1,2]))==[1,2]
assert json.loads(json.dumps({1:2}))=={1:2}
#assert json.loads(json.dumps({1,2}))=={1,2}

xx = '{"status": 0, "result": ["memit/logo00.png", "memit/logo01.png"]}'
abyss = json.loads(xx)
assert abyss["result"][0]=='memit/logo00.png'
assert abyss["status"]==0
print('all tests ok..')