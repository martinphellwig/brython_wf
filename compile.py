## execute this file via node.js
# $> nodejs node_bridge.js compile.py
#
# Author: Billy Earney
# Date: 04/19/2013
# License: MIT
#
# This file can be used to compile python code to javascript code
# which can be used with brython.

import os
#import dis

#fixme  os.path.join doesn't work (ie, import posixpath as path, does not work)
#def os_path_join(*args):
#    return '/'.join(*args)
def os_path_join(a,b):
    return "%s/%s" % (a,b)

class FileIO:
  def __init__(self, filename, mode):
      self._filename=filename
      self._mode=mode
      self._fs=JSObject(fs)

  def read(self):
      #print("before read")
      return self._fs.readFileSync(self._filename, 'utf8')

  def write(self, data):
      #print("before write")
      return self._fs.writeFileSync(self._filename, data, 'utf8')

  def close(self):
      pass


print("done importing")
def compile_file(root, file):
    print("compiling %s" % os_path_join(root, file))
    #print("test")
    _fp=FileIO(os_path_join(root, file), 'r')
    #print("open fine")
    _src=_fp.read()
    #print("read")
    _fp.close()

    #print(_src)
    #fixme, try to get this working with dis module (gives __repr__ error)
    #print("got thsi far")
    _js=JSObject(__BRYTHON__.py2js(_src, '__main__')) #.to_js()
    #print("got thsi far")
    if _js is not None:
       _fp1=FileIO(os_path_join(root, file.replace('.py', '.js')), 'w')
       #print(_js.to_js())
       _fp1.write(_js.to_js())
       _fp1.close()
    else:
       print("error compiling %s" % os_path_join(root, file))

#fixme, todo: modify to os.walk once scope issue is fixed..
#for _root, _dirs, _files in os.walk('./src'):
print("files")
_files=['errno.py', 'local_storage.py', 'string.py', 'keyword.py', 'os.py']
# issues with the 4 files below
        # 'traceback.py', 'pydom.py', 're.py', 'dis.py']

for _file in _files:
    print(_file)
    compile_file('src/Lib', _file)
