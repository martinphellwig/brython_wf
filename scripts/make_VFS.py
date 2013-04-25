import os
import base64
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

_main_root=os.path.join(os.getcwd(), 'src')

_vfs=open(os.path.join(_main_root, "py_VFS.js"), "w")
_vfs.write("__BRYTHON__.$py_VFS={\n")

_flag=False
for _mydir in ("libs", "Lib"):
    for _root, _dir, _files in os.walk(os.path.join(_main_root, _mydir)):
        for _file in _files:
            if _file.endswith('.py'):
               # we only want to include a .py file if a compiled javascript
               # version is not available
               if os.path.exists(os.path.join(_root, _file.replace('.py', '.js'))):
                  continue

            if _file.endswith('.js') or _file.endswith('.py'):
               _fp=open(os.path.join(_root, _file), "r")
               _data=_fp.read()
               _fp.close()

               if _file.endswith('.js') and minify is not None:
                  _data=minify(_data)

               _vfs_filename=os.path.join(_root, _file).replace(_main_root, '')
               _vfs_filename=_vfs_filename.replace("\\", "/")

               if _vfs_filename.startswith('/libs/crypto_js/rollups/'):
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
  var root = __BRYTHON__.brython_path;
  if (root.endswith('/')) {
     root=root.substring(0,root.length-1); 
  }
  if (search_path.indexOf(root+'/libs') == -1) {
     search_path.unshift(root+'/libs')
  }

  if (search_path.indexOf(root+'/Lib') == -1) {
     search_path.unshift(root+'/Lib')
  }

  for(var i=0; i<search_path.length; i++) {
     for (var j=0; j<ext.length; j++) {
         var path=search_path[i].replace(root, '')
         path+='/'+module+ext[j]
         
         //console.log("searching for " + path + " in VFS");
         var module_contents=readFromVFS(path)
         if(module_contents !== undefined) {
           console.log("imported ("+module+") via VFS:" + path)
           if (ext[j] == '.js') {
              return $import_js_module(module,alias,names,path,module_contents)
           }
           return $import_py_module(module,alias,names,path,module_contents)
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
