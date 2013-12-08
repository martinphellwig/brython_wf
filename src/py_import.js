// import modules

$ModuleDict = {
    __class__ : $type,
    __name__ : 'module',
}
$ModuleDict.__repr__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__str__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__mro__ = [$ModuleDict,$ObjectDict]


function $__import__(name, globals, locals, curpath, level) {
   // doc: http://docs.python.org/dev/library/functions.html#__import__
   // curpath is the location of the code where this import takes place
   // curpath = '__main__' means its in the main script 
   // if 'import a' takes place in module '/src/Lib/mymodule'
   // curpath = '/src/Lib'
   // note: curpath is ignored if level =0 (absolute import)
   // level > 0 (is a relative import)

   console.log('$__import__', name, curpath, level)
   _import_worker=function(import_module, path, name) {
        var _obj
        var _found=False
        var _loader=None

        try {
             //var _mod_name=getattr(import_module, '__name__')
             //console.log(_mod_name)
             //var temp=$class_constructor(_mod_name, import_module)
             //_obj=getattr(temp, '__call__')(path)
             _obj=getattr(import_module, '__call__')(path)
             _found=True
        } catch (err) { //console.log('catch:' + err.message) 
        }
        if (_found) { // this hook thinks it can find/load the module
           try {
                //console.log('find_module')
                //console.log(_obj)
                _loader=getattr(getattr(_obj,'find_module'), '__call__')(name, path)
                //console.log(_loader)
           } catch (err) { //console.log('catch:' + err.message)
           } 
        }

        return _loader
   }

   //console.log(name, curpath, level)
   if(globals === undefined) {}
   if(locals === undefined) {}

   if(level === undefined){level=0}

   if(__BRYTHON__.modules[name] !== undefined) {
     return __BRYTHON__.modules[name]
   }

   //if(__BRYTHON__.imported[name] === undefined) {
   //   __BRYTHON__.imported[name]={__class__: $ModuleDict}
   //}

   var _loader=None
   //console.log('path_hooks.length='+__BRYTHON__.path_hooks.length)
   if(level > 0) {
     // this is a relative import! so our search path is set..
     var elts = curpath.split('/')
     var pymod_elts = elts.slice(0,elts.length-level)
     var _path=pymod_elts.join('/')
     //console.log('path:' + _path)
     for (var j=0; j < __BRYTHON__.path_hooks.length; j++) {
         if (_loader != None) continue;
         _loader=_import_worker(__BRYTHON__.path_hooks[j], _path, name)
     }
   } else {
     for (var j=0; j < __BRYTHON__.path_hooks.length; j++) {
         if (_loader != None) continue;
         for (var i=0; i < __BRYTHON__.path.length; i++) {
             if (_loader != None) continue;
             _loader=_import_worker(__BRYTHON__.path_hooks[j], 
                                    __BRYTHON__.path[i], name)
         }
     }
   }

   if(_loader == None) {
     throw ImportError('Could not find module:' + name)
     return
   }
   //console.log(_loader)
   return getattr(getattr(_loader, 'load_module'), '__call__')(name)
}

// create default import module to import modules over ajax.
// most other import modules (via path hooks) can be written in python. :)

$default_import_module =(function() {
    var $class = new Object()

    $class.__name__='default_import_module'
    $class.__class__ = $ModuleDict
    $class.__repr__ = function(){return "<module '"+$class.__name__+"' from builtin >"}
    $class.__str__ = function(){return "<module '"+$class.__name__+"' from builtin >"}

    $class.__getattr__=function(self,attr){return this[attr]}

    $class.__init__=(function() {
       return function() {
          var $ns=$MakeArgs("__init__",arguments,["self","path"],{},null,null)
          for($var in $ns){eval("var "+$var+"=$ns[$var]")}
          //var $locals = __BRYTHON__.scope["$default_import_module"].__dict__=$ns
          setattr(self,"path",path)
       
          _length = __BRYTHON__.brython_path.length;
          if (path.substring(0,_length) != __BRYTHON__.brython_path) {
             //this module does not support 'external' links outside of /src/
             throw ImportError('$default_import: Path is not supported:' + path)
             return
          }
          
          path=path.substring(_length)
          path=path.replace(/\/+$/, '')   // remove trailing /'s

          if (path.substring(0,4) == 'libs' || path.substring(0,3) == 'Lib') {
             setattr(self, "fullpath", __BRYTHON__.brython_path+path)
          } else {
            throw ImportError('$default_import_module: Path is not supported:' + __BRYTHON__.brython_path+path)
          }
       }
    })()

//$default_import_module.find_module=function(self,name,path){

//$default_import_module.find_module=function(self){
    $class.find_module=(function() {
       return function() {
          var $ns=$MakeArgs("find_module",arguments,["self","name","path"],{},null,null)
          for($var in $ns){eval("var "+$var+"=$ns[$var]")}
          //var $locals = __BRYTHON__.scope["$default_import_module"].__dict__=$ns
          var $locals = $ns
          setattr(self,"_name", name)
          var fullpath=getattr(self,"fullpath")

          if(__BRYTHON__.imported[name] !== undefined) {
            return self     // self.load_import will be used to get a copy
                            // of this module from RAM
          }

          var module={}
          module.name=name
          var import_funcs;

          var _path=fullpath.substring(__BRYTHON__.brython_path.length)
          //console.log(_path)
          if (_path.substring(0,4) == 'libs') {
            import_funcs=$import_js
          } else {
            import_funcs=$import_module_search_path_list
          }
          //console.log(path.substring(path.length-4))
          //console.log(import_funcs)
          var mod=import_funcs(module, fullpath)
          //console.log('import_funcs' + mod)
          if (mod !== undefined) {
                  __BRYTHON__.modules[name]=mod
                  __BRYTHON__.imported[name]=mod
                  //console.log('setting module ' + name)
                  //console.log(__BRYTHON__.modules[name])
                  return this
          }
          throw ImportError('default_import_module:Cannot find module:' + name)
       }
    })()

    $class.load_module=(function() {
       return function() {
          var $ns=$MakeArgs("load_module",arguments,["self","name"],{},null,null)
          for($var in $ns){eval("var "+$var+"=$ns[$var]")}
          //var $locals = __BRYTHON__.scope["$default_import_module"].__dict__=$ns
          var _name = getattr(self,"_name")
          //console.log('default_import_module.load_module')
          return __BRYTHON__.modules[_name]
       }
    })()

    return $class
})()
////////////////////////////////////////////////////////////////////////////

function import_js_module(module_contents, path, name){
   try {
     eval(module_contents);
   } catch(err) {
     eval('throw '+err.name+'(err.message)')
   }

   // check that module name is in namespace
   if(eval('$module')===undefined){
     throw ImportError("name '$module' is not defined in module")
   }
   // add class
   $module.__class__ = $ModuleDict
   $module.__name__ = name
   $module.__repr__ = function(){return "<module '"+name+"' from "+path + " >"}
   $module.__str__ = function(){return "<module '"+name+"' from "+path + " >"}
   $module.__file__ = path

   //console.log('import_js_module: ' + $module)
   return $module
}

function import_py_module(module_contents, path, name) {
    __BRYTHON__.$py_module_path[name]=path

    //console.log(module_contents)
    var root = __BRYTHON__.py2js(module_contents,name)
    //console.log('after py2js')
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

    }catch(err){
        console.log(name+': '+err+' '+err.__name__)
        throw err
    }

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
}

function import_pyj_module(module_contents,path,name) {
   __BRYTHON__.$py_module_path[name]=path
   //__BRYTHON__.$py_module_alias[module]=alias
   __BRYTHON__.scope[name]={}
   __BRYTHON__.scope[name].__dict__={}

   $module=import_js_module(module_contents, path, name)

   // check that module name is in namespace
   if(eval('$module')===undefined){
     throw ImportError("name '$module' is not defined in module")
   }

   // add names defined in the module as attributes of $module
   for(var attr in __BRYTHON__.scope[name].__dict__){
      $module[attr] = __BRYTHON__.scope[name].__dict__[attr]
   }

   return $module
}


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

function $import_js(module, path){
   var filepath=__BRYTHON__.brython_path+'libs/' + module.name
   if (__BRYTHON__.brython_path+'libs' != path) {
      console.log("import_js: Error! invalid path " + path);
   }
   return $import_js_generic(module,filepath)
}

function $import_js_generic(module,filepath) {
   var module_contents=$download_module(module.name, filepath+'.js')
   return import_js_module(module_contents, filepath+'.js', module.name)
}

function $import_module_search_path_list(module,path_list){
    var search = []
    if(module.name.substr(0,2)=='$$'){module.name=module.name.substr(2)}
    mod_path = module.name.replace(/\./g,'/')
    if(!module.package_only){
        search.push(mod_path)
    }
    search.push(mod_path+'/__init__')
    
    for(var j=0; j < search.length; j++) {
        var modpath = search[j]
        var path = path_list + "/" + modpath;
        try {
               mod = $import_py(module,path)
               if(j==search.length-1){mod.$package=true}
               //console.log(mod)
               return mod
        }catch(err){if(err.__name__!=="FileNotFoundError"){throw err}}
    }
    // if we are here, its an import error
    throw ImportError("module "+module.name+" not found")
}

function $import_py(module,path){
    // import Python modules, in the same folder as the HTML page with
    // the Brython script
    var module_contents=$download_module(module.name, path+'.py')
    return import_py_module(module_contents, path+'.py', module.name)
}
