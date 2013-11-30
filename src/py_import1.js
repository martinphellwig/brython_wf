// import modules

$ModuleDict = {
    __class__ : $type,
    __name__ : 'module',
}
$ModuleDict.__repr__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__str__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__mro__ = [$ModuleDict,$ObjectDict]


function $__import__(name, globals, locals, fromlist, level, curpath) {
   // doc: http://docs.python.org/dev/library/functions.html#__import__
   // curpath is the location of the code where this import takes place
   // curpath = '__main__' means its in the main script 
   // if 'import a' takes place in module '/src/Lib/mymodule'
   // curpath = '/src/Lib'
   // note: curpath is ignored if level =0 (absolute import)
   // level > 0 (is a relative import)

   if(globals === undefined) {

   }
   if(locals === undefined) {

   }
   if(fromlist === undefined) {fromlist=[]}
   if(level === undefined){level=0}

   var _loader=None
   if(level > 0) {
     // this is a relative import! so our search path is set..
     var elts = cur_path.split('/')
     var pymod_elts = elts.slice(0,elts.length-level)
     var _path=pymod_elts.join('/')

     for (var j=0; j < __BRYTHON__.path_hooks.length; j++) {
         if (_loader != None) continue;
         var _mod=__BRYTHON__.path_hooks[j]
         var _found=False
         console.log(_mod)
         try {_mod(_path)
              _found=True
         } catch (ImportError) {}
         if (_found) { // this hook thinks it can find/load the module
            _loader=_mod.find_module(name, _path)
         }
     }
   } else {
     for (var i=0; i < __BRYTHON__.path.length; i++) {
         if (_loader != None) continue;
         var _path=__BRYTHON__.path[i]
         for (var j=0; j < __BRYTHON__.path_hooks.length; j++) {
             if (_loader != None) continue;
             var _mod=__BRYTHON__.path_hooks[j]
             var _found=False
             try {
               _mod.__init__(_path)
               _found=True
             } catch (err) {console.log('catch:' + err.message) }
             if (_found) { // this hook thinks it can find/load the module
                _loader=_mod.find_module(name, _path)
             }
         }
     }
   }

   if(_loader == None) {
     throw ImportError('Could not find module:' + name)
     return
   }

   // _loader is not None, so lets run the loader
   return _loader.load_module(name)
}

function import_js_module(module_contents, name, filepath){
    eval(module_contents)
    // check that module name is in namespace
    if(eval('$module')===undefined){
        throw ImportError("name '$module' is not defined in module")
    }
    // add class
    $module.__class__ = $ModuleDict
    $module.__name__ = name
    $module.__repr__ = function(){return "<module '"+name+"' from "+filepath + " >"}
    $module.__str__ = function(){return "<module '"+module.name+"' from "+filepath + " >"}
    $module.__file__ = filepath

    return $module
}

function import_py_module(module_contents, path, name) {
    __BRYTHON__.$py_module_path[name]=path

    //console.log(module_contents)
    var root = __BRYTHON__.py2js(module_contents,name)
    console.log('after py2js')
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous$
    var mod_node = new $Node('expression')
    new $NodeJSCtx(mod_node,'$module=(function()')
    root.insert(0,mod_node)
    mod_node.children = body

    // $globals will be returned when the anonymous function is run
    var ret_node = new $Node('expression')
    new $NodeJSCtx(ret_node,'return $globals')

    mod_node.add(ret_node)
    // add parenthesis for anonymous function execution

    var ex_node = new $Node('expression')
    new $NodeJSCtx(ex_node,')()')
    root.add(ex_node)

    try{
        var js = root.to_js()
        if (__BRYTHON__.$options.debug == 10) {
           console.log('code for module '+name)
           console.log(js);
        }
        eval(js)
        // check that module name is in namespace
        if(eval('$module')===undefined){
          throw ImportError("name '$module' is not defined in module")
        }

        // add names defined in the module as attributes of $module
        for(var attr in __BRYTHON__.scope[name].__dict__){
            $module[attr] = __BRYTHON__.scope[name].__dict__[attr]
        }
        // add class and __str__
        $module.__class__ = $ModuleDict
        $module.__name__ = name
        $module.__repr__ = function(){return "<module '"+name+"' from "+path + " >"}
        $module.__str__ = function(){return "<module '"+name+"' from "+path + " >"}
        $module.__file__ = path

        return $module

    }catch(err){
        console.log(''+err+' '+err.__name__)
        throw err
    }
}

//function $import_pyj_module(module,alias,names,path,module_contents) {
function import_pyj_module(module_contents,path,name) {
    __BRYTHON__.$py_module_path[name]=path
    //__BRYTHON__.$py_module_alias[module]=alias
    __BRYTHON__.scope[name]={}
    __BRYTHON__.scope[name].__dict__={}

   try {
     eval(module_contents);

     // check that module name is in namespace
     if(eval('$module')===undefined){
       throw ImportError("name '$module' is not defined in module")
     }

     // add names defined in the module as attributes of $module
     for(var attr in __BRYTHON__.scope[name].__dict__){
       $module[attr] = __BRYTHON__.scope[name].__dict__[attr]
     }

     // add class and __str__
     $module.__class__ = $ModuleDict
     $module.__name__ = name
     $module.__repr__ = function(){return "<module '"+name+"' from "+path + " >"}
     $module.__str__ = function(){return "<module '"+name+"' from "+path + " >"}
     $module.__file__ = path

     return $module
   } catch(err) {
     eval('throw '+err.name+'(err.message)')
   }
}

// now work on default import module to import modules over ajax.
// most other import modules (via path hooks) can be written in python. :)

$default_import_module = { // Module Finder
    __getattr__ : function(attr){return this[attr]},
    __init__:function(path) {
       //console.log('in $default_import_module.__init__')
       //console.log(__BRYTHON__.brython_path);
       if (path == __BRYTHON__.brython_path+'libs' || 
           path == __BRYTHON__.brython_path + 'Lib') {
          self.fullpath=path;
       } else {
          throw ImportError('Path is not supported:' + path)
       }
    },
    find_module:function(name){
       var module={}
       module.name=name
       var import_funcs = [$import_js, $import_module_search_path]
       if(module.name.search(/\./)>-1){import_funcs = [$import_module_search_path]}

       for(var j=0;j<import_funcs.length;j++){
          //console.log(import_func[j])
          try{
            var mod=import_funcs[j](module)
            if (mod !== undefined) {
               this.mod=mod;
               return this
            }
            throw ImportError('Cannot find module:' + name)
          } catch(err){
            if(err.__name__==="FileNotFoundError"){
                if(j==import_funcs.length-1){
                    // all possible locations failed : throw error
                    throw err
                }else{
                    continue
                }
            }else{throw err}
          }
       }
    },

    load_module: function( ) {
       return this.mod;
    }
}
$default_import_module.__class__ = $default_import_module 
$default_import_module.__str__ = function(){return "<module 'default import module'>"}

////////////////////////////////////////////////////////////////////////////

function $importer(){
    // returns the XMLHTTP object to handle imports
    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        var $xmlhttp=new XMLHttpRequest();
    }else{// code for IE6, IE5
        var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var fake_qs;
    // lets use $options to figure out how to make requests
    if (__BRYTHON__.$options.cache === undefined ||
        __BRYTHON__.$options.cache == 'none') {
      //generate random number to pass in request to "bust" browser caching
      fake_qs="?v="+Math.random().toString(36).substr(2,8)
    } else if (__BRYTHON__.$options.cache == 'version') {
      fake_qs="?v="+__BRYTHON__.version_info[2]
    } else if (__BRYTHON__.$options.cache == 'browser') {
      fake_qs=""
    } else {  // default is to send random string to bust cache
      fake_qs="?v="+Math.random().toString(36).substr(2,8)
    }

    var timer = setTimeout( function() {
        $xmlhttp.abort()
        throw ImportError("No module named '"+module+"'")}, 5000)
    return [$xmlhttp,fake_qs,timer]
}

function $download_module(module,url){
    var imp = $importer()
    var $xmlhttp = imp[0],fake_qs=imp[1],timer=imp[2],res=null
    $xmlhttp.onreadystatechange = function(){
        if($xmlhttp.readyState==4){
            window.clearTimeout(timer)
            if($xmlhttp.status==200 || $xmlhttp.status==0){res=$xmlhttp.responseText}
            else{
                // don't throw an exception here, it will not be caught (issue #30)
                res = FileNotFoundError("No module named '"+module+"'")
            }
        }
    }
    $xmlhttp.open('GET',url+fake_qs,false)
    if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
    $xmlhttp.send()
    if(res.constructor===Error){throw res} // module not found
    return res
}

function $import_js(module){
   var filepath=__BRYTHON__.brython_path+'libs/' + module.name
   return $import_js_generic(module,filepath)
}

function $import_js_generic(module,filepath) {
   var module_contents=$download_module(module.name, filepath+'.js')
   return import_js_module(module_contents, filepath+'.js', module.name)
}


function $import_module_search_path(module){
  // this module is needed by $import_from, so don't remove
  return $import_module_search_path_list(module,__BRYTHON__.path);
}

function $import_module_search_path_list(module,path_list){
    var search = []
    if(module.name.substr(0,2)=='$$'){module.name=module.name.substr(2)}
    mod_path = module.name.replace(/\./g,'/')
    if(!module.package_only){
        search.push(mod_path)
    }
    search.push(mod_path+'/__init__')
    
    var flag = false
    for(var j=0; j < search.length; j++) {
        var modpath = search[j]
        for(var i=0;i<path_list.length;i++){
           var path = path_list[i] + "/" + modpath;
           try {
               mod = $import_py(module,path)
               flag = true
               if(j==search.length-1){mod.$package=true}
           }catch(err){if(err.__name__!=="FileNotFoundError"){throw err}}
           if(flag){break}
        }
        if(flag){break}
    }
    if(!flag){
        throw ImportError("module "+module.name+" not found")
    }
    return mod
}

function $import_py(module,path){
    // import Python modules, in the same folder as the HTML page with
    // the Brython script
    var module_contents=$download_module(module.name, path+'.py')
    return import_py_module(module_contents, path+'.py', module.name)
}
