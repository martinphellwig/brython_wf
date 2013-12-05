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
__BRYTHON__.path_hooks = []
__BRYTHON__.$py_next_hash = -Math.pow(2,53)
__BRYTHON__.exception_stack = []
__BRYTHON__.scope = {}
__BRYTHON__.modules = {}

// Read and eval library
// using brython.js does not work, must import each
// file individually.
_libs=['brython_builtins', 'py2js', 'py_utils', 'py_object', 
       'py_builtin_functions', 'py_set', 'js_objects', 'py_import',
       'py_int', 'py_float',
       'py_dict', 'py_list', 'py_string', 'py_dom']
for (var i=0; i < _libs.length; i++) {
  jscode = fs.readFileSync('../src/'+_libs[i]+'.js','utf8');
  eval(jscode);
}

//function node_import(module,alias,names) {
function $import_single(module) {
  //console.log(module.name)
  var search_path=['../src/libs', '../src/Lib'];
  var ext=['.js', '.py'];
  var mods=[module.name, module.name+'/__init__'];

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
                   //return import_js_module(module,alias,names,path,module_contents)
                   return import_js_module(module_contents,path,module.name)
                }
                //return import_py_module(module,alias,names,path,module_contents)
                return import_py_module(module_contents,path,module.name)
             }
         }
     }
  }
  console.log("error time!");
  res = Error()
  res.name = 'NotFoundError'
  res.message = "No module named '"+module.name+"'"
  throw res
}

$compile_python=function(module_contents,module) {
    var root = __BRYTHON__.py2js(module_contents,module)
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
    var mod_node = new $Node('expression')
    //if(names!==undefined){alias='$module'}
    new $NodeJSCtx(mod_node,'$module=(function()')
    root.insert(0,mod_node)
    mod_node.children = body
    // search for module-level names : functions, classes and variables
    var mod_names = []
    for(var i=0;i<mod_node.children.length;i++){
        var node = mod_node.children[i]
        // use function get_ctx() 
        // because attribute 'context' is renamed by make_dist...
        var ctx = node.get_ctx().tree[0]
        if(ctx.type==='def'||ctx.type==='class'){
            if(mod_names.indexOf(ctx.name)===-1){mod_names.push(ctx.name)}
        } else if(ctx.type==='from') {
            for (var j=0; j< ctx.names.length; j++) {
                var name=ctx.names[j];
                if (name === '*') {
                   // just pass, we don't want to include '*'
                } else if (ctx.aliases[name] !== undefined) {
                   if (mod_names.indexOf(ctx.aliases[name])===-1){
                      mod_names.push(ctx.aliases[name])
                   }
                } else {
                   if (mod_names.indexOf(ctx.names[j])===-1){
                     mod_names.push(ctx.names[j])
                   }
                }
            }
        }else if(ctx.type==='assign'){
            var left = ctx.tree[0]
            if(left.type==='expr'&&left.tree[0].type==='id'&&left.tree[0].tree.length===0){
                var id_name = left.tree[0].value
                if(mod_names.indexOf(id_name)===-1){mod_names.push(id_name)}
            }
        }
    }
    // create the object that will be returned when the anonymous function is run
    var ret_code = 'return {'
    for(var i=0;i<mod_names.length;i++){
        ret_code += mod_names[i]+':'+mod_names[i]+','
    }
    ret_code += '__getattr__:function(attr){return this[attr]},'
    ret_code += '__setattr__:function(attr,value){this[attr]=value}'
    ret_code += '}'
    var ret_node = new $Node('expression')
    new $NodeJSCtx(ret_node,ret_code)
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

function $node_import() {

$default_import_module = { // Module Finder
    __class__:$type,
    __name__: 'default import module'
}

$default_import_module.__getattr__=function(self,attr){return this[attr]}
$default_import_module.__init__=function(self) {
       console.log('in $default_import_module.__init__')
       var path=arguments[0];
       //console.log(path);
       //console.log(__BRYTHON__.brython_path);
       if (path.length >= __BRYTHON__.brython_path.length+3 && (
           path.substring(0,__BRYTHON__.brython_path.length+3) == __BRYTHON__.brython_path+'libs'
        || path.substring(0,__BRYTHON__.brython_path.length+3) == __BRYTHON__.brython_path + 'Lib')) {
          self.fullpath=path;
       } else {
          throw ImportError('Path is not supported:' + path)
       }
}

$default_import_module.find_module=function(self){
       var name=arguments[0]
       var path=arguments[1]
       if (__BRYTHON__.modules[name] !== undefined) {
          return this
       }
       var module={}
       module.name=name
       var import_funcs = [$import_single]
       //if(module.name.search(/\./)>-1){import_funcs = [$import_single]}

       for(var j=0;j<import_funcs.length;j++){
          //console.log(import_funcs[j])
          try{
            var mod=import_funcs[j](module)
            if (mod !== undefined) {
               __BRYTHON__.modules[name]=mod;
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
}

$default_import_module.load_module=function(self) {
       var name = arguments[0]
       return __BRYTHON__.modules[name]
}

$default_import_module.__class__ = $default_import_module
$default_import_module.__str__ = function(self){return "<module 'default import module'>"}
$default_import_module.__repr__ = function(self){return "<module 'default import module'>"}
$default_import_module.__mro__ = [$default_import_module,$ObjectDict]
return $default_import_module
}
////////////////////////////////////////////////////////////////////////////



function execute_python_script(filename) {
  _py_src=fs.readFileSync(filename, 'utf8')
  __BRYTHON__.$py_module_path['__main__']='./'
  var root = __BRYTHON__.py2js(_py_src,'__main__')
  var js = root.to_js()
  //console.log(js);
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

__BRYTHON__.path_hooks=[$node_import]
__BRYTHON__.path=['../src']

var filename=process.argv[2];
execute_python_script(filename)
