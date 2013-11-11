
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
        $arg = $args[i]
        if($arg===null){upargs.push(null)}
        else if($arg.__class__===$ptupleDict){
            for(var j=0;j<$arg.arg.length;j++){
                upargs.push($arg.arg[j])
            }
        }else if($arg.__class__===$pdictDict){
            for(var j=0;j<$arg.arg.$keys.length;j++){
                upargs.push($Kw($arg.arg.$keys[j],$arg.arg.$values[j]))
            }
        }else{
            upargs.push($arg)
        }
    }
    for(var $i=0;$i<upargs.length;$i++){
        $arg=upargs[$i]
        $PyVar=$JS2Py($arg)
        if($arg && $arg.__class__===$Kw){ // keyword argument
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
            } else if($other_args!==null){
                eval('$ns["'+$other_args+'"].push($PyVar)')
            } else if($i<$required.length+$def_names.length) {
                $var_name = $def_names[$i-$required.length]
                $ns[$var_name]=$PyVar
                $set_vars.push($var_name)
            } else {
                msg = $fname+"() takes "+$required.length+' positional argument'
                msg += $required.length == 1 ? '' : 's'
                msg += ' but more were given'
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
    var $root = __BRYTHON__.py2js($py,mod_name)
    $root.caller = document.$line_info
    var $js = $root.to_js()
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
    var $root = __BRYTHON__.py2js($py,mod_name)
    $root.caller = document.$line_info
    var $js = $root.to_js()
    __BRYTHON__.scope[mod_name].__dict__=$env
    eval($js)
    var $res1 = eval($res)
    var $GenExprDict = {
        __class__:$type,
        __name__:'generator',
        toString:function(){return '(generator)'}
    }
    $GenExprDict.__mro__ = [$GenExprDict,$ObjectDict]
    $GenExprDict.__iter__ = function(self){return $ListDict.__iter__(self.value)}
    $GenExprDict.__str__ = function(self){
        if(self===undefined){return "<class 'generator'>"}
        return '<generator object <genexpr>>'
    }
    $GenExprDict.$factory = $GenExprDict
    var $res2 = {value:$res1,__class__:$GenExprDict}
    //$res1.__repr__ = function(){return "<generator object <genexpr>>"}
    //$res1.__str__ = $res1.__repr__
    $res2.toString = function(){return 'ge object'}
    return $res2
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

    $GeneratorDict = {__class__:$type,
        __name__:'generator'
    }
    $GeneratorDict.__iter__ = function(self){return self}
    $GeneratorDict.__next__ = function(self){
        self.$iter++
        if(self.$iter<self.func.$iter.length){
            if(self.output[self.$iter]!==undefined){
                for(var i=0;i<self.output[self.$iter].length;i++){
                    document.$stdout.write(self.output[self.$iter][i])
                }
            }
            return self.func.$iter[self.$iter]
        }
        else{throw StopIteration("")}
    }
    $GeneratorDict.__mro__ = [$GeneratorDict,$ObjectDict]

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
    
        var obj = {
            __class__ : $GeneratorDict,
            func:func,
            output:output,
            $iter:-1
        }
        return obj
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
    res += '    var $res = '+unescape(expr1)+'\n}else{\n'
    res += '    var $res = '+unescape(expr2)+'\n}'
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
        if(src.__class__===$ListDict){
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

    info = "  module '"+lib_module+"' line "+line_num
    var line = lines[line_num-1]
    var lpos = pos-line_pos[line_num]
    while(line && line.charAt(0)==' '){
     line=line.substr(1)
     lpos--
    }
    info += '\n    '+line+'\n'
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

function $resolve_cl_attr(_class,attr){
    var classes = _class.__mro__
    for(var i=0;i<classes.length;i++){
        var val = classes[i].__dict__.get(attr,null)
        if(val!==null){return val}
    }
    throw AttributeError('class '+_class.__name__+" has no attribute '"+attr+"'")
}

// generic code for class constructor
function $class_constructor(class_name,factory,parents){
    var cl_dict=dict(),bases=null
    for(var attr in factory){
        if(typeof factory[attr]=='function'){
            factory[attr].__str__ = (function(x){
                return function(){return '<function '+class_name+'.'+x+'>'}
              })(attr)
            factory[attr].__name__ = class_name+'.'+attr
        }
        $DictDict.__setitem__(cl_dict,attr,factory[attr])
    }
    if(parents===undefined){bases = tuple([object])}
    else if(!isinstance(parents,tuple)){bases=tuple([parents])}
    else{bases=parents}
    if(!bases.indexOf(object)==-1){bases=bases.concat(tuple([object]))}
    return type(class_name,bases,cl_dict)
}

function type(name,bases,cl_dict){
    // if called with a single argument, returns the class of the first argument
    if(arguments.length==1){return name.__class__}

    // Else return a new type object. This is essentially a dynamic form of the 
    // class statement. The name string is the class name and becomes the 
    // __name__ attribute; the bases tuple itemizes the base classes and 
    // becomes the __bases__ attribute; and the dict dictionary is the 
    // namespace containing definitions for class body and becomes the 
    // __dict__ attribute
    
    // A Python class is implemented as 2 Javascript objects :
    // - a dictionary that holds the class attributes and the method resolution 
    //   order, computed from the bases with the C3 algorithm
    // - a factory function that creates instances of the class
    // The dictionary is the attribute "$dict" of the factory function
    // type() returns the factory function

    // Create the class dictionary    
    class_dict = new Object()
        
    // class attributes
    class_dict.__class__ = $type
    class_dict.__name__ = name
    class_dict.__bases__ = bases
    class_dict.__dict__ = cl_dict

    // set class attributes for faster lookups
    for(var i=0;i<cl_dict.$keys.length;i++){
        var attr = cl_dict.$keys[i],val=cl_dict.$values[i]
        class_dict[attr] = val
    }

    //class_dict.__setattr__ = function(attr,value){class_dict[attr]=value}

    // method resolution order
    // copied from http://code.activestate.com/recipes/577748-calculate-the-mro-of-a-class/
    // by Steve d'Aprano
    var seqs = []
    for(var i=0;i<bases.length;i++){
        // we can't simply push bases[i].__mro__ 
        // because it would be modified in the algorithm
        if(bases[i]===str){bases[i] = $StringSubclassFactory}
        var bmro = []
        for(var k=0;k<bases[i].$dict.__mro__.length;k++){
            bmro.push(bases[i].$dict.__mro__[k])
        }
        seqs.push(bmro)
    }

    for(var i=0;i<bases.length;i++){
        seqs.push(bases[i].$dict)
    }

    var mro = []
    while(true){
        var non_empty = []
        for(var i=0;i<seqs.length;i++){
            if(seqs[i].length>0){non_empty.push(seqs[i])}
        }
        if (non_empty.length==0){break}
        for(var i=0;i<non_empty.length;i++){
            var seq = non_empty[i]
            var candidate = seq[0]
            not_head = []
            for(var j=0;j<non_empty.length;j++){
                var s = non_empty[j]
                if(s.slice(1).indexOf(candidate)>-1){not_head.push(s)}
            }
            if(not_head.length>0){candidate=null}
            else{break}
        }
        if(candidate===null){
            throw TypeError("inconsistent hierarchy, no C3 MRO is possible")
        }
        mro.push(candidate)
        for(var i=0;i<seqs.length;i++){
            var seq = seqs[i]
            if(seq[0]===candidate){ // remove candidate
                seqs[i].shift()
            }
        }
    }
    class_dict.__mro__ = [class_dict].concat(mro)
    class_dict.toString = function(){return '$'+name+'Dict'}
    //console.log('mro of '+class_dict+' '+class_dict.__mro__)

    // create the factory function
    var factory = (function(_class){
            return function(){
                return $instance_creator(_class).apply(null,arguments)
            }
        })(class_dict)
    factory.__class__ = $factory
    factory.$dict = class_dict
    
    // factory compares equal to class_dict
    // so that instance.__class__ compares equal to factory
    factory.__eq__ = function(other){
        return other===factory.__class__
    }
    class_dict.$factory = factory    
    return factory
}

$factory = {toString:function(){return '<factory>'}}
$factory.__mro__ = [$factory]

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
var $type = {}
function $instance_creator(klass){
    // return the function to initalise a class instance
    return function(){
        var new_func=null,init_func=null,obj
        // apply __new__ to initialize the instance
        try{
            new_func = getattr(klass,'__new__')
        }catch(err){$pop_exc()}
        if(new_func!==null){
            var args = [klass.$factory]
            for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
            obj = new_func.apply(null,args)
        }
        try{
            init_func = getattr(klass,'__init__')
        }catch(err){
            $pop_exc()
        }
        if(init_func!==null){
            var args = [obj]
            for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
            init_func.apply(null,args)
        }
        return obj
    }
}
$type.__class__ = $type
$type.__getattribute__=function(klass,attr){
    if(attr==='__call__'){return $instance_creator(klass)}
    else if(attr==='__eq__'){return function(other){return klass==other.$dict}}
    else if(attr==='__repr__'){return function(){return "<class '"+klass.__name__+"'>"}}
    else if(attr==='__str__'){return function(){return "<class '"+klass.__name__+"'>"}}
    else if(attr==='__class__'){return klass.__class__}
    else if(attr==='__doc__'){return klass.__doc__}
    else if(attr==='__setattr__'){
        if(klass['__setattr__']!==undefined){return klass['__setattr__']}
        return function(key,value){
            if(typeof value=='function'){
                klass[key]=function(){return value.apply(null,arguments)}
                klass[key].$type = 'instancemethod' // for attribute resolution
            }else{
                klass[key]=value
            }
        }
    }else if(attr==='__delattr__'){
        if(klass['__delattr__']!==undefined){return klass['__delattr__']}
        return function(key){delete klass[key]}
    }
    var res = klass[attr],is_class=true
    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        var mro = klass.__mro__
        if(mro===undefined){console.log('mro undefined for class '+klass)}
        for(var i=0;i<mro.length;i++){
            var v=mro[i][attr]
            if(v!==undefined){
                res = v
                break
            }
        }
    }
    if(res!==undefined){
        res.__name__ = attr
        if(res.__get__!==undefined){ // descriptor
            // __new__ is a static method
            if(attr=='__new__'){res.$type='staticmethod'}
            res1 = res.__get__.apply(null,[res,None,klass])
            var args
            if(res1.__class__===Function){
                // method
                var __self__,__func__,__repr__,__str__
                if(res.$type===undefined){
                    // function called from a class
                    args = []
                    __repr__ = __str__ = function(){
                        return '<function '+klass.__name__+'.'+attr+'>'
                    }
                }else if(res.$type==='classmethod'){
                    // class method : called with the class as first argument
                    args = [klass]
                    __self__ = klass
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method type'+'.'+attr
                        x += ' of '+str(klass)+'>'
                        return x
                    }
                }else if(res.$type==='staticmethod'){
                    // static methods have no __self__ or __func__
                    args = []
                    __repr__ = __str__ = function(){
                        return '<function '+klass.__name__+'.'+attr+'>'
                    }
                }

                // return a method that adds initial args to the function
                // arguments
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        for(var i=0;i < arguments.length;i++){
                            local_args.push(arguments[i])
                        }
                        return res.apply(null,local_args)
                    }})(args)
                method.__class__ = {
                    __class__:$type,
                    __name__:'method',
                    __mro__:[$ObjectDict]
                }
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                return method
            }
        }else{
            return res
        }
    }else{
        // search __getattr__
        throw AttributeError("type object '"+klass.__name__+"' has no attribute '"+attr+"'")
    }
}
$type.__mro__ = [$type]
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
$Kw.$dict = $Kw // for insinstance

// packed tuple : foo(*args)
$ptupleDict = {
    __class__:$type,
    __name__:'packed tuple',
    toString:function(){return 'ptuple'}
}
$ptupleDict.$dict = $ptupleDict

function $ptuple(arg){
    return {
        __class__:$ptupleDict,
        arg:arg
    }
}
$ptuple.$dict = $ptupleDict
$ptupleDict.$factory = $ptuple

// packed dict : foo(**kw)
$pdictDict = {
    __class__ : $type,
    __name__:'packed dict'
}
$pdictDict.$dict = $pdictDict

function $pdict(arg){
    return {
        __class__:$pdictDict,
        arg:arg
    }
}
$pdict.$dict = $pdictDict
$pdict.$factory = $pdict

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
        for(var i=0;i<obj.$keys.length;i++){temp[obj.$keys[i]]=obj.$values[i]}
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
