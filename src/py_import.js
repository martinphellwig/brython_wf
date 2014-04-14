// import modules

;(function($B){

var __builtins__ = $B.builtins

$B.$ModuleDict = {
    __class__ : $B.$type,
    __name__ : 'module',
}
$B.$ModuleDict.__repr__ = function(self){return '<module '+self.__name__+'>'}
$B.$ModuleDict.__str__ = function(self){return '<module '+self.__name__+'>'}
$B.$ModuleDict.__mro__ = [$B.$ModuleDict,$B.builtins.object.$dict]

function $importer(){
    // returns the XMLHTTP object to handle imports
    var $xmlhttp = new XMLHttpRequest();
    var __builtins__ = __BRYTHON__.builtins
    if (__builtins__.$CORS && "withCredentials" in $xmlhttp) {
       // Check if the XMLHttpRequest object has a "withCredentials" property.
       // "withCredentials" only exists on XMLHTTPRequest2 objects.
    } else if (__builtins__.$CORS && typeof window.XDomainRequest != "undefined") {
      // Otherwise, check if XDomainRequest.
      // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
      $xmlhttp = new window.XDomainRequest();
    } else if (window.XMLHttpRequest){
      // Otherwise, CORS is not supported by the browser. or CORS is not activated by developer/programmer
      // code for IE7+, Firefox, Chrome, Opera, Safari
      //$xmlhttp=new XMLHttpRequest();  // we have already an instance of XMLHttpRequest
    }else{// code for IE6, IE5
      // Otherwise, CORS is not supported by the browser. or CORS is not activated by developer/programmer
      $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
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
        throw __builtins__.ImportError("No module named '"+module+"'")}, 5000)
    return [$xmlhttp,fake_qs,timer]
}

function $download_module(module,url){
    var imp = $importer(),__builtins__=__BRYTHON__.builtins
    var $xmlhttp = imp[0],fake_qs=imp[1],timer=imp[2],res=null

    $xmlhttp.open('GET',url+fake_qs,false)

    if (__builtins__.$CORS) {
      $xmlhttp.onload=function() {
         if ($xmlhttp.status == 200 || $xmlhttp.status == 0) {
            res = $xmlhttp.responseText
         } else {
            res = __builtins__.FileNotFoundError("No module named '"+module+"'")
         }
      }
      $xmlhttp.onerror=function() {
         res = __builtins__.FileNotFoundError("No module named '"+module+"'")
      }
    } else {
      $xmlhttp.onreadystatechange = function(){
        if($xmlhttp.readyState==4){
            window.clearTimeout(timer)
            if($xmlhttp.status==200 || $xmlhttp.status==0){res=$xmlhttp.responseText}
            else{
                // don't throw an exception here, it will not be caught (issue #30)
            console.log('Error '+$xmlhttp.status+' means that Python module '+module+' was not found at url '+url)
                res = __builtins__.FileNotFoundError("No module named '"+module+"'")
            }
        }
      }
    }
    if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
    $xmlhttp.send()

    //sometimes chrome doesn't set res correctly, so if res == null, assume no module found
    if(res == null) throw __builtins__.FileNotFoundError("No module named '"+module+"' (res is null)")

    //console.log('res', res)
    if(res.constructor===Error){throw res} // module not found
    return res
}

$B.$download_module=$download_module

$B.$import_js = function(module){
   var name = module.name
   if(name.substr(0,2)=='$$'){name = name.substr(2)}
   var filepath=__BRYTHON__.brython_path+'libs/' + name
   return $B.$import_js_generic(module,filepath)
}

$B.$import_js_generic = function(module,filepath) {
   var module_contents=$download_module(module.name, filepath+'.js')
   return $B.$import_js_module(module, filepath+'.js', module_contents)
}

function show_ns(){
    var kk = Object.keys(window)
    for (var i=0; i < kk.length; i++){
        console.log(kk[i])
        if(kk[i].charAt(0)=='$'){console.log(eval(kk[i]))}
    }
    console.log('---')
}

$B.$import_js_module = function(module,filepath,module_contents){
    eval(module_contents)
    // check that module name is in namespace
    try{$module}
    catch(err){
        throw __builtins__.ImportError("name '$module' is not defined in module")
    }
    // add class and __str__
    __BRYTHON__.vars[module.name] = $module
    $module.__class__ = $B.$ModuleDict
    $module.__name__ = module.name
    $module.__repr__ = function(){return "<module '"+module.name+"' from "+filepath+" >"}
    $module.__str__ = function(){return "<module '"+module.name+"' from "+filepath+" >"}
    $module.__file__ = filepath
    return $module
}

$B.$import_module_search_path = function(module,origin){
  // this module is needed by $import_from, so don't remove
  //var path_list = __BRYTHON__.path.slice()
  return $B.$import_module_search_path_list(module,__BRYTHON__.path,origin);
}

$B.$import_module_search_path_list = function(module,path_list,origin){
    var search = [], path_modified=false
    if(origin!==undefined){
        // add path of origin script to list of paths to search
        var origin_path = __BRYTHON__.$py_module_path[origin]
        var elts = origin_path.split('/')
        elts.pop()
        origin_path = elts.join('/')
        if(path_list.indexOf(origin_path)==-1){
            path_list.splice(0,0,origin_path)
            path_modified = true
        }
    }
    var mod_path = module.name.replace(/\./g,'/')
    if(mod_path.substr(0,2)=='$$'){mod_path=mod_path.substr(2)}
    if(!module.package_only){
        // Attribute "package_only" is set for X in "import X.Y"
        // In this case, we don't have to search a file "X.py"
        search.push(mod_path)
    }
    search.push(mod_path+'/__init__')
    
    var flag = false
    for(var j=0; j < search.length; j++) {
        var modpath = search[j]
        for(var i=0;i<path_list.length;i++){
           var path = path_list[i]
           if(path.charAt(path.length-1)!='/'){path += "/"}
           path += modpath
           //console.log(path)
           try {
               var mod = $B.$import_py(module,path)
               flag = true
               if(j==search.length-1){mod.$package=true}
           }catch(err){
              //console.log(err)
              if(err.__name__!=="FileNotFoundError"){
                       flag=true;throw err}
           }
           if(flag){break}
        }
        if(flag){break}
    }
    if(path_modified){path_list.splice(0,1)} // reset original path list

    if(!flag){
        throw __builtins__.ImportError("module "+module.name+" not found")
    }
    return mod
}

$B.$import_py = function(module,path){
    // import Python modules, in the same folder as the HTML page with
    // the Brython script
    var module_contents=$download_module(module.name, path+'.py')
    return $B.$import_py_module(module,path+'.py',module_contents)
}

$B.$import_py_module = function(module,path,module_contents) {
    var $Node = __BRYTHON__.$Node,$NodeJSCtx=__BRYTHON__.$NodeJSCtx
    __BRYTHON__.$py_module_path[module.name]=path //.substr(__BRYTHON__.brython_path.length)

    var root = __BRYTHON__.py2js(module_contents,module.name)
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
    var mod_node = new $Node('expression')
    new $NodeJSCtx(mod_node,'var $module=(function()')
    root.insert(0,mod_node)
    for(var i=0;i<body.length;i++){mod_node.add(body[i])}

    // $globals will be returned when the anonymous function is run
    var ret_node = new $Node('expression')
    new $NodeJSCtx(ret_node,'return $globals')
    mod_node.add(ret_node)
    // add parenthesis for anonymous function execution
    
    var ex_node = new $Node('expression')
    new $NodeJSCtx(ex_node,')(__BRYTHON__)')
    root.add(ex_node)
    
    try{
        var js = root.to_js()
        if (__BRYTHON__.$options.debug == 10) {
            console.log('code for module '+module.name)
           console.log(js)
        }
        eval(js)

    }catch(err){
        console.log(err+' '+' for module '+module.name)
        for(var attr in err){
            console.log(attr+' '+err[attr])
        }
        console.log('message: '+err.message)
        console.log('filename: '+err.fileName)
        console.log('linenum: '+err.lineNumber)
        if(__BRYTHON__.debug>0){console.log('line info '+__BRYTHON__.line_info)}
        throw err
    }

    try{
        // add names defined in the module as attributes of $module
        for(var attr in __BRYTHON__.vars[module.name]){
            $module[attr] = __BRYTHON__.vars[module.name][attr]
        }
        // add class and __str__
        $module.__class__ = $B.$ModuleDict
        $module.__repr__ = function(){return "<module '"+module.name+"' from "+path+" >"}
        $module.__str__ = function(){return "<module '"+module.name+"' from "+path+" >"}
        $module.toString = function(){return "module "+module.name}
        $module.__file__ = path
        $module.__initializing__ = false
        return $module
    }catch(err){
        console.log(''+err+' '+' for module '+module.name)
        for(var attr in err){
            console.log(attr+' '+err[attr])
        }
        //console.log('js code\n'+js)
        if(__BRYTHON__.debug>0){console.log('line info '+__BRYTHON__.line_info)}
        throw err
    }
}

$B.$import_single = function(module,origin){
    var import_funcs = [$B.$import_js, $B.$import_module_search_path]
    if(module.name.search(/\./)>-1){import_funcs = [$B.$import_module_search_path]}
    for(var j=0;j<import_funcs.length;j++){
        try{
            return import_funcs[j](module,origin)
        } catch(err){
            if(err.__name__==="FileNotFoundError"){
                if(j==import_funcs.length-1){
                    // all possible locations failed : throw error
                    // remove module name from __BRYTHON__.imported and .modules
                    __BRYTHON__.imported[module.name] = undefined
                    __BRYTHON__.modules[module.name] = undefined
                    throw err
                }else{
                    continue
                }
            }else{
                __BRYTHON__.imported[module.name] = undefined
                __BRYTHON__.modules[module.name] = undefined
                throw err
            }
        }
    }
}

$B.$import = function(mod_name,origin){
    if (__BRYTHON__.$options.debug == 10) {
       console.log('$import '+mod_name);show_ns()
    }
    var res = []
    //if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
    var mod;
    var stored = __BRYTHON__.imported[mod_name]
    if(stored===undefined){
        // search in standard library
        var stdlib_path = __BRYTHON__.stdlib[mod_name]
        if(__BRYTHON__.static_stdlib_import && stdlib_path!==undefined){
            //console.log(mod_name+' found in stdlib '+stdlib_path[0])
            var module = {name:mod_name}
            if(stdlib_path[0]=='py'){
                // load Python module
                __BRYTHON__.modules[module.name]={__class__:$B.$ModuleDict}
                __BRYTHON__.imported[module.name]={__class__:$B.$ModuleDict}
                var path = 'Lib/'+mod_name.split('.').join('/')
                if(stdlib_path[1]){path+='/__init__'}
                mod = $B.$import_py(module, __BRYTHON__.brython_path+path)
                mod.$package = stdlib_path[1]
                __BRYTHON__.modules[module.name] = mod
                __BRYTHON__.imported[module.name]=__BRYTHON__.modules[module.name]                
            }else{
                //load Javascript module
                mod = $B.$import_js(module)
                __BRYTHON__.modules[module.name] = mod
                __BRYTHON__.imported[module.name]=__BRYTHON__.modules[module.name]                
            }
        }else{
            // if module is in a package (eg "import X.Y") then we must first import X
            // by searching for the file X/__init__.py, then import X.Y searching either
            // X/Y.py or X/Y/__init__.py
            mod = {}
            var parts = mod_name.split('.')
            for(var i=0;i<parts.length;i++){
                var module = new Object()
                module.name = parts.slice(0,i+1).join('.')
                if(__BRYTHON__.modules[module.name]===undefined){
                    // this could be a recursive import, so lets set modules={}
                    __BRYTHON__.modules[module.name]={__class__:$B.$ModuleDict}
                    __BRYTHON__.imported[module.name]={__class__:$B.$ModuleDict}
                    // Indicate if package only, or package or file
                    if(i<parts.length-1){
                        // searching for X in "import X.Y"
                        module.package_only = true
                    }
                    __BRYTHON__.modules[module.name] = $B.$import_single(module,origin)
                    __BRYTHON__.imported[module.name]=__BRYTHON__.modules[module.name]
                }
            }
        }
    }else{
        mod=stored
    }
    res.push(mod)
    return res
}

$B.$import_from = function(mod_name,names,origin){
    // used for "from X import A,B,C
    // mod_name is the name of the module
    // names is a list of names
    // origin : name of the module where the import is requested
    // if mod_name matches a module, the names are searched in the module
    // if mod_name matches a package (file mod_name/__init__.py) the names
    // are searched in __init__.py, or as module names in the package
    if (__BRYTHON__.$options.debug == 10) {
      console.log('import from '+mod_name);show_ns()
    }
    if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
    var mod = __BRYTHON__.imported[mod_name]
    if(mod===undefined){$B.$import(mod_name);mod=__BRYTHON__.modules[mod_name]}
    var mod_ns = mod
    for(var i=0;i<names.length;i++){
        if(mod_ns[names[i]]===undefined){
            if(mod.$package){
                var sub_mod = mod_name+'.'+names[i]
                $B.$import(sub_mod,origin)
                mod[names[i]] = __BRYTHON__.modules[sub_mod]
            }else{
                throw __builtins__.ImportError("cannot import name "+names[i])
            }
        }
    }
    return mod
}


$B.$import_list_intra = function(src,current_url,names){
    // form "from . import A,B" or "from ..X import A,B"
    // "src" is the item after "from" : '.' and '..X' in the examples above
    // "current_url" is the URL of the script where the call was made
    // "names" is the list of names to import
    var mod;
    var elts = current_url.split('/')
    var nbpts = 0 // number of points in src
    while(src.charAt(nbpts)=='.'){nbpts++}
    var pymod_elts = elts.slice(0,elts.length-nbpts)
    var pymod_name = src.substr(nbpts)
    var pymod_path = pymod_elts.join('/')
    if(pymod_name){ // form 'from ..Z import bar' : Z is a module name, 
                    // bar is a name in Z namespace
        //pymod_elts.push(pymod_name)
        var stored = __BRYTHON__.imported[pymod_name]
        if(stored!==undefined){return stored}
        var pymod = {'name':pymod_name}
        mod = $B.$import_module_search_path_list(pymod,[pymod_path])
        if(mod!=undefined){
            __BRYTHON__.modules[pymod_name] = mod
            __BRYTHON__.imported[pymod_name] = mod
            return mod
        }
    }else{ // form 'from . import X' : X is a module name
        mod = {}
        for(var i=0;i<names.length;i++){
            var stored = __BRYTHON__.imported[names[i]]
            if(stored!==undefined){mod[names[i]]=stored}
            else{
                mod[names[i]]=$B.$import_module_search_path_list({'name':names[i]},[pymod_path])
                __BRYTHON__.modules[names[i]] = mod[names[i]]
                __BRYTHON__.imported[names[i]]=mod[names[i]]
            }
        }
    }
    return mod
}

})(__BRYTHON__)
