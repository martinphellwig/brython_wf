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

function node_import(module,alias,names) {
  var search_path=['src/libs', 'src/Lib'];
  var ext=['.js', '.py'];
  var mods=[module, module+'/__init__'];

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
                console.log("imported " + module)
                //console.log(module_contents);
                if (ext[j] == '.js') {
                   return $import_js_module(module,alias,names,path,module_contents)
                }
                return $import_py_module(module,alias,names,path,module_contents)
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


function execute_python_script(filename) {
  _py_src=fs.readFileSync(filename, 'utf8')
  var root = __BRYTHON__.py2js(_py_src,'__main__')
  var js = root.to_js()
  //console.log(js);
  eval(js);
}

// Read and eval library
//jscode = fs.readFileSync('src/brython_builtins.js', 'utf8');
//eval(jscode);

jscode = fs.readFileSync('src/brython.js','utf8');
eval(jscode);

console.log("try to execute compile script");

__BRYTHON__.$py_module_path = __BRYTHON__.$py_module_path || {}
__BRYTHON__.$py_module_alias = __BRYTHON__.$py_module_alias || {}
//__BRYTHON__.$py_next_hash = -Math.pow(2,53)
__BRYTHON__.exception_stack = __BRYTHON__.exception_stack || []
__BRYTHON__.scope = __BRYTHON__.scope || {}
__BRYTHON__.modules = __BRYTHON__.modules || {}

// other import algs don't work in node
$import_funcs=[node_import]

var filename=process.argv[2];
execute_python_script(filename)
