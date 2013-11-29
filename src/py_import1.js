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
     throw ImportError('')
     return
   }

   // _loader is not None, so lets run the loader
   return _loader.load_module(name)
}

function import_js_module(module_contents){
    eval(module_contents)
    // check that module name is in namespace
    if(eval('$module')===undefined){
        throw ImportError("name '$module' is not defined in module")
    }
    // add class
    $module.__class__ = $ModuleDict

    return $module
}

function import_py_module(module_contents, path, name) {
    __BRYTHON__.$py_module_path[name]=path

    var root = __BRYTHON__.py2js(module_contents,name)
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

        return $module

    }catch(err){
        console.log(''+err+' '+err.__name__)
        throw err
    }
}

function readFromVFS(lib){
   //borrowed code from http://stackoverflow.com/questions/1119722/base-62-conv$
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

   if (__BRYTHON__.py_VFS[lib] === undefined) return undefined
   //retrieve module from virutal file system and return contents
   return window.atob(__BRYTHON__.py_VFS[lib])
}

//function $import_pyj_module(module,alias,names,path,module_contents) {
function $import_pyj_module(module_contents,path,name) {
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
     $module.__class__ = $type
     //$module.__repr__ = function(){return "<module '"+module+"' from "+path+" >"}
     //$module.__str__ = function(){return "<module '"+module+"' from "+path+" >"}
     //$module.__file__ = path
     return $module
   } catch(err) {
     eval('throw '+err.name+'(err.message)')
   }
}
