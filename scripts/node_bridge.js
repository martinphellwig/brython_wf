/*
Author: Billy Earney
Date: 04/19/2013
License: MIT

Description: This file can work as a "bridge" between nodejs and brython
 so that client side brython code can be executed on the server side.
Will brython replace Cython one day?  Only time will tell.
:)

*/

var fs = require('fs');

document={};
window={};
window.navigator={}
document.$py_src = {}
document.$debug = 0

self={};
__BRYTHON__={}
__BRYTHON__.$py_module_path = {}
__BRYTHON__.$py_module_alias = {}
__BRYTHON__.$py_next_hash = -Math.pow(2,53)
__BRYTHON__.exception_stack = []
__BRYTHON__.scope = {}
__BRYTHON__.modules = {}

// Read and eval library
_libs=['brython_builtins', 'py2js', 'py_utils', 'py_object', 
       'py_builtin_functions', 'py_set', 'js_objects', 
       'py_int', 'py_float',
       'py_dict', 'py_list', 'py_string', 'py_dom']
for (var i=0; i < _libs.length; i++) {
  jscode = fs.readFileSync('../src/'+_libs[i]+'.js','utf8');
  eval(jscode);
}

$ModuleDict = {
    __class__ : $type,
    __name__ : 'module',
}
$ModuleDict.__repr__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__str__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__mro__ = [$ModuleDict,$ObjectDict]



//function node_import(module,alias,names) {
function $import_single(module) {
  var search_path=['../src/libs', '../src/Lib'];
  var ext=['.js', '.py'];
  var mods=[module.name, module.name+'/__init__'];

  alias=undefined
  for(var i=0; i<search_path.length; i++) {
     for (var j=0; j<ext.length; j++) {
         for (var k=0; k<mods.length; k++) {
             var path=search_path[i]+'/'+mods[k]+ext[j]

             //console.log("searching for " + path);
             var module_contents;
             try {
               module_contents=fs.readFileSync(path, 'utf8')
             } catch(err) {}
             if (module_contents !== undefined) {
                console.log("imported " + module.name)
                //console.log(module_contents);
                if (ext[j] == '.js') {
                   return $import_js_module(module,path,module_contents)
                }
                return $import_py_module(module,path,module_contents)
             }
         }
     }
  }
  console.log("error time!");
  res = Error()
  res.name = 'NotFoundError'
  res.message = "No module named '"+module+"'"
  throw res
}

function $import_list(modules){
    var res = []
    for(var i=0;i<modules.length;i++){
        var mod_name=modules[i]
        if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
        var mod;
        var stored = __BRYTHON__.imported[mod_name]
        if(stored===undefined){
            // if module is in a package (eg "import X.Y") then we must first i$
            // by searching for the file X/__init__.py, then import X.Y searchi$
            // X/Y.py or X/Y/__init__.py
            var mod = {}
            var parts = mod_name.split('.')
            for(var i=0;i<parts.length;i++){
                var module = new Object()
                module.name = parts.slice(0,i+1).join('.')
                if(__BRYTHON__.modules[module.name]===undefined){
                    // this could be a recursive import, so lets set modules={}
                    __BRYTHON__.modules[module.name]={}
                    __BRYTHON__.imported[module.name]={}
                    // indicate if package only, or package or file
                    if(i<parts.length-1){module.package_only = true}
                    __BRYTHON__.modules[module.name] = $import_single(module)
                    __BRYTHON__.imported[module.name]=__BRYTHON__.modules[module.name]
                }
            }
        }else{
            mod=stored
        }
        res.push(mod)
    }
    return res
}

function $import_js_module(module,filepath,module_contents){
    eval(module_contents)
    // check that module name is in namespace
    if(eval('$module')===undefined){
        throw ImportError("name '$module' is not defined in module")
    }
    // add class and __str__
    $module.__class__ = $ModuleDict
    $module.__name__ = module.name
    $module.__repr__ = function(){return "<module '"+module.name+"' from "+filepath+" >"}
    $module.__str__ = function(){return "<module '"+module.name+"' from "+filepath+" >"}
    $module.__file__ = filepath
    return $module
}

function $import_py_module(module,path,module_contents) {
    __BRYTHON__.$py_module_path[module.name]=path

    var root = __BRYTHON__.py2js(module_contents,module.name)
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
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
            console.log('code for module '+module.name)
           console.log(js);
        }
        eval(js)
        // add names defined in the module as attributes of $module
        for(var attr in __BRYTHON__.scope[module.name].__dict__){
            $module[attr] = __BRYTHON__.scope[module.name].__dict__[attr]
        }
        // add class and __str__
        $module.__class__ = $ModuleDict
        $module.__repr__ = function(){return "<module '"+module.name+"' from "+path+" >"}
        $module.__str__ = function(){return "<module '"+module.name+"' from "+path+" >"}
        $module.toString = function(){return "module "+module.name}
        $module.__file__ = path
        $module.__initializing__ = false
        return $module
    }catch(err){
        console.log(''+err+' '+err.__name__)
        throw err
    }
}

$compile_python=function(module_contents,module) {
    var root = __BRYTHON__.py2js(module_contents,module.name)
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
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
        return js;
    }catch(err){
        eval('throw '+err.name+'(err.message)')
    }
    return undefined;
}

function execute_python_script(filename) {
  _py_src=fs.readFileSync(filename, 'utf8')
  __BRYTHON__.$py_module_path['__main__']='./'
  var root = __BRYTHON__.py2js(_py_src,'__main__')
  var js = root.to_js()
  console.log(js);
  eval(js);
}

//console.log("try to execute compile script");

__BRYTHON__.$py_module_path = __BRYTHON__.$py_module_path || {}
__BRYTHON__.$py_module_alias = __BRYTHON__.$py_module_alias || {}
__BRYTHON__.exception_stack = __BRYTHON__.exception_stack || []
__BRYTHON__.scope = __BRYTHON__.scope || {}
__BRYTHON__.imported = __BRYTHON__.imported || {}
__BRYTHON__.modules = __BRYTHON__.modules || {}
__BRYTHON__.compile_python=$compile_python

__BRYTHON__.debug = 0
__BRYTHON__.$options = {}
__BRYTHON__.$options.debug = 0

// other import algs don't work in node
//import_funcs=[node_import]

var filename=process.argv[2];
execute_python_script(filename)
