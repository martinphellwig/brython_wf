import os
import json
import sys
import re
import cStringIO as StringIO

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
       print "removed: %s empty lines (%d%%)" % (_total - _count, 100.0*_count/_total)
    return ''.join(_filtered)
  

def process(filename):
  print "generating %s" % filename
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

            if _ext in ('.js') and minify is not None:
               try: 
                 _data=minify(_data)
               except:
                 pass
            elif _ext == '.py':
               _data=filter_module(_data)

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
$import_via_VFS=function(module,origin){
  //console.log("import_via_VFS: " + module.name)
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

  var _name=module.name
  _name=_name.replace('.', '/')
  var search=[_name, _name+'/__init__'];
  var exts=['.js', '.py']
  for(var i=0; i < search_path.length; i++) {
     for(var j=0; j < exts.length; j++) {
        for(var k=0; k < search.length; k++) {
         
           var path=search_path[i].replace(root, '')
           var _ext=exts[j]
           path+='/'+search[k]+_ext
         
           //console.log("searching for " + path + " in VFS:96");
           var module_contents=__BRYTHON__.VFS[path]
           if(module_contents !== undefined) {
             console.log("imported ("+module.name+") via VFS:" + path)
             if (_ext == '.js') {
                var mod=$import_js_module(module,path,module_contents)
                if(k==search.length-1){mod.$package=true}
                return mod
             }
             var mod=$import_py_module(module,path,module_contents)
             if(k==search.length-1){mod.$package=true}
             return mod
           }
        }
     }
  }

  __BRYTHON__.imported[module.name] = undefined
  __BRYTHON__.modules[module.name] = undefined

  throw ImportError("module " + module.name + " not found")
}

// since $import_funcs is now a local variable (import_funcs), we have
// to over write the $import_single function to get VFS to work
$import_single=function (module,origin){
    var import_funcs = [$import_via_VFS, $import_js, $import_module_search_path]

    if (module.name.indexOf('.') > -1) {
       import_funcs = [$import_via_VFS, $import_module_search_path]
    }

    for(var j=0;j<import_funcs.length;j++){
        try{
            //console.log(j)
            //console.log(import_funcs[j])
            var mod=import_funcs[j](module,origin)
            //console.log(mod)
            return mod
        } catch(err){
            //console.log(err)
            //console.log(err.name)
            if(err.name==="FileNotFoundError" || err.name==='ImportError'){
                if(j==import_funcs.length-1){
                    // all possible locations failed : throw error
                    // remove module name from __BRYTHON__.imported and .modules
                    //__BRYTHON__.imported[module.name] = undefined
                    //__BRYTHON__.modules[module.name] = undefined
                    //throw err
                }
            }else{
              //  __BRYTHON__.imported[module.name] = undefined
              //  __BRYTHON__.modules[module.name] = undefined
              //  throw err
            }
        }
    }
    
    //__BRYTHON__.imported[module.name] = undefined
    //__BRYTHON__.modules[module.name] = undefined

    throw ImportError("module " + module.name + " not found")

    return undefined
}


function $import_module_search_path_list(module,path_list,origin){
    //console.log('$import_module_search_path_list ' + module.name + ' in VFS:143');

    var search = []

    if(origin!==undefined){
        // add path of origin script to list of paths to search
        var origin_path = __BRYTHON__.$py_module_path[origin]
        var elts = origin_path.split('/')
        elts.pop()
        origin_path = elts.join('/')
        if(path_list.indexOf(origin_path)==-1){
            path_list.splice(0,0,origin_path)
        }
    }

    if(module.name.substr(0,2)=='$$'){module.name=module.name.substr(2)}
    mod_path = module.name.replace(/\./g,'/')
    if(!module.package_only){
        search.push(mod_path)
    }
    search.push(mod_path+'/__init__')

    //var exts=['.js', '.py']
    var _ext='.py'
    var flag = false
    var mod
    for(var j=0; j < search.length; j++) {
      // for(var k=0; k < exts.length; k++) {
          var modpath = search[j]
          //console.log(flag)
          for(var i=0;i<path_list.length;i++){
             //console.log(path_list[i])
             var path
             if (path_list[i].substring(path_list[i].length) == '/') {
                path = path_list[i] + modpath
             } else {
                path = path_list[i] + "/" + modpath
             }

             var module_contents=__BRYTHON__.VFS[path + '.py'];
             //console.log('searching for ' + path + '.py'  + ' in VFS:166');
             //console.log(module_contents)
             if (module_contents !== undefined) {
               try {
                 mod=$import_py_module(module,path,module_contents)
                 flag=true
                 if(j==search.length-1){mod.$package=true}
                 console.log("imported " + module.name + " via VFS:208")
                 return mod
               }catch(err){
                  if(err.name==="FileNotFoundError" || err.name==='ImportError'){
                    if(j==search.length-1){
                      // all possible locations failed : throw error
                      // remove module name from __BRYTHON__.imported and .modules
                     // __BRYTHON__.imported[module.name] = undefined
                     // __BRYTHON__.modules[module.name] = undefined
                      throw err
                    }else{
                      continue
                    }
                  }else{
                  //  __BRYTHON__.imported[module.name] = undefined
                  //  __BRYTHON__.modules[module.name] = undefined
                    //throw err
                  }
               }
              // if(flag){break}
             }
             //if(flag){break}

             try {
                 //console.log('searching for ' + path + _ext + ' :213');
                 mod = $import_py(module,path)
                 flag = true
                 if(j==search.length-1){mod.$package=true}
                 console.log("imported " + module.name + " via VFS:236")
                 return mod
             }catch(err){
                 if(err.name==="FileNotFoundError" || err.name==='ImportError'){
                    if(j==search.length-1){
                      // all possible locations failed : throw error
                      // remove module name from __BRYTHON__.imported and .modules
                     // __BRYTHON__.imported[module.name] = undefined
                     // __BRYTHON__.modules[module.name] = undefined
                      throw err
                    }else{
                      continue
                    }
                 }else{
                   // __BRYTHON__.imported[module.name] = undefined
                   // __BRYTHON__.modules[module.name] = undefined
                   // throw err
                 }
             }
             if(flag){break}
          }
          if(flag){break}
       //}
       //if(flag){break}
    }
    //if(!flag){
    throw ImportError("module "+module.name+" not found")
    //}
    return undefined
}

  """)

  _vfs.close()

if __name__ == '__main__':
   _main_root=os.path.join(os.getcwd(), '../src')
   process(os.path.join(_main_root, "py_VFS.js"))
