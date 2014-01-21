//define import procedure to look up module in VFS
;(function($B){

$B.$import_via_VFS=function(module,origin){
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

  throw ImportError("module " + module.name + " not found")
}

// since $import_funcs is now a local variable (import_funcs), we have
// to over write the $import_single function to get VFS to work
$B.$import_single=function (module,origin){
    var import_funcs = [$B.$import_via_VFS, 
        $B.$import_js, 
        $B.$import_module_search_path]

    if (module.name.indexOf('.') > -1) {
       import_funcs = [$B.$import_via_VFS, $B.$import_module_search_path]
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

    throw $B.builtins.ImportError("module " + module.name + " not found")

    return undefined
}


$B.$import_module_search_path_list = function(module,path_list,origin){
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
    var mod_path = module.name.replace(/\./g,'/')
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
                 mod=$B.$import_py_module(module,path,module_contents)
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
                 mod = $B.$import_py(module,path)
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
    throw $B.builtins.ImportError("module "+module.name+" not found")
    //}
    return undefined
}

})(__BRYTHON__)
