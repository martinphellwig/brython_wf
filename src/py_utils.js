// transforms a Javascript constructor into a Python function
// that returns instances of the constructor, converted to Python objects
function JSConstructor(obj){
    return new $JSConstructor(obj)
}
JSConstructor.__class__ = $type
JSConstructor.__str__ = function(){return "<class 'JSConstructor'>"}
JSConstructor.toString = JSConstructor.__str__

function $JSConstructor(js){
    this.js = js
    this.__class__ = JSConstructor
    this.__str__ = function(){return "<object 'JSConstructor' wraps "+this.js+">"}
    this.toString = this.__str__
}

function $applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

$JSConstructor.prototype.__call__ = function(){
    // this.js is a constructor
    // it takes Javascript arguments so we must convert
    // those passed to the Python function
    var args = []
    for(var i=0;i<arguments.length;i++){
        var arg = arguments[i]
        if(isinstance(arg,[JSObject,JSConstructor])){
            args.push(arg.js)
        }
        else if(isinstance(arg,dict)){
            var obj = new Object()
            for(var j=0;j<arg.$keys.length;j++){
                obj[arg.$keys[j]]=arg.$values[j]
            }
            args.push(obj)
        }else{args.push(arg)}
    }
    var res = $applyToConstructor(this.js,args)
    // res is a Javascript object
    return JSObject(res)
}

function JSObject(obj){
    if(obj===null){return new $JSObject(obj)}
    if(obj.__class__!==undefined && (typeof obj!=='function')){return obj}
    return new $JSObject(obj)
}
JSObject.__class__ = $type
JSObject.__repr__ = function(){return "<class 'JSObject'>"}
JSObject.__str__ = function(){return "<class 'JSObject'>"}
JSObject.toString = JSObject.__str__

function $JSObject(js){
    this.js = js
    this.__class__ = JSObject
    this.__str__ = function(){return "<object 'JSObject' wraps "+this.js+">"}
    this.toString = this.__str__
}

$JSObject.prototype.__bool__ = function(){return (new Boolean(this.js)).valueOf()}

$JSObject.prototype.__getitem__ = function(rank){
    if(this.js.item!==undefined){return this.js.item(rank)}
    else{throw AttributeError,this+' has no attribute __getitem__'}
}

$JSObject.prototype.__iter__ = function(){ // for iterator protocol
    var res = {
        __class__:JSObject,
        __getattr__:function(attr){return res[attr]},
        __iter__:function(){return res},
        __next__:function(){
            res.counter++
            if(res.counter<self.js.length){return self.js[res.counter]}
            else{throw StopIteration("StopIteration")}
        },
        __repr__:function(){return "<JSObject iterator object>"},
        __str__:function(){return "<JSObject iterator object>"},
        counter:-1
    }
    return res
}

$JSObject.prototype.__len__ = function(){
    if(this.js.length!==undefined){return this.js.length}
    else{throw AttributeError(this+' has no attribute __len__')}
}

$JSObject.prototype.__getattr__ = function(attr){
    if(attr==='__class__'){return JSObject}
    if(this['get_'+attr]!==undefined){
        var res = this['get_'+attr]
        if(typeof res==='function'){
            return (function(obj){
                return function(){return obj['get_'+attr].apply(obj,arguments)}
              })(this)
        }
        return this['get_'+attr]
    }else if(this.js[attr] !== undefined){
        var obj = this.js,obj_attr = this.js[attr]
        if(typeof this.js[attr]=='function'){
            var res = function(){
                var args = []
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                var res = obj_attr.apply(obj,args)
                if(typeof res == 'object'){return JSObject(res)}
                else if(res===undefined){return None}
                else{return $JS2Py(res)}
            }
            res.__repr__ = function(){return '<function '+attr+'>'}
            res.__str__ = function(){return '<function '+attr+'>'}
            return res
        }else if(obj===window && attr==='location'){
            // special lookup because of Firefox bug 
            // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
            return $Location()
        }else{
            return $JS2Py(this.js[attr])
        }
    }else{
        throw AttributeError("no attribute "+attr+' for '+this)
    }
}

$JSObject.prototype.__setattr__ = function(attr,value){
    if(isinstance(value,JSObject)){
        this.js[attr]=value.js
    }else{
        this.js[attr]=value
    }
}

function $MakeArgs($fname,$args,$required,$defaults,$other_args,$other_kw){
    // builds a namespace from the arguments provided in $args
    // in a function call like foo(x,y,z=1,*args,**kw) the parameters are
    // $required : ['x','y']
    // $defaults : {'z':int(1)}
    // $other_args = 'args'
    // $other_kw = 'kw'
    var i=null,$set_vars = [],$def_names = [],$ns = {}
    for(var k in $defaults){$def_names.push(k);$ns[k]=$defaults[k]}
    if($other_args != null){$ns[$other_args]=[]}
    if($other_kw != null){$dict_keys=[];$dict_values=[]}
    // create new list of arguments in case some are packed
    var upargs = []
    for(var i=0;i<$args.length;i++){
        if($args[i]===null){upargs.push(null)}
        else if(isinstance($args[i],$ptuple)){
            for(var j=0;j<$args[i].arg.length;j++){
                upargs.push($args[i].arg[j])
            }
        }else if(isinstance($args[i],$pdict)){
            for(var j=0;j<$args[i].arg.$keys.length;j++){
                upargs.push($Kw($args[i].arg.$keys[j],$args[i].arg.$values[j]))
            }
        }else{
            upargs.push($args[i])
        }
    }
    for(var $i=0;$i<upargs.length;$i++){
        $arg=upargs[$i]
        $PyVar=$JS2Py($arg)
        if(isinstance($arg,$Kw)){ // keyword argument
            $PyVar = $arg.value
            if($set_vars.indexOf($arg.name)>-1){
                throw new TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
            } else if($required.indexOf($arg.name)>-1){
                var ix = $required.indexOf($arg.name)
                eval('var '+$required[ix]+"=$PyVar")
                $ns[$required[ix]]=$PyVar
                $set_vars.push($required[ix])
            } else if($arg.name in $defaults){
                $ns[$arg.name]=$PyVar
                $set_vars.push($arg.name)
            } else if($other_kw!=null){
                $dict_keys.push($arg.name)
                $dict_values.push($PyVar)
            } else {
                throw new TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
            }
            if($arg.name in $defaults){delete $defaults[$arg.name]}
        }else{ // positional arguments
            if($i<$required.length){
                eval('var '+$required[$i]+"=$PyVar")
                $ns[$required[$i]]=$PyVar
                $set_vars.push($required[$i])
            } else if($other_args!=null){
                eval('$ns["'+$other_args+'"].push($PyVar)')
            } else if($i<$required.length+$def_names.length) {
                $var_name = $def_names[$i-$required.length]
                $ns[$var_name]=$PyVar
                $set_vars.push($var_name)
            } else {
                msg = $fname+"() takes "+$required.length+' positional arguments '
                msg += 'but more were given'
                throw TypeError(msg)
            }
        }
    }
    // throw error if not all required positional arguments have been set
    var missing = []
    for(var i=0;i<$required.length;i++){
        if($set_vars.indexOf($required[i])==-1){missing.push($required[i])}
    }
    if(missing.length==1){
        throw TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
    }else if(missing.length>1){
        var msg = $fname+" missing "+missing.length+" positional arguments: "
        for(var i=0;i<missing.length-1;i++){msg += "'"+missing[i]+"', "}
        msg += "and '"+missing.pop()+"'"
        throw TypeError(msg)
    }
    if($other_kw!=null){$ns[$other_kw]=new $DictClass($dict_keys,$dict_values)}
    if($other_args!=null){$ns[$other_args]=tuple($ns[$other_args])}
    return $ns
}

function $mkdict(glob,loc){
    var res = {}
    for(var arg in glob){res[arg]=glob[arg]}
    for(var arg in loc){res[arg]=loc[arg]}
    return res
}

function $list_comp(){
    var $env = arguments[0]
    for(var $arg in $env){
        eval("var "+$arg+'=$env["'+$arg+'"]')
    }
    var $ix = Math.random().toString(36).substr(2,8)
    var $py = 'def func'+$ix+"():\n"
    $py += "    res=[]\n"
    var indent=4
    for(var $i=2;$i<arguments.length;$i++){
        for(var $j=0;$j<indent;$j++){$py += ' '}
        $py += arguments[$i]+':\n'
        indent += 4
    }
    for(var $j=0;$j<indent;$j++){$py += ' '}
    $py += 'res.append('+arguments[1]+')\n'
    $py += "    return res\n"
    $py += "res"+$ix+"=func"+$ix+"()"
    var mod_name = 'lc'+$ix
    var $js = __BRYTHON__.py2js($py,mod_name).to_js()
    __BRYTHON__.scope[mod_name].__dict__ = $env
    eval($js)
    return eval("res"+$ix)
}

function $gen_expr(){ // generator expresssion
    var $env = arguments[0]
    for(var $arg in $env){
        eval("var "+$arg+'=$env["'+$arg+'"]')
    }
    var $ix = Math.random().toString(36).substr(2,8)
    var $res = 'res'+$ix
    var $py = $res+"=[]\n"
    var indent=0
    for(var $i=2;$i<arguments.length;$i++){
        for(var $j=0;$j<indent;$j++){$py += ' '}
        $py += arguments[$i]+':\n'
        indent += 4
    }
    for(var $j=0;$j<indent;$j++){$py += ' '}
    $py += $res+'.append('+arguments[1]+')'
    var mod_name = 'ge'+$ix
    var $js = __BRYTHON__.py2js($py,mod_name).to_js()
    __BRYTHON__.scope[mod_name].__dict__=$env
    eval($js)
    var $res1 = eval($res)
    $res1.__class__ = {
        __class__:$type,
        __getattr__:function(attr){return $res1[attr]},
        __repr__:function(){return "<class 'generator'>"},
        __str__:function(){return "<class 'generator'>"}
    }
    $res1.__repr__ = function(){return "<generator object <genexpr>>"}
    $res1.__str__ = $res1.__repr__
    return $res1
}

function $dict_comp(){ // dictionary comprehension
    var $env = arguments[0]
    for(var $arg in $env){
        eval("var "+$arg+'=$env["'+$arg+'"]')
    }
    var $ix = Math.random().toString(36).substr(2,8)
    var $res = 'res'+$ix
    var $py = $res+"={}\n"
    var indent=0
    for(var $i=2;$i<arguments.length;$i++){
        for(var $j=0;$j<indent;$j++){$py += ' '}
        $py += arguments[$i]+':\n'
        indent += 4
    }
    for(var $j=0;$j<indent;$j++){$py += ' '}
    $py += $res+'.update({'+arguments[1]+'})'
    var mod_name = 'dc'+$ix
    var $js = __BRYTHON__.py2js($py,mod_name).to_js()
    __BRYTHON__.scope[mod_name].__dict__ = $env
    eval($js)
    return eval($res)
}

function $generator(func){
    // a cheap and buggy implementation of generators
    // actually executes the function and stores the result of
    // successive yields in a list
    // calls to stdout.write() are captured and indexed by the iteration
    // counter
    var res = function(){
        func.$iter = []
        
        // cheat ! capture all standard output
        var save_stdout = document.$stdout
        var output = {}
        document.$stdout = JSObject({
            write : function(data){
                var loop_num = func.$iter.length
                if(output[loop_num]===undefined){
                    output[loop_num]=[data]
                }else{
                    output[loop_num].push(data)
                }
            }
        })
        func.apply(this,arguments)
        document.$stdout = save_stdout
    
        var obj = new Object()
        obj.$iter = -1
        obj.__class__ = $generator
        obj.__getattr__ = function(attr){return obj[attr]}
        obj.__len__ = function(){return func.$iter.__len__()}
        obj.__iter__ = function(){return obj}
        obj.__next__ = function(){
            obj.$iter++
            if(obj.$iter<obj.__len__()){
                if(output[obj.$iter]!==undefined){
                    for(var i=0;i<output[obj.$iter].length;i++){
                        document.$stdout.write(output[obj.$iter][i])
                    }
                }
                return func.$iter[obj.$iter]
            }
            else{throw StopIteration("")}
        }
        obj.__repr__ = function(){return "<generator object>"}
        obj.__str__ = function(){return "<generator object>"}
        return iter(obj)
    }
    res.__repr__ = function(){return "<function "+func.__name__+">"}
    return res
}
$generator.__repr__ = function(){return "<class 'generator'>"}
$generator.__str__ = function(){return "<class 'generator'>"}
$generator.__class__ = $type

function $ternary(env,cond,expr1,expr2){
    for(var attr in env){eval('var '+attr+'=env["'+attr+'"]')}
    var res = 'if ('+cond+'){\n'
    res += '    var $res = '+expr1+'\n}else{\n'
    res += '    var $res = '+expr2+'\n}'
    eval(res)
    return $res
}

function $lambda($env,$args,$body){
    for(var $attr in $env){eval('var '+$attr+'=$env["'+$attr+'"]')}
    var $res = 'res'+Math.random().toString(36).substr(2,8)
    var $py = 'def '+$res+'('+$args+'):\n'
    $py += '    return '+$body
    var $js = __BRYTHON__.py2js($py,'lambda').to_js()
    eval($js)
    return eval($res)    
}

// transform native JS types into Brython types
function $JS2Py(src){
    if(src===null||src===undefined){return None}
    if(typeof src==='number'){
        if(src%1===0){return src}
        else{return float(src)}
    }
    if(src.__class__!==undefined){
        if(src.__class__===list){
            for(var i=0;i<src.length;i++){
                src[i] = $JS2Py(src[i])
            }
        }
        return src
    }
    if(typeof src=="object"){
        if($isNode(src)){return $DOMNode(src)}
        else if($isEvent(src)){return $DOMEvent(src)}
        else if(src.constructor===Array||$isNodeList(src)){
            var res = []
            for(var i=0;i<src.length;i++){
                res.push($JS2Py(src[i]))
            }
            return res
        }
    }
    return JSObject(src)
}

// generic class for modules
function $module(){}
$module.__class__ = $type
$module.__str__ = function(){return "<class 'module'>"}

// generic attribute getter
function $getattr(obj,attr){ 
    if(obj[attr]!==undefined){
        var res = obj[attr]
        if(typeof res==="function"){
            res = $bind(res, obj) // see below
        }
        return $JS2Py(res)
    }    
}

// this trick is necessary to set "this" to the instance inside functions
// found at http://yehudakatz.com/2011/08/11/understanding-javascript-function-invocation-and-this/
function $bind(func, thisValue) {
    return function() {return func.apply(thisValue, arguments)}
}

// exceptions
function $raise(){
    // used for "raise" without specifying an exception
    // if there is an exception in the stack, use it, else throw a simple Exception
    if(__BRYTHON__.exception_stack.length>0){throw $last(__BRYTHON__.exception_stack)}
    else{throw Error('Exception')}
}

function $src_error(name,module,msg,pos) {
    // map position to line number
    var pos2line = {}
    var lnum=1
    var src = document.$py_src[module]
    var line_pos = {1:0}
    for(i=0;i<src.length;i++){
        pos2line[i]=lnum
        if(src.charAt(i)=='\n'){lnum+=1;line_pos[lnum]=i}
    }
    var line_num = pos2line[pos]
    var lines = src.split('\n')

    var lib_module = module
    if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}

    info = "module '"+lib_module+"' line "+line_num
    info += '\n'+lines[line_num-1]+'\n'
    var lpos = pos-line_pos[line_num]
    for(var i=0;i<lpos;i++){info+=' '}
    info += '^'
    err = new Error()
    err.name = name
    err.__class__ = Exception
    err.__name__ = name
    err.__getattr__ = function(attr){return err[attr]}
    err.__str__ = function(){return msg}
    err.message = msg
    err.info = info
    err.py_error = true
    __BRYTHON__.exception_stack.push(err)
    throw err
}

function $SyntaxError(module,msg,pos) {
    $src_error('SyntaxError',module,msg,pos)
}

function $IndentationError(module,msg,pos) {
    $src_error('IndentationError',module,msg,pos)
}

// function to remove internal exceptions from stack exposed to programs
function $pop_exc(){__BRYTHON__.exception_stack.pop()}

function $resolve_class_attr(cl,factory,attr){
    if(attr==='__class__'){return cl.__class__}
    if(__BRYTHON__.forbidden.indexOf(attr)!==-1){attr='$$'+attr}
    if(factory[attr]!==undefined){
        return factory[attr]
    }
    for(var i=0;i<factory.$parents.length;i++){
        try{
            return $resolve_class_attr(cl,factory.$parents[i],attr)
        }catch(err){
            void(0)
        }
    }
    throw AttributeError("'"+factory.__name__+"' class has no attribute '"+attr+"'")
}

// resolve instance attribute from its class factory
function $resolve_attr(obj,factory,attr){
    if(attr==='__class__'){return obj.__class__}
    if(__BRYTHON__.forbidden.indexOf(attr)!==-1){attr='$$'+attr}
    if(obj[attr]!==undefined){
        if(typeof obj[attr]==='function'){
            var res = function(){return obj[attr].apply(obj,arguments)}
            res.__str__ = function(){
                return "<bound method '"+attr+"' of "+obj.__class__.__name__+" object>"
            }
            return res
        }
        else {
            // FIXME: Improve descriptor access
            res = obj[attr];
            if (res.__get__ != undefined && typeof res.__get__==='function' && res === factory[attr])
                res = res.__get__.apply(res, [obj, factory])
            return res
        }
    }
    if(factory[attr]!==undefined){
        var res = factory[attr]
        if(attr==='__str__')
            console.log('factory '+factory.__name__+' str auto '+res.auto)
        if(typeof res==='function'){
            res = (function(func){
                return function(){
                    var args = [obj]
                    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                    return func.apply(obj,args)
                }
            })(res)
            res.__str__ = (function(x){
                return function(){
                    var res = "<bound method "+factory.__name__+'.'+x
                    res += ' of '+obj.__str__()+'>'
                    return res
                }
            })(attr)
        }
        // FIXME: Improve descriptor access
        if (res.__get__ !== undefined && typeof res.__get__==='function')
            res = res.__get__.apply(res, [obj, factory])
        return res
    }else{ // inheritance
        for(var i=0;i<factory.$parents.length;i++){
            try{
                return $resolve_attr(obj,factory.$parents[i],attr)
            }catch(err){
                void(0)
            }
        }
        throw AttributeError("'"+factory.__name__+"' object has no attribute '"+attr+"'")
    }
}

function $generic_methods(fact){
    return {
        __eq__ : function(self,other){
            if(other===undefined){
                // compare to the class ; self is the right operand
                return self===fact.$class
            }
            return other===self
        },
        __ne__ : function(self,other){
            if(other===undefined){
                // compare to the class ; self is the right operand
                return self!==fact.$class
            }
            return other !== self
        },
        __repr__ : function(self){
            if(self===undefined){return "<class "+fact.__name__+">"}
            else{return "<"+fact.__name__+" object>"}
        },
        __str__ : function(self){
            if(self===undefined){return "<class "+fact.__name__+">"}
            else{return "<"+fact.__name__+" object>"}
        }
    }
}
// generic code for class constructor
function $class_constructor(class_name,factory,parents){
    // function can have additional arguments : the parent classes
    var parent_classes = []
    // all python 3 classes should implicitly inherit from object.
    // see: http://docs.python.org/2/reference/datamodel.html#newstyle
    // But for objects that inherit
    if(parents===undefined){parents=tuple()}
    if(!isinstance(parents,tuple)){parents=[parents]}
    for(var i=0;i<parents.length;i++){
       if(parents[i]===object){continue} // don't inherit from object
       else if(parents[i]===int){parents[i]=$IntWrapper}
       parent_classes.push(parents[i])
    }
    
    factory.$parents = parent_classes
    factory.__name__ = class_name
    
    // add generic functions if not already defined in the class or
    // in one of its parents
    var gfuncs = $generic_methods(factory)
    for(var fname in gfuncs){
        var flag = false
        try{
            flag = $resolve_class_attr(null,factory,fname).generic===undefined
        }
        catch(err){void(0)}
        if(!flag){
            factory[fname] = gfuncs[fname]
            factory[fname].generic = true
        }
    }

    var f = function(){
        
        var obj=new Object()
        var $initialized=false
        var fact = factory
        // if factory contains __new__ do not run parents __new__ auto.
        if (fact.__new__ === undefined) {
          while(fact.$parents!==undefined && fact.$parents.length>0){
             if(fact.$parents.length && 
                fact.$parents[0].__new__!==undefined){
                 var obj = fact.$parents[0].__new__.apply(null,arguments)
                 $initialized = true
                 break
             }
             fact = fact.$parents[0]
          }
        }

        obj.__class__ = f
        // set attributes
        for(var attr in factory){
            //if(attr=='__getattr__'){continue}
            if(attr.charAt(0)==='$'){continue}
            if(attr=='__class__'){return f}
            else if(typeof factory[attr]==="function"){
                var func = factory[attr]
                obj[attr] = (function(func){
                    return function(){
                        var args = [obj]
                        for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                        return func.apply(obj,args)
                    }
                })(func)
                obj[attr].__str__ = (function(x){
                    return function(){
                        var res = "<bound method "+class_name+'.'+x
                        res += ' of '+obj.__str__()+'>'
                        return res
                    }
                })(attr)
            }else{obj[attr] = factory[attr]}
        }
        if(factory['__getattr__']==undefined){
            obj.__getattr__ = function(attr){return $resolve_attr(obj,factory,attr)}
        }
        obj.__getattr__.__name__ = "<bound method __getattr__ of "+class_name+" object>"
        if(factory['__setattr__']==undefined){
            obj.__setattr__ = function(attr,value){obj[attr]=value}
        }
        obj.__setattr__.__name__ = "<bound method __setattr__ of "+class_name+" object>"
        
        try{$resolve_attr(obj,factory,'__repr__')}
        catch(err){
            $pop_exc()
            obj.__repr__ = function(){return "<"+class_name+" object>"}
            obj.__repr__.__name__ = "<bound method __repr__ of "+class_name+" object>"
            obj.__repr__.auto = true
        }
        //obj.toString = obj.__str__

        // __eq__ defaults to identity
        try{$resolve_attr(obj,factory,'__eq__')}
        catch(err){
            $pop_exc()
            obj.__eq__ = function(other){return obj===other}
            obj.__eq__.__name__ = "<bound method __eq__ of "+class_name+" object>"
        }

        // __hash__ defaults to object.__hash__
        try{$resolve_attr(obj,factory,'__hash__')}
        catch(err){
            $pop_exc()
            obj.__hash__ = function(){    
                __BRYTHON__.$py_next_hash+=1; 
                return __BRYTHON__.$py_next_hash;
            }
            obj.__hash__.__name__ = "<bound method __hash__ of "+class_name+" object>"
        }
        if(!$initialized){
            var init_func = null
            try{init_func = $resolve_attr(obj,factory,'__init__')}
            catch(err){$pop_exc()}
            if(init_func!==null){
                var args = [obj]
                for(var i=0;i<arguments.length;i++){
                    args.push(arguments[i])
                }
                init_func.apply(null,arguments)
                obj.$initialized = true
            } else {
              try{init_func = $resolve_attr(obj,factory,'__new__')}
              catch(err){$pop_exc()}
              if(init_func!==null){
                init_func.apply(null,arguments)
                obj.$initialized = true
              }
            }
        }
        return obj
    }

    for(var attr in factory){
        if(attr==='__call__'){continue}
        f[attr]=factory[attr]
        // FIXME: Improve
        if (typeof f[attr] === 'function') {
            f[attr].__str__ = (function(x){
                return function(){return "<function "+class_name+'.'+x+'>'}
                })(attr)
        }
    }
    
    f.__getattr__ = function(attr){ // class attribute
        return $resolve_class_attr(f,factory,attr)
    }
    f.__setattr__ = function(attr,value){
        factory[attr]=value;f[attr]=value
    }
    factory.$class = f
    return f
}

// escaping double quotes
var $dq_regexp = new RegExp('"',"g") // to escape double quotes in arguments
function $escape_dq(arg){return arg.replace($dq_regexp,'\\"')}

// default standard output and error
// can be reset by sys.stdout or sys.stderr
document.$stderr = {
    __getattr__:function(attr){return this[attr]},
    'write':function(data){console.log(data)}
}
document.$stderr_buff = '' // buffer for standard output

document.$stdout = {
    __getattr__:function(attr){return this[attr]},
    write: function(data){console.log(data)}
}

// used for class of classes
function $type(){}
$type.__class__ = $type
$type.__name__ = 'type'
$type.__str__ = function(){return "<class 'type'>"}
$type.toString = $type.__str__

function $UnsupportedOpType(op,class1,class2){
    $raise('TypeError',
        "unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}

// classes used for passing parameters to functions
// keyword arguments : foo(x=1)
function $KwClass(name,value){
    this.__class__ = $Kw
    this.name = name
    this.value = value
}
$KwClass.prototype.toString = function(){
    return '<kw '+this.name+' : '+this.value.toString()+'>'
}
function $Kw(name,value){
    return new $KwClass(name,value)
}

// packed tuple : foo(*args)
function $ptuple_class(arg){
    this.__class__ = $ptuple
    this.arg=arg
}
function $ptuple(arg){return new $ptuple_class(arg)}

// packed dict : foo(**kw)
function $pdict_class(arg){
    this.__class__ = $pdict
    this.arg=arg
}
function $pdict(arg){return new $pdict_class(arg)}


function $test_item(expr){
    // used to evaluate expressions with "and" or "or"
    // returns a Javascript boolean (true or false) and stores
    // the evaluation in a global variable $test_result
    document.$test_result = expr
    return bool(expr)
}

function $test_expr(){
    // returns the last evaluated item
    return document.$test_result
}

// define a function __eq__ for functions to allow test on Python classes
// such as object.__class__ == SomeClass
Function.prototype.__call__ = function(){
    var res = this.apply(null,arguments)
    if(res===undefined){return None}else{return res}    
}

Function.prototype.__eq__ = function(other){
    if(typeof other !== 'function'){return False}
    return other+''===this+''
}
Function.prototype.__class__ = Function
Function.prototype.__repr__ = function(){return "<function "+this.__name__+">"}
// attribute "def" of __repr__ and __str__ methods is used to resolve 
// attributes __repr__ and __str__ of classes and instances
Function.prototype.__repr__.def = 'function'
Function.prototype.__str__ = function(){return "<function "+this.__name__+">"}
Function.prototype.__str__.def = 'function'

Array.prototype.match = function(other){
    // return true if array and other have the same first items
    var $i = 0
    while($i<this.length && $i<other.length){
        if(this[$i]!==other[$i]){return false}
        $i++
    }
    return true
}

// IE doesn't implement indexOf on Arrays
if(!Array.indexOf){  
Array.prototype.indexOf = function(obj){  
    for(var i=0;i<this.length;i++){  
        if(this[i]==obj){  
            return i;  
        }  
    }  
    return -1;  
 }  
}

// in case console is not defined
try{console}
catch(err){
    console = {'log':function(data){void(0)}}
}

function $List2Dict(){
    var res = {}
    var i=0
    if(arguments.length==1 && arguments[0].constructor==Array){
        // arguments passed as a list
        for(i=0;i<arguments[0].length;i++){
            res[arguments[0][i]]=0
        }
    } else {
        for(i=0;i<arguments.length;i++){
            res[arguments[i]]=0
        }
    }
    return res
}

function $last(item){
    if(typeof item=="string"){return item.charAt(item.length-1)}
    else if(typeof item=="object"){return item[item.length-1]}
}

// override IDBObjectStore's add, put, etc functions since we need
// to convert python style objects to a js object type

function pyobject2jsobject(obj) {
    if(isinstance(obj,dict)){
        var temp = new Object()
        temp.__class__ = 'dict'
        for(var i=0;i<obj.__len__();i++){temp[obj.$keys[i]]=obj.$values[i]}
        return temp
    }

    // giving up, just return original object
    return obj
}

function jsobject2pyobject(obj) {
    if(obj === undefined) return None
    if(obj.__class__ === 'dict'){
       var d = dict()
       for(var attr in obj){
          if (attr !== '__class__') d.__setitem__(attr, obj[attr])
       }
       return d
    }

    // giving up, just return original object
    return obj
}

if (window.IDBObjectStore !== undefined) {
    window.IDBObjectStore.prototype._put=window.IDBObjectStore.prototype.put
    window.IDBObjectStore.prototype.put=function(obj, key) {
       var myobj=pyobject2jsobject(obj);
       return window.IDBObjectStore.prototype._put.apply(this, [myobj, key]);
    }
    
    window.IDBObjectStore.prototype._add=window.IDBObjectStore.prototype.add
    window.IDBObjectStore.prototype.add=function(obj, key) {
       var myobj=pyobject2jsobject(obj);
       return window.IDBObjectStore.prototype._add.apply(this, [myobj, key]);
    }
}

if (window.IDBRequest !== undefined) {
    window.IDBRequest.prototype.pyresult=function() {
       return jsobject2pyobject(this.result);
    }
}
