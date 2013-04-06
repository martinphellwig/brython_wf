def makebold(fn):
    def wrapped():
        return "<b>" + fn() + "</b>"
    return wrapped

def makeitalic(fn):
    def wrapped():
        return "<i>" + fn() + "</i>"
    return wrapped

@makebold
def hello1():
    return "hello world"
assert hello1()=="<b>hello world</b>"

@makebold
@makeitalic
def hello2():
    return "hello world"

assert hello2()=="<b><i>hello world</i></b>"

print('passed all tests..')
