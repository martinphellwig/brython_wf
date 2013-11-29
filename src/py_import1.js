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
         var _mod=__BRYTHON__.path_hooks(j)
         var _found=False
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
             var _mod=__BRYTHON__.path_hooks(j)
             var _found=False
             try {_mod(_path)
                  _found=True
             } catch (ImportError) {}
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
    $module.__repr__ = function(){return "<module '"+name+"' from "+path + " >"}
    $module.__str__ = function(){return "<module '"+module.name+"' from "+path + " >"}
    $module.__file__ = path

    return $module
}

function import_py_module(module_contents, path, name) {
    __BRYTHON__.$py_module_path[name]=path

    console.log(module_contents)
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

$module = { // Module Finder
    __getattr__ : function(attr){return this[attr]},
    __init__:function(path) {
       if (path == '/src/libs' || path == '/src/Lib') {
          self.fullpath=path;
       }
       throw ImportError('')
    },
    find_module:function(name){
       var import_funcs = [import_js, import_module_search_path];
       if(module.name.search(/\./)>-1){import_funcs = [import_module_search_path]}

       for(var j=0;j<import_funcs.length;j++){
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
       return mod;
    }
}
$module.__class__ = $module // defined in $py_utils
$module.__str__ = function(){return "<module '_os'>"}

__BRYTHON__.path_hooks.append($module)
