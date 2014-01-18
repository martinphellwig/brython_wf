import os
import json
import sys
import re

if sys.version_info[0] >= 3:
  import io as StringIO
else:
  import cStringIO as StringIO

#check to see if slimit or some other minification library is installed
#set minify equal to slimit's minify function

#NOTE: minify could be any function that takes a string and returns a string
# Therefore other minification libraries could be used.
try:
  import slimit
  js_minify=slimit.minify
except ImportError:
  js_minify=None  

def filter_module(code):
    """ remove empty lines from modules so that py_VFS will be a little
        smaller
    """

    _re_whitespace=re.compile('^\s*$')   #line only contains white space
    _re_comment=re.compile('^\s*\#.*$')  #line only contains a comment

    _filtered=[]
    _total=0
    _count=0
    _fp=StringIO.StringIO(code)
    for _line in _fp:
        _total+=1
        if _re_whitespace.match(_line) or _re_comment.match(_line):
           continue

        _count+=1
        _filtered.append(_line)

    if _total > 0:
       print("removed: %s empty lines (%d%%)" % (_total - _count, 100.0*_count/_total))
    return ''.join(_filtered)
  

try:
  import mnfy

  def py_minify(source):
      import ast
      source_ast = ast.parse(source)

      for transform in mnfy.safe_transforms:
          transformer = transform()
          source_ast = transformer.visit(source_ast)

      minifier = mnfy.SourceCode()
      minifier.visit(source_ast)
      return str(minifier)

except ImportError:
  py_minify=filter_module

#brython has issues parsing code created by mnfy so for now use
#the filter_module version
py_minify=filter_module

if sys.version_info[0] < 3:  #python 2
   # we should only use mnfy for python > = 3 since ast is used, 
   # so let us use our basic minifier, since this script is being executed
   # by python 2.x
   py_minifer=filter_module

def process(filename):
  print("generating %s" % filename)
  _main_root=os.path.dirname(filename)

  _VFS={}

  for _mydir in ("libs", "Lib"):
    for _root, _dir, _files in os.walk(os.path.join(_main_root, _mydir)):
        if _root.endswith('lib_migration'): continue  #skip these modules 
        if '__pycache__' in _root: continue
        for _file in _files:
            _ext=os.path.splitext(_file)[1]
            if _ext not in ('.js', '.py'): continue
 
            _fp=open(os.path.join(_root, _file), "r")
            _data=_fp.read()
            _fp.close()

            if _ext in ('.js'):
               if js_minify is not None:
                  try: 
                    _data=js_minify(_data)
                  except:
                    pass
            elif _ext == '.py':
               try:
                 _data=py_minify(_data)
               except:
                 pass

            _vfs_filename=os.path.join(_root, _file).replace(_main_root, '')
            _vfs_filename=_vfs_filename.replace("\\", "/")

            if _vfs_filename.startswith('/libs/crypto_js/rollups/'):
               if _file not in ('md5.js', 'sha1.js', 'sha3.js',
                                'sha224.js', 'sha384.js', 'sha512.js'):
                  continue

            print("adding %s" % _vfs_filename)

            _VFS[_vfs_filename]=_data

  _vfs=open(filename, "w")
  _vfs.write('__BRYTHON__.VFS=%s;\n\n' % json.dumps(_VFS))

  _vfs.write(open(os.path.join(_main_root,'import_VFS.js')).read())

  _vfs.close()

if __name__ == '__main__':
   _main_root=os.path.join(os.getcwd(), '../src')
   process(os.path.join(_main_root, "py_VFS.js"))
