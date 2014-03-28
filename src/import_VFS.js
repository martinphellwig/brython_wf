//define import procedure to look up module in VFS
;(function($B){

$B.$import_via_VFS=function(module,origin){
  //console.log("import_via_VFS: " + module.name)
  var search_path=__BRYTHON__.path
  var root = __BRYTHON__.brython_path;
  if (root.charAt(root.length-1) == '/') {
     root=root.substring(0,root.length-1); 
  }
  if (search_path.indexOf(root+'/libs') == -1) {
     search_path.unshift(root+'/libs')
  }

  if (search_path.indexOf(root+'/Lib') == -1) {
     search_path.unshift(root+'/Lib')
  }

  if (search_path.indexOf(root+'/Lib/site-packages') == -1) {
     search_path.unshift(root+'/Lib/site-packages')
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
                var mod=$B.$import_js_module(module,path,module_contents)
                if(k==search.length-1){mod.$package=true}
                return mod
             }
             var mod=$B.$import_py_module(module,path,module_contents)
             if(k==search.length-1){mod.$package=true}
             return mod
           }
        }
     }
  }

  __BRYTHON__.imported[module.name] = undefined
  __BRYTHON__.modules[module.name] = undefined

  throw $B.builtins.ImportError("module " + module.name + " not found")
}

// since $import_funcs is now a local variable (import_funcs), we have
// to over write the $import_single function to get VFS to work
$B.$import_single=function (module,origin){
    //console.log("in $import_single")
    var import_funcs = [$B.$import_via_VFS, 
        $B.$import_js, 
        $B.$import_module_search_path]

    if (module.name.indexOf('.') > -1) {
       import_funcs = [$B.$import_via_VFS, $B.$import_module_search_path]
    }

    for(var j=0;j<import_funcs.length;j++){
        try{
            return import_funcs[j](module,origin)
        } catch(err){
            if(err.__name__==="FileNotFoundError"){
               if (j===import_funcs.length-1) {
                 __BRYTHON__.imported[module.name] = undefined
                 __BRYTHON__.modules[module.name] = undefined
                 throw err
               } else {
                 continue
               }
            } else {
                 __BRYTHON__.imported[module.name] = undefined
                 __BRYTHON__.modules[module.name] = undefined
                throw err
            }
        }
    }
}

})(__BRYTHON__)
