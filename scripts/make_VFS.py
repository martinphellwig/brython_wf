import os

def process(filename):
  import sys
  import json

  if sys.version_info[0] >= 3:
    import io as StringIO
  else:
    import cStringIO as StringIO

  import pyminifier

  #check to see if slimit or some other minification library is installed
  #set minify equal to slimit's minify function
  js_minify=None  

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
                 _data = pyminifier.remove_comments_and_docstrings(_data)
                 _data = pyminifier.dedent(_data)
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
