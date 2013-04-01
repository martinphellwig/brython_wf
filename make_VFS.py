import os
import base64
import sys


if sys.version_info[0] >= 3:
   print("For the time being, because of byte issues in Bryton, please use python 2.x")
   sys.exit()

_main_root=os.getcwd()

_vfs=open("py_VFS.js", "w")
_vfs.write("__BRYTHON__.$py_VFS={\n")

_flag=False
for _mydir in ("libs", "Lib"):
    for _root, _dir, _files in os.walk(_mydir):
        for _file in _files:
            if _file.endswith('.js') or _file.endswith('.py'):
               _fp=open(os.path.join(_root, _file), "r")
               _data=_fp.read()
               _fp.close()

               _vfs_filename=os.path.join(_root, _file).replace(_main_root, '')
               _vfs_filename=_vfs_filename.replace("\\", "/")

               if _vfs_filename.startswith('libs/crypto_js/rollups/'):
                  if _file not in ('md5.js', 'sha1.js', 'sha3.js',
                      'sha224.js', 'sha384.js', 'sha512.js'):
                       continue

               print("adding %s" % _vfs_filename)

               if _flag: _vfs.write(',\n')
               _flag=True
               _vfs.write("'%s':'%s'" % (_vfs_filename, base64.b64encode(_data)))

_vfs.write('\n}\n\n')

_vfs.write("""
function readFromVFS(lib){
   //borrowed code from http://stackoverflow.com/questions/1119722/base-62-conversion-in-python
   if (window.atob === undefined) {
      // browser is not chrome, firefox or safari :(
      window.atob=function(s) {
        var e={},i,k,v=[],r='',w=String.fromCharCode;
        var n=[[65,91],[97,123],[48,58],[43,44],[47,48]];

        for(z in n){for(i=n[z][0];i<n[z][1];i++){v.push(w(i));}}
        for(i=0;i<64;i++){e[v[i]]=i;}

        for(i=0;i<s.length;i+=72){
           var b=0,c,x,l=0,o=s.substring(i,i+72);
           for(x=0;x<o.length;x++){
              c=e[o.charAt(x)];b=(b<<6)+c;l+=6;
              while(l>=8){r+=w((b>>>(l-=8))%256);}
           }
        }
        return r;
      }
   }

   if (__BRYTHON__.$py_VFS[lib] === undefined) return undefined
   //retrieve module from virutal file system and return contents
   return window.atob(__BRYTHON__.$py_VFS[lib])
}

//define import procedure to look up module in VFS
$import_via_VFS=function(module,alias,names){
  var ext=['.js', '.py']
  var search_path=__BRYTHON__.path
  if (search_path.indexOf(__BRYTHON__.brython_path+'libs') == -1) {
     search_path.unshift(__BRYTHON__.brython_path+'libs')
  }
  for(var i=0; i<search_path.length; i++) {
     for (var j=0; j<ext.length; j++) {
         var path=search_path[i].replace(__BRYTHON__.brython_path, '')
         path+='/'+module+ext[j]

         var module_contents=readFromVFS(path)
         if(module_contents !== undefined) {
           if (ext[j] == '.js') {
              $import_js_module(module,alias,names,path,module_contents)
           } else {
              $import_py_module(module,alias,names,path,module_contents)
           }
           return
         }
     }
  }
  res = Error()
  res.name = 'NotFoundError'
  res.message = "No module named '"+module+"'"
  throw res
}
$import_funcs.unshift($import_via_VFS)
""")

_vfs.close()
