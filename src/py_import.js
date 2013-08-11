// import modules

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
                res = Error()
                res.name = 'NotFoundError'
                res.message = "No module named '"+module+"'"
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
   return $import_js_module(module, filepath+'.js', module_contents)
}

function $import_js_module(module,filepath,module_contents){
    eval(module_contents)
    // check that module name is in namespace
    if(eval('$module')===undefined){
        throw ImportError("name '$module' is not defined in module")
    }
    // add class and __str__
    $module.__class__ = $type
    $module.__repr__ = function(){return "<module '"+module.name+"' from "+filepath+" >"}
    $module.__str__ = function(){return "<module '"+module.name+"' from "+filepath+" >"}
    $module.__file__ = filepath
    return $module
}

function $import_module_search_path(module){
  // this module is needed by $import_from, so don't remove
  return $import_module_search_path_list(module,__BRYTHON__.path);
}

function $import_module_search_path_list(module,path_list){
    var search = []
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
           }catch(err){if(err.name!=="NotFoundError"){throw err}}
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
    return $import_py_module(module,path+'.py',module_contents)
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

    // create the object that will be returned when the anonymous function is run
    var ret_code = 'return {'

    ret_code += '__getattr__:function(attr){if(this[attr]!==undefined){return this[attr]}'
    ret_code += 'else{throw AttributeError("module '+module.name+' has no attribute \''+'"+attr+"\'")}},'
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
        if (__BRYTHON__.$options.debug == 10) {
           console.log(js);
        }
        eval(js)
        // add names defined in the module as attributes of $module
        for(var attr in __BRYTHON__.scope[module.name].__dict__){
            $module[attr] = __BRYTHON__.scope[module.name].__dict__[attr]
        }
        // add class and __str__
        $module.__class__ = $type
        $module.__repr__ = function(){return "<module '"+module.name+"' from "+path+" >"}
        $module.__str__ = function(){return "<module '"+module.name+"' from "+path+" >"}
        $module.__file__ = path
        $module.__initializing__ = false
        return $module
    }catch(err){
        console.log('error running module '+module.name)
        console.log(err)
        eval('throw '+err.name+'(err.message)')
    }
}

function $import_single(module){
    var import_funcs = [$import_js, $import_module_search_path]
    if(module.name.search(/\./)>-1){import_funcs = [$import_module_search_path]}
    for(var j=0;j<import_funcs.length;j++){
        try{
            return import_funcs[j](module)
        } catch(err){
            if(err.name==="NotFoundError"){
                if(j==import_funcs.length-1){
                    throw ImportError("no module named '"+module.name+"'")
                }else{
                    continue
                }
            }else{throw(err)}
        }
    }
}

function $import_list(modules){
    var res = []
    for(var i=0;i<modules.length;i++){
        var mod_name=modules[i]
        if(mod_name.substr(0,2)=='$$'){mod_name=mod_name.substr(2)}
        var mod;
        if(__BRYTHON__.modules[mod_name]===undefined){
            // if module is in a package (eg "import X.Y") then we must first import X
            // by searching for the file X/__init__.py, then import X.Y searching either
            // X/Y.py or X/Y/__init__.py
            var mod = {}
            var parts = mod_name.split('.')
            for(var i=0;i<parts.length;i++){
                var module = new Object()
                module.name = parts.slice(0,i+1).join('.')
                if(__BRYTHON__.modules[module.name]===undefined){
                    // this could be a recursive import, so lets set modules={}
                    __BRYTHON__.modules[module.name]={}
                    // indicate if package only, or package or file
                    if(i<parts.length-1){module.package_only = true}
                    __BRYTHON__.modules[module.name] = $import_single(module)
                }
            }
        } else{
           mod=__BRYTHON__.modules[mod_name]
        }
        res.push(mod)
    }
    return res
}

function $import_list_intra(modules){
    // intra-package, like "from . import X" or "from ..Z import bar"
    // modules is a list of [module,search_path]
    // where search_path is the url of the folder where the module should
    // be found
    var res = []
    for(var i=0;i<modules.length;i++){
        var mod_name=modules[i][0],search_path=modules[i][1]
        if(mod_name.substr(0,2)=='$$'){mod_name=module.substr(2)}
        var mod;
        if(__BRYTHON__.modules[mod_name]===undefined){
            var module = {'name':mod_name}
           mod = $import_module_search_path_list(module,[search_path])
           __BRYTHON__.modules[mod_name]=mod
        } else{
            console.log('module '+mod_name+' found in __BRYTHON__ : '+__BRYTHON__.modules[mod_name])
           mod=__BRYTHON__.modules[mod_name]
        }
        res.push(mod)
    }
    return res
}


function $import_from(module,names,parent_module,alias){
    //console.log(module +","+names+","+parent_module+','+alias);
    if (parent_module !== undefined) {
       //this is a relative path import
       // ie,  from .mymodule import a,b,c
       //get parent module

       var relpath=__BRYTHON__.$py_module_path[parent_module]
       var i=relpath.lastIndexOf('/')
       relpath=relpath.substring(0, i)
    
       // todo: does the next statement make sense? 
       alias=__BRYTHON__.$py_module_alias[parent_module]
      // console.log(parent_module+','+alias+','+relpath)
       console.log('in import from, call import_md_s_p_l for module '+module)
       return $import_module_search_path_list(module,alias,names,[relpath])
    } else if (alias !== undefined) {
       return $import_single(modules,alias,names)
    } 

    return $import_single(modules,names,names)
}
