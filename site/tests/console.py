import sys
import time
import random
import dis
import traceback

#doctype html 5 causes issues with setting height of the container
#so python to the rescue! :)
import pydom
_height=doc.documentElement.clientHeight
_s=pydom.Selector('#container')
#set height of container to 66% of screen
_s.get().height('%spx' % int(_height*0.66))

_rand=random.random()
has_ace = True
try:
    editor=JSObject(ace).edit("editor")
    editor.getSession().setMode("ace/mode/python")
except:
    import html
    editor = html.TEXTAREA(rows=20,cols=70)
    doc["editor"] <= editor
    def get_value(): return editor.value
    def set_value(x):editor.value=x
    editor.getValue = get_value
    editor.setValue = set_value
    has_ace = False

if sys.has_local_storage:
    from local_storage import storage
else:
    storage = False

def reset_src():
    if storage and "py_src" in storage:
       editor.setValue(storage["py_src"])
    else:
       editor.setValue('for i in range(10):\n\tprint(i)')

    editor.scrollToRow(0)
    editor.gotoLine(0)

def reset_src_area():
    if storage and "py_src" in storage:
       editor.value = storage["py_src"]
    else:
       editor.value = 'for i in range(10):\n\tprint(i)'

def write(data):
    doc["console"].value += str(data)

#sys.stdout = object()    #not needed when importing sys via src/Lib/sys.py
sys.stdout.write = write

#sys.stderr = object()    # ditto
sys.stderr.write = write

def to_str(xx):
    return str(xx)

doc['version'].text = '.'.join(map(to_str,sys.version_info))

output = ''

def show_console():
    doc["console"].value = output
    doc["console"].cols = 60

def clear_text():
    editor.setValue('')
    if sys.has_local_storage:
        storage["py_src"]=''

    doc["console"].value=''

def run():
    global output
    doc["console"].value=''
    src = editor.getValue()
    if storage:
       storage["py_src"]=src

    t0 = time.perf_counter()
    try:
        exec(src)
    except Exception as exc:
        traceback.print_exc()
    output = doc["console"].value

    print('<completed in %s ms>' %(time.perf_counter()-t0)*1000)

# load a Python script
def on_complete(req):
    editor.setValue(req.text)
    if has_ace:
        editor.scrollToRow(0)
        editor.gotoLine(0)

def load(evt):
    _name=evt.target.value
    req = ajax()
    req.on_complete = on_complete
    req.open('GET',_name+'?foo=%s' % _rand,False)
    req.send()

def show_js():
    src = editor.getValue()
    doc["console"].value = dis.dis(src)

def change_theme(evt):
    _theme=evt.target.value
    editor.setTheme(_theme)

    if storage:
       storage["ace_theme"]=_theme

def reset_theme():
    if storage:
       if "ace_theme" in storage:
          editor.setTheme(storage["ace_theme"])
          doc["ace_theme"].value=storage["ace_theme"]

if has_ace:
    reset_src()
    reset_theme()
else:
    reset_src_area()
