import os
import json
import sys

#check to see if slimit or some other minification library is installed
#set minify equal to slimit's minify function

#NOTE: minify could be any function that takes a string and returns a string
# Therefore other minification libraries could be used.
try:
  import slimit
  minify=slimit.minify
except ImportError:
  minify=None  
  
if sys.version_info[0] >= 3:
   print("For the time being, because of byte issues in Bryton, please use python 2.x")
   sys.exit()

def process(filename):
  print "generating %s" % filename
  _main_root=os.path.dirname(filename)

  _VFS={}

  for _mydir in ("libs", "Lib"):
    for _root, _dir, _files in os.walk(os.path.join(_main_root, _mydir)):
        if _root.endswith('lib_migration'): continue  #skip these modules 
        if '__pycache__' in _root: continue
        for _file in _files:
            if _file.endswith('.py'):
               # we only want to include a .py file if a compiled javascript
               # version is not available
               if os.path.exists(os.path.join(_root, _file.replace('.py', '.pyj'))):
                  continue

            _ext=os.path.splitext(_file)[1]
            if _ext in ('.js', '.py'): 
               _fp=open(os.path.join(_root, _file), "r")
               _data=_fp.read()
               _fp.close()

               if _ext in ('.js') and minify is not None:
                  try: 
                     _data=minify(_data)
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

  _vfs.write("""
//define import procedure to look up module in VFS
$import_via_VFS=function(module,alias,names){
  var ext=['.js', '.py']
  var search_path=__BRYTHON__.path
  var root = __BRYTHON__.brython_path;
  if (root.substring(root.length) == '/') {
     root=root.substring(0,root.length-1); 
  }
  if (search_path.indexOf(root+'/libs') == -1) {
     search_path.unshift(root+'/libs')
  }

  if (search_path.indexOf(root+'/Lib') == -1) {
     search_path.unshift(root+'/Lib')
  }

  var mod=[module.name, module.name+'/__init__'];
  for(var i=0; i<search_path.length; i++) {
     for (var j=0; j<ext.length; j++) {
         for(var k=0; k < mod.length; k++) {
         
           var path=search_path[i].replace(root, '')
           path+='/'+mod[k]+ext[j]
         
           //console.log("searching for " + path + " in VFS");
           var module_contents=__BRYTHON__.VFS[path];
           if(module_contents !== undefined) {
             //console.log("imported ("+module.name+") via VFS:" + path)
             if (ext[j] == '.js') {
                return $import_js_module(module,path,module_contents)
             }
             return $import_py_module(module,path,module_contents)
           }
         }
     }
  }
  res = Error()
  res.name = 'NotFoundError'
  res.message = "No module named '"+module+"'"
  throw res
}

// since $import_funcs is now a local variable (import_funcs), we have
// to over write the $import_single function to get VFS to work
$import_single=function (module){
    var import_funcs = [$import_via_VFS, $import_js, $import_module_search_path]
    if(module.name.search(/\./)>-1){import_funcs = [$import_module_search_path]}
    for(var j=0;j<import_funcs.length;j++){
        try{
            return import_funcs[j](module)
        } catch(err){
            if(err.name==="NotFoundError"){
                if(j==import_funcs.length-1){
                    throw ImportError("no module named '"+module.name+"'")
                }else{
                    continue
                }
            }else{throw(err)}
        }
    }
}
  """)

  _vfs.close()

if __name__ == '__main__':
   _main_root=os.path.join(os.getcwd(), '../src')
   process(os.path.join(_main_root, "py_VFS.json"))
