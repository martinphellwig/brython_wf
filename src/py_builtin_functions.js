
// built-in functions
;(function($B){

$B.builtins.__debug__ = false
var __builtins__ = $B.builtins

// insert already defined builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = __builtins__.object.$dict

// maps comparison operator to method names
$B.$comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}

function abs(obj){
    if(isinstance(obj,__builtins__.int)){return __builtins__.int(Math.abs(obj))}
    else if(isinstance(obj,__builtins__.float)){return __builtins__.float(Math.abs(obj.value))}
    else if(hasattr(obj,'__abs__')){return getattr(obj,'__abs__')()}
    else{throw __builtins__.TypeError("Bad operand type for abs(): '"+$B.get_class(obj)+"'")}
}

function _alert(src){alert(__builtins__.str(src))}

function all(obj){
    var iterable = iter(obj)
    while(true){
        try{
            var elt = next(iterable)
            if(!bool(elt)){return False}
        }catch(err){return True}
    }
}

function any(obj){
    var iterable = iter(obj)
    while(true){
        try{
            var elt = next(iterable)
            if(bool(elt)){return True}
        }catch(err){return False}
    }
}

function ascii(obj) {
   // adapted from 
   // http://stackoverflow.com/questions/7499473/need-to-ecape-non-ascii-characters-in-javascript
    function padWithLeadingZeros(string,pad) {
        return new Array(pad+1-string.length).join("0") + string;
    }
    
    function charEscape(charCode) {
        if(charCode>255){return "\\u" + padWithLeadingZeros(charCode.toString(16),4)}
        else{return "\\x" + padWithLeadingZeros(charCode.toString(16),2)}
    }
    
    return obj.split("").map(function (char) {
             var charCode = char.charCodeAt(0);
             return charCode > 127 ? charEscape(charCode) : char;
         })
         .join("");
}

// not in Python but used for tests until unittest works
// "assert_raises(exception,function,*args)" becomes "if condition: pass else: raise AssertionError"
function assert_raises(){
    var $ns=$B.$MakeArgs('assert_raises',arguments,['exc','func'],[],'args','kw')
    var args = $ns['args']
    try{$ns['func'].apply(this,args)}
    catch(err){
        if(err.name!==$ns['exc']){
            throw AssertionError(
                "exception raised '"+err.name+"', expected '"+$ns['exc']+"'")
        }
        return
    }
    throw AssertionError("no exception raised, expected '"+$ns['exc']+"'")
}

// used by bin, hex and oct functions
function $builtin_base_convert_helper(obj, base) {
  var value;
  if (isinstance(obj, __builtins__.int)) {
     value=obj;
  } else if (obj.__index__ !== undefined) {
     value=obj.__index__()
  }
  if (value === undefined) {
     // need to raise an error
     throw __builtins__.TypeError('Error, argument must be an integer or contains an __index__ function')
     return
  }
  var prefix = "";
  if (base == 8) { prefix = "0o" }
  else if (base == 16) { prefix = '0x' }
  else if (base == 2) { prefix = '0b' }
  else {
    // FIXME : Choose better prefix
    prefix = ''
  }
  if (value >=0) { 
     return prefix + value.toString(base);
  } else {
    return '-' + prefix + (-value).toString(base);
  }
}

// bin() (built in function)
function bin(obj) { 
   return $builtin_base_convert_helper(obj, 2)
}

function bool(obj){ // return true or false
    if(obj===null){return False}
    else if(obj===undefined){return False}
    else if(typeof obj==="boolean"){return obj}
    else if(typeof obj==="number" || typeof obj==="string"){
        if(obj){return true}else{return false}
    }else{
        try{return getattr(obj,'__bool__')()}
        catch(err){
            $B.$pop_exc()
            try{return getattr(obj,'__len__')()>0}
            catch(err){$B.$pop_exc();return true}
        }
    }
}
bool.__class__ = $B.$type
bool.__mro__ = [bool,object]
bool.__name__ = 'bool'
bool.__str__ = function(){return "<class 'bool'>"}
bool.toString = bool.__str__
bool.__hash__ = function() {
    if(this.valueOf()) return 1
    return 0
}

//bytearray() (built in function)
var $BytearrayDict = {__class__:$B.$type,__name__:'bytearray'}

var $bytearray_iterator = $B.$iterator_class('bytearray_iterator')
$BytearrayDict.__iter__ = function(self){
    return $B.$iterator(self.source,$bytearray_iterator)
}
$BytearrayDict.__mro__ = [$BytearrayDict,$ObjectDict]

function bytearray(source, encoding, errors) {
  return {__class__:$BytearrayDict,source:source} // XXX fix me
}
bytearray.__class__=$B.$factory
bytearray.$dict = $BytearrayDict
$BytearrayDict.$factory = bytearray

//bytes() (built in function)
var $BytesDict = {
    __class__ : $B.$type,
    __name__ : 'bytes'
}

var $bytes_iterator = $B.$iterator_class('bytes_iterator')
$BytesDict.__iter__ = function(self){
    return $B.$iterator(self.source,$bytes_iterator)
}

// borrowed from py_string.js.
$BytesDict.__getitem__ = function(self,arg){
    var i
    if(isinstance(arg,__builtins__.int)){
        var pos = arg
        if(arg<0){pos=self.source.length+pos}
        if(pos>=0 && pos<self.source.length){return self.source.charAt(pos)}
        else{throw __builtins__.IndexError('byte index out of range')}
    } else if(isinstance(arg,slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? getattr(self.source,'__len__')() : arg.stop
        }else{
            var start = arg.start===None ? 
           getattr(self.source,'__len__')()-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0){start=self.source.length+start}
        if(stop<0){stop=self.source.length+stop}
        var res = '',i=null
        if(step>0){
            if(stop<=start){return ''}
            else {
                for(i=start;i<stop;i+=step){
                    res += self.source.charAt(i)
                }
            }
        } else {
            if(stop>=start){return ''}
            else {
                for(i=start;i>=stop;i+=step){
                    res += self.source.charAt(i)
                }
            }
        }
        return res
    } else if(isinstance(arg,bool)){
        return self.source.__getitem__(__builtins__.int(arg))
    }
}

$BytesDict.__len__ = function(self){return self.source.length}

$BytesDict.__mro__ = [$BytesDict,$ObjectDict]

$BytesDict.__repr__ = $BytesDict.__str__ = function(self){return self.source}

$BytesDict.decode = function(self){return repr(self)} // fix ?

$BytesDict.maketrans=function(from, to) {
   var _t=[]
   // make 'default' translate table
   for(var i=0; i < 256; i++) {
      _t[i]=String.fromCharCode(i)
   }

   // make substitution in the translation table
   for(var i=0; i < from.source.length; i++) {
      var _ndx=from.source[i].charCodeAt(0)     //retrieve ascii code of char
      _t[_ndx]=to.source[i]
   }

   // create a data structure that string.translate understands
   var _d=__BRYTHON__.$dict()
   for(var i=0; i < 256; i++) {
      _d.$keys.push(i)
      _d.$values.push(_t[i])
   }

   return _d
}

$BytesDict.translate = function(self,table) {
    var res = ''
    if (isinstance(table, __builtins__.dict)) {
       for (var i=0; i<self.source.length; i++) {
           var repl = __builtins__.dict.$dict.get(table,self.source.charCodeAt(i),-1)
           if(repl==-1){res += self.source.charAt(i)}
           else if(repl!==None){res += repl}
       }
    }
    return res
}

function bytes(source, encoding, errors) {
    return {
        __class__:$BytesDict,
        source:source,
        encoding:encoding,
        errors:errors
    }
}

bytes.__class__ = $B.$factory
bytes.$dict = $BytesDict
$BytesDict.$factory = bytes

//callable() (built in function)
function callable(obj) {
  return hasattr(obj,'__call__')
}

//chr() (built in function)
function chr(i) {
  if (i < 0 || i > 1114111) { Exception('ValueError', 'Outside valid range')}

  return String.fromCharCode(i)
}

//classmethod() (built in function)
var $ClassmethodDict = {__class__:$B.$type,__name__:'classmethod'}
$ClassmethodDict.__mro__=[$ClassmethodDict,$ObjectDict]
function classmethod(klass,func) {
    // the first argument klass is added by py2js in $CallCtx
    func.$type = 'classmethod'
    return func
}
classmethod.__class__=$B.$factory
classmethod.$dict = $ClassmethodDict
$ClassmethodDict.$factory = classmethod
function $class(obj,info){
    this.obj = obj
    this.__name__ = info
    this.__class__ = $B.$type
    this.__mro__ = [this,$ObjectDict]
}

//compile() (built in function)
function compile(source, filename, mode) {
    //for now ignore mode variable, and flags, etc
    return source
    return $B.py2js(source, filename).to_js()
}

//function complex is located in py_complex.js

//delattr() (built in function)
function delattr(obj, attr) {
    // descriptor protocol : if obj has attribute attr and this attribute has 
    // a method __delete__(), use it
    var klass = $B.get_class(obj)
    var res = obj[attr]
    if(res===undefined){
        var mro = klass.__mro__
        for(var i=0;i<mro.length;i++){
            var res = mro[i][attr]
            if(res!==undefined){break}
        }
    }
    if(res!==undefined && res.__delete__!==undefined){
        return res.__delete__(res,obj,attr)
    }
    getattr(obj,'__delattr__')(attr)
}

function dir(obj){
    if(obj===null){
        // if dir is called without arguments, the parser transforms dir() into
        // dir(null,module_name)
        var mod_name=arguments[1]
        var res = [],$globals = $B.vars[mod_name]
        for(var attr in $globals){res.push(attr)}
        return res
    }
    if(isinstance(obj,$B.JSObject)){obj=obj.js}
    if($B.get_class(obj).is_class){obj=obj.$dict}
    else {
        // We first look if the object has the __dir__ method
        try {
            var res = getattr(obj, '__dir__')()
            res = $B.builtins.list(res)
            res.sort()
            return res
        } catch (err){$B.$pop_exc()}
    }
    var res = []
    for(var attr in obj){
        if(attr.charAt(0)!=='$' && attr!=='__class__'){
            res.push(attr)
        }
    }
    res.sort()
    return res
}

//divmod() (built in function)
function divmod(x,y) {
    var klass = $B.get_class(x)
    return [klass.__floordiv__(x,y),
        klass.__mod__(x,y)]
}

var $EnumerateDict = {__class__:$B.$type,__name__:'enumerate'}
$EnumerateDict.__mro__ = [$EnumerateDict,$ObjectDict]

function enumerate(){
    var _start = 0
    var $ns = $B.$MakeArgs("enumerate",arguments,["iterable"],
                ["start"], null, null)
    var _iter = iter($ns["iterable"])
    var _start = $ns["start"] || _start
    var res = {
        __class__:$EnumerateDict,
        __getattr__:function(attr){return res[attr]},
        __iter__:function(){return res},
        __name__:'enumerate iterator',
        __next__:function(){
            res.counter++
            return __builtins__.tuple([res.counter,next(_iter)])
        },
        __repr__:function(){return "<enumerate object>"},
        __str__:function(){return "<enumerate object>"},
        counter:_start-1
    }
    for(var attr in res){
        if(typeof res[attr]==='function' && attr!=="__class__"){
            res[attr].__str__=(function(x){
                return function(){return "<method wrapper '"+x+"' of enumerate object>"}
            })(attr)
        }
    }
    return res
}
enumerate.__class__ = $B.$factory
enumerate.$dict = $EnumerateDict
$EnumerateDict.$factory = enumerate

//eval() (built in function)

//exec() (built in function)

var $FilterDict = {__class__:$B.$type,__name__:'filter'}
$FilterDict.__iter__ = function(self){return self}
$FilterDict.__repr__ = $FilterDict.__str__ = function(){return "<filter object>"},
$FilterDict.__mro__ = [$FilterDict,$ObjectDict]

function filter(){
    if(arguments.length!=2){throw __builtins__.TypeError(
            "filter expected 2 arguments, got "+arguments.length)}
    var func=arguments[0],iterable=iter(arguments[1])
    if(func === __builtins__.None) {
        func = __builtins__.bool
    }
    var __next__ = function() {
        while(true){
            try {
                var _item = next(iterable)
                if (func(_item)){return _item}
            }catch(err){
                if(err.__name__==='StopIteration'){$B.$pop_exc();throw __builtins__.StopIteration('')}
                else{throw err}
            }
        }
    }
    return {
        __class__: $FilterDict,
        __next__: __next__
    }
}


function format(value, format_spec) {
  if(hasattr(value, '__format__')) {
    return value.__format__(format_spec)
  } 
  
  throw __builtins__.NotImplementedError("__format__ is not implemented for object '" + str(value) + "'")
}

function getattr(obj,attr,_default){
    var klass = $B.get_class(obj)
    //if(attr=='alert'){console.log('-- getattr '+attr+' of obj '+obj+' native '+klass.$native)}
    if(klass===undefined){
        // for native JS objects used in Python code
        if(obj[attr]!==undefined){return obj[attr]}
        else if(_default!==undefined){return _default}
        else{throw __builtins__.AttributeError('object has no attribute '+attr)}
    }

    // attribute __class__ is set for all Python objects
    if(attr=='__class__'){
        // return the factory function
        return klass.$factory
    }
    
    // attribute __dict__ returns a dictionary of all attributes
    // of the underlying Javascript object
    if(attr==='__dict__'){
        var res = __builtins__.dict()
        for(var $attr in obj){
            if($attr.charAt(0)!='$'){
                res.$keys.push($attr)
                res.$values.push(obj[$attr])
            }
        }
        return res
    }
    
    // __call__ on a function returns the function itself
    if(attr==='__call__' && (typeof obj=='function')){
        if($B.debug>0){
            return function(){
                $B.call_stack.push($B.line_info)
                try{
                    var res = obj.apply(null,arguments)
                    if(res===undefined){return __builtins__.None}else{return res}
                }catch(err){throw err}
                finally{$B.call_stack.pop()}
            }
        }
        return function(){
            var res = obj.apply(null,arguments)
            if(res===undefined){return __builtins__.None}else{return res}
        }
    }
    //if(attr=='__str__'){console.log('attr '+attr+' klass '+klass)}
    
    if(klass.$native){
        if(klass[attr]===undefined){
            if(_default===undefined){
                throw __builtins__.AttributeError(klass.__name__+" object has no attribute '"+attr+"'")
            }else{return _default}
        }
        if(typeof klass[attr]=='function'){
            if(attr=='__new__'){ // new is a static method
                return klass[attr].apply(null,arguments)
            }else{
                var method = function(){
                    var args = [obj]
                    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                    return klass[attr].apply(null,args)
                }
                method.__name__ = 'method '+attr+' of built-in '+klass.__name__
                return method
            }
        }
        return klass[attr]
    }

    var is_class = klass.is_class, mro, attr_func
    //if(attr=='__repr__'){console.log('getattr '+attr+' of '+obj+' ('+obj.__class__+') '+' class '+is_class)}
    if(is_class){
        attr_func=$B.$type.__getattribute__
        if(obj.$dict===undefined){console.log('obj '+obj+' $dict undefined')}
        obj=obj.$dict
    }else{
        var mro = klass.__mro__
        if(mro===undefined){
            console.log('in getattr '+attr+' mro undefined for '+obj+' dir '+dir(obj)+' class '+obj.__class__)
            for(var _attr in obj){
                console.log('obj attr '+_attr+' : '+obj[_attr])
            }
            console.log('obj class '+dir(klass)+' str '+klass)
        }
        for(var i=0;i<mro.length;i++){
            attr_func = mro[i]['__getattribute__']
            if(attr_func!==undefined){break}
        }
    }
    if(typeof attr_func!=='function'){
        console.log(attr+' is not a function '+attr_func)
    }
    var res = attr_func(obj,attr)
    if(res!==undefined){return res}
    if(_default !==undefined){return _default}
    else{
        throw __builtins__.AttributeError("'"+klass.__name__+"' object has no attribute '"+attr+"'")
    }
}
getattr.__name__ = 'getattr'

//globals() (built in function)
function globals(module){
    // the translation engine adds the argument module
    var res = __builtins__.dict()
    var scope = $B.vars[module]
    for(var name in scope){res.$keys.push(name);res.$values.push(scope[name])}
    return res
}

function hasattr(obj,attr){
    try{getattr(obj,attr);return True}
    catch(err){$B.$pop_exc();return False}
}

function hash(obj){
    if (isinstance(obj, __builtins__.int)) { return obj.valueOf();}
    if (isinstance(obj, bool)) { return __builtins__.int(obj);}
    if (obj.__hashvalue__ !== undefined) { return obj.__hashvalue__;}
    if (obj.__hash__ !== undefined) {
       obj.__hashvalue__=obj.__hash__()
       return obj.__hashvalue__
    } else {
       throw __builtins__.AttributeError(
        "'"+__builtins__.str(obj.__class__)+"' object has no attribute '__hash__'")
    }
}

function help(obj){
    if(typeof obj=='string'){
      __BRYTHON__.$import("pydoc");
      var pydoc=__BRYTHON__.vars["pydoc"]
      getattr(getattr(pydoc,"help"),"__call__")(obj)
      return
    }
    if(typeof obj=='string'){
        try{var obj = eval(obj)}
        catch(err){throw NameError("name '"+obj+"' is not defined")}
    }
    try{return getattr(obj,'__doc__')}
    catch(err){console.log('help err '+err);return ''}
}

//hex() (built in function)
function hex(x) {
   return $builtin_base_convert_helper(x, 16)
}

//id() (built in function)
function id(obj) {
   if (obj.__hashvalue__ !== undefined) {
      return obj.__hashvalue__
   }
   if (obj.__hash__ === undefined || isinstance(obj, set) ||
      isinstance(obj, __builtins__.list) || isinstance(obj, __builtins__.dict)) {
      $B.$py_next_hash+=1
      obj.__hashvalue__=$B.$py_next_hash
      return obj.__hashvalue__
   }
   if (obj.__hash__ !== undefined) {
      return obj.__hash__()
   }
   return null
}

function __import__(mod_name){
    $B.$import(mod_name)
    return $B.imported[mod_name]
}
//not a direct alias of prompt: input has no default value
function input(src){
    return prompt(src)
}

function isinstance(obj,arg){
    if(obj===null){return arg===None}
    if(obj===undefined){return false}
    if(arg.constructor===Array){
        for(var i=0;i<arg.length;i++){
            if(isinstance(obj,arg[i])){return true}
        }
        return false
    }else{
        var klass = $B.get_class(obj)
        if(arg===__builtins__.int){
            return ((typeof obj)=="number"||obj.constructor===Number)&&(obj.valueOf()%1===0)
        }
        if(arg===__builtins__.float){
            return ((typeof obj=="number" && obj.valueOf()%1!==0))||
                (klass===__builtins__.float.$dict)
        }
        if(arg===__builtins__.str){return (typeof obj=="string"||klass===__builtins__.str)}
        if(arg===__builtins__.list){return (obj.constructor===Array)}
        if(klass!==undefined){
            // arg is the class constructor ; the attribute __class__ is the 
            // class dictionary, ie arg.$dict
            if(klass.__mro__===undefined){console.log('mro undef for '+klass+' '+dir(klass)+'\n arg '+arg)}
            for(var i=0;i<klass.__mro__.length;i++){
                if(klass.__mro__[i]===arg.$dict){return true}
            }
            return false
        }
        return obj.constructor===arg
    }
}

function issubclass(klass,classinfo){
    if(arguments.length!==2){
        throw __builtins__.TypeError("issubclass expected 2 arguments, got "+arguments.length)
    }
    if(!klass.__class__ || !klass.__class__.is_class){
        throw __builtins__.TypeError("issubclass() arg 1 must be a class")
    }
    if(isinstance(classinfo,__builtins__.tuple)){
        for(var i=0;i<classinfo.length;i++){
            if(issubclass(klass,classinfo[i])){return true}
        }
        return false
    }else if(classinfo.__class__.is_class){
        var res = klass.$dict.__mro__.indexOf(classinfo.$dict)>-1    
        return res
    }else{
        //console.log('error in is_subclass '+klass.$dict.__name+' classinfo '+__builtins__.str(classinfo))
        throw __builtins__.TypeError("issubclass() arg 2 must be a class or tuple of classes")
    }
}

function iter(obj){
    try{return getattr(obj,'__iter__')()}
    catch(err){
        $B.$pop_exc()
        throw __builtins__.TypeError("'"+$B.get_class(obj).__name__+"' object is not iterable")
    }
}

function len(obj){
    try{return getattr(obj,'__len__')()}
    catch(err){
        throw __builtins__.TypeError("object of type '"+$B.get_class(obj).__name__+"' has no len()")}
}

// list built in function is defined in py_list

function locals(obj_id,module){
    // used for locals() ; the translation engine adds the argument obj,
    // a dictionary mapping local variable names to their values, and the
    // module name
    if($B.vars[obj_id]===undefined){
        return globals(module)
    }
    var res = __builtins__.dict()
    var scope = $B.vars[obj_id]
    for(var name in scope){__builtins__.dict.$dict.__setitem__(res,name,scope[name])}
    return res
}

var $MapDict = {__class__:$B.$type,__name__:'map'}
$MapDict.__mro__ = [$MapDict,$ObjectDict]
$MapDict.__iter__ = function (self){return self}

function map(){
    var func = arguments[0]
    var iter_args = []
    for(var i=1;i<arguments.length;i++){iter_args.push(iter(arguments[i]))}
    var __next__ = function(){
        var args = []
        for(var i=0;i<iter_args.length;i++){
            try{
                var x = next(iter_args[i])
                args.push(x)
            }catch(err){
                if(err.__name__==='StopIteration'){
                    $B.$pop_exc();throw __builtins__.StopIteration('')
                }else{throw err}
            }
        }
        return func.apply(null,args)
    }
    var obj = {
        __class__:$MapDict,
        __repr__:function(){return "<map object>"},
        __str__:function(){return "<map object>"},
        __next__: __next__
    }
    return obj
}

function $extreme(args,op){ // used by min() and max()
    if(op==='__gt__'){var $op_name = "max"}
    else{var $op_name = "min"}
    if(args.length==0){throw __builtins__.TypeError($op_name+" expected 1 argument, got 0")}
    var last_arg = args[args.length-1]
    var last_i = args.length-1
    var has_key = false
    if(isinstance(last_arg,$B.$Kw)){
        if(last_arg.name === 'key'){
            var func = last_arg.value
            has_key = true
            last_i--
        }else{throw __builtins__.TypeError($op_name+"() got an unexpected keyword argument")}
    }else{var func = function(x){return x}}
    if((has_key && args.length==2)||(!has_key && args.length==1)){
        var arg = args[0]
        var $iter = iter(arg)
        var res = null
        while(true){
            try{
                var x = next($iter)
                if(res===null || bool(getattr(func(x),op)(func(res)))){res = x}
            }catch(err){
                if(err.__name__=="StopIteration"){return res}
                throw err
            }
        }
    } else {
        var res = null
        for(var i=0;i<=last_i;i++){
            var x = args[i]
            if(res===null || bool(getattr(func(x),op)(func(res)))){res = x}
        }
        return res
    }
}

function max(){
    var args = []
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    return $extreme(args,'__gt__')
}

// memoryview()  (built in function)
function memoryview(obj) {
  throw NotImplementedError('memoryview is not implemented')
}

function min(){
    var args = []
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    return $extreme(args,'__lt__')
}

function next(obj){
    var ga = getattr(obj,'__next__')
    if(ga!==undefined){return ga()}
    throw __builtins__.TypeError("'"+$B.get_class(obj).__name__+"' object is not an iterator")
}

var $NotImplementedDict = {__class__:$B.$type,__name__:'NotImplementedType'}
$NotImplementedDict.__mro__ = [$NotImplementedDict,$ObjectDict]
$NotImplementedDict.__repr__ = $NotImplementedDict.__str__ = function(){return 'NotImplemented'}

var NotImplemented = {
    __class__ : $NotImplementedDict,
}
    
function $not(obj){return !bool(obj)}

// oct() (built in function)
function oct(x) {
   return $builtin_base_convert_helper(x, 8)
}

function ord(c) {
    return c.charCodeAt(0)
}

// pow() (built in function)
function pow() {
    var $ns=$B.$MakeArgs('pow',arguments,[],[],'args','kw')
    var args = $ns['args']
    if(args.length<2){throw __builtins__.TypeError(
        "pow expected at least 2 arguments, got "+args.length)
    }
    if(args.length>3){throw __builtins__.TypeError(
        "pow expected at most 3 arguments, got "+args.length)
    }
    if(args.length === 2){
        var x = args[0]
        var y = args[1]
        var a,b
        if(isinstance(x, __builtins__.float)){
          a=x.value
        } else if(isinstance(x, __builtins__.int)){
          a=x
        } else {
          throw __builtins__.TypeError("unsupported operand type(s) for ** or pow()")
        }

        if (isinstance(y, __builtins__.float)){
           b=y.value
        } else if (isinstance(y, __builtins__.int)){
           b=y
        } else {
          throw __builtins__.TypeError("unsupported operand type(s) for ** or pow()")
        }
        return Math.pow(a,b)
    }

    if(args.length === 3){
        var x = args[0]
        var y = args[1]
        var z = args[2]
        var a,b,c
        if (isinstance(x, __builtins__.int)) {a=x} else {throw __builtins__.TypeError(
            "pow() 3rd argument not allowed unless all arguments are integers")}
        if (isinstance(y, __builtins__.int)) {b=y} else {throw __builtins__.TypeError(
            "pow() 3rd argument not allowed unless all arguments are integers")}
        if (isinstance(z, __builtins__.int)) {c=z} else {throw __builtins__.TypeError(
            "pow() 3rd argument not allowed unless all arguments are integers")}
        return Math.pow(a,b)%c
    }
}

function $print(){
    var end='\n',sep=' '
    var $ns=$B.$MakeArgs('print',arguments,[],['end','sep'],'args', null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
    var res = ''
    for(var i=0;i<args.length;i++){
        res += __builtins__.str(args[i])
        if(i<args.length-1){res += sep}
    }
    res += end
    getattr($B.stdout,'write')(res)
}
$print.__name__ = 'print'

function $prompt(text,fill){return prompt(text,fill || '')}

// property (built in function)
var $PropertyDict = {
    __class__ : $B.$type,
    __name__ : 'property',
    __repr__ : function(){return "<property object>"},
    __str__ : function(){return "<property object>"},
    toString : function(){return "property"}
}
$PropertyDict.__mro__ = [$PropertyDict,$ObjectDict]

function property(fget, fset, fdel, doc) {
    var p = {
        __class__ : $PropertyDict,
        __doc__ : doc || "",
        $type:fget.$type,
        fget:fget,
        fset:fset,
        fdel:fdel,
        toString:function(){return '<property>'}
    }
    p.__get__ = function(self,obj,objtype) {
        if(obj===undefined){return self}
        if(self.fget===undefined){throw __builtins__.AttributeError("unreadable attribute")}
        return getattr(self.fget,'__call__')(obj)
    }
    if(fset!==undefined){
        p.__set__ = function(self,obj,value){
            if(self.fset===undefined){throw __builtins__.AttributeError("can't set attribute")}
            getattr(self.fset,'__call__')(obj,value)
        }
    }
    p.__delete__ = fdel;

    p.getter = function(fget){
        return property(fget, p.fset, p.fdel, p.__doc__)
    }
    p.setter = function(fset){
        return property(p.fget, fset, p.fdel, p.__doc__)
    }
    p.deleter = function(fdel){
        return property(p.fget, p.fset, fdel, p.__doc__)
    }
    return p
}

property.__class__ = $B.$factory
property.$dict = $PropertyDict

// range
var $RangeDict = {__class__:$B.$type,__name__:'range',$native:true}

$RangeDict.__contains__ = function(self,other){
    var x = iter(self)
    while(true){
        try{
            var y = $RangeDict.__next__(x)
            if(getattr(y,'__eq__')(other)){return true}
        }catch(err){return false}
    }
    return false
}

$RangeDict.__getitem__ = function(self,rank){
    var res = self.start + rank*self.step
    if((self.step>0 && res >= self.stop) ||
        (self.step<0 && res < self.stop)){
            throw __builtins__.IndexError('range object index out of range')
    }
    return res   
}

$RangeDict.__iter__ = function(self){
    self.$counter=self.start-self.step
    return self
}

$RangeDict.__len__ = function(self){
    if(self.step>0){return 1+__builtins__.int((self.stop-1-self.start)/self.step)}
    else{return 1+__builtins__.int((self.start-1-self.stop)/-self.step)}
}

$RangeDict.__next__ = function(self){
    self.$counter += self.step
    if((self.step>0 && self.$counter >= self.stop)
        || (self.step<0 && self.$counter <= self.stop)){
            throw __builtins__.StopIteration('')
    }
    return self.$counter
}

$RangeDict.__mro__ = [$RangeDict,$ObjectDict]

$RangeDict.__reversed__ = function(self){
    return range(self.stop-1,self.start-1,-self.step)
}

$RangeDict.__repr__ = $RangeDict.__str__ = function(self){
    var res = 'range('+self.start+', '+self.stop
    if(self.step!=1){res += ', '+self.step}
    return res+')'
}

function range(){
    var $ns=$B.$MakeArgs('range',arguments,[],[],'args',null)
    var args = $ns['args']
    if(args.length>3){throw __builtins__.TypeError(
        "range expected at most 3 arguments, got "+args.length)
    }
    var start=0
    var stop=0
    var step=1
    if(args.length==1){stop = args[0]}
    else if(args.length>=2){
        start = args[0]
        stop = args[1]
    }
    if(args.length>=3){step=args[2]}
    if(step==0){throw __builtins__.ValueError("range() arg 3 must not be zero")}
    var res = {
        __class__ : $RangeDict,
        start:start,
        stop:stop,
        step:step
    }
    res.__repr__ = res.__str__ = function(){
            return 'range('+start+','+stop+(args.length>=3 ? ','+step : '')+')'
        }
    return res
}
range.__class__ = $B.$factory
range.$dict = $RangeDict
$RangeDict.$factory = range

function repr(obj){
    var func = getattr(obj,'__repr__')
    if(func!==undefined){return func()}
    else{throw __builtins__.AttributeError("object has no attribute __repr__")}
}

var $ReversedDict = {__class__:$B.$type,__name__:'reversed'}
$ReversedDict.__mro__ = [$ReversedDict,$ObjectDict]
$ReversedDict.__iter__ = function(self){return self}
$ReversedDict.__next__ = function(self){
    self.$counter--
    if(self.$counter<0){throw __builtins__.StopIteration('')}
    return self.getter(self.$counter)
}

function reversed(seq){
    // Return a reverse iterator. seq must be an object which has a 
    // __reversed__() method or supports the sequence protocol (the __len__() 
    // method and the __getitem__() method with integer arguments starting at 
    // 0).

    try{return getattr(seq,'__reversed__')()}
    catch(err){
        if(err.__name__=='AttributeError'){$B.$pop_exc()}
        else{throw err}
    }

    try{
        var res = {
            __class__:$ReversedDict,
            $counter : getattr(seq,'__len__')(),
            getter:getattr(seq,'__getitem__')
        }
        return res
    }catch(err){
        throw __builtins__.TypeError("argument to reversed() must be a sequence")
    }
}
reversed.__class__=$B.$factory
reversed.$dict = $ReversedDict
$ReversedDict.$factory = reversed

function round(arg,n){
    if(!isinstance(arg,[__builtins__.int,__builtins__.float])){
        throw __builtins__.TypeError("type "+arg.__class__+" doesn't define __round__ method")
    }
    if(n===undefined){
        return __builtins__.int(arg)
    }
    if(!isinstance(n,__builtins__.int)){throw __builtins__.TypeError(
        "'"+n.__class__+"' object cannot be interpreted as an integer")}
    var mult = Math.pow(10,n)
    var res =__builtins__.int.$dict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult)
    return res
}


function setattr(obj,attr,value){
    if(!isinstance(attr,__builtins__.str)){throw __builtins__.TypeError("setattr(): attribute name must be string")}
    // descriptor protocol : if obj has attribute attr and this attribute has 
    // a method __set__(), use it
    if($B.forbidden.indexOf(attr)>-1){attr='$$'+attr}
    var res = obj[attr]
    if(res===undefined){
        var mro = $B.get_class(obj).__mro__
        for(var i=0;i<mro.length;i++){
            var res = mro[i][attr]
            if(res!==undefined){break}
        }
    }
    if(res!==undefined && res.__set__!==undefined){
        return res.__set__(res,obj,value)
    }
    
    try{var f = getattr(obj,'__setattr__')}
    catch(err){
        $B.$pop_exc()
        obj[attr]=value
        return
    }
    f(attr,value)
}

// slice
var $SliceDict = {__class__:$B.$type,
    __name__:'slice'
}
$SliceDict.__mro__ = [$SliceDict,$ObjectDict]

function slice(){
    var $ns=$B.$MakeArgs('slice',arguments,[],[],'args',null)
    var args = $ns['args']
    if(args.length>3){throw __builtins__.TypeError(
        "slice expected at most 3 arguments, got "+args.length)
    }
    var start=0
    var stop=0
    var step=1
    if(args.length==1){stop = args[0]}
    else if(args.length>=2){
        start = args[0]
        stop = args[1]
    }
    if(args.length>=3){step=args[2]}
    if(step==0){throw __builtins__.ValueError("slice step must not be zero")}
    var res = {
        __class__ : $SliceDict,
        start:start,
        stop:stop,
        step:step
    }
    res.__repr__ = res.__str__ = function(){
            return 'slice('+start+','+stop+(args.length>=3 ? ','+step : '')+')'
        }
    return res
}
slice.__class__ = $B.$factory
slice.$dict = $SliceDict
$SliceDict.$factory = slice

// sorted() built in function
function sorted () {
    var $ns=$B.$MakeArgs('sorted',arguments,['iterable'],[],null,'kw')
    if($ns['iterable']===undefined){throw __builtins__.TypeError("sorted expected 1 positional argument, got 0")}
    else{iterable=$ns['iterable']}
    var key = __builtins__.dict.$dict.get($ns['kw'],'key',None)
    var reverse = __builtins__.dict.$dict.get($ns['kw'],'reverse',false)
    var obj = []
    iterable = iter(iterable)
    while(true){
        try{obj.push(next(iterable))}
        catch(err){
            if(err.__name__==='StopIteration'){$B.$pop_exc();break}
            else{throw err}
        }
    }
    // pass arguments to list.sort()
    var args = [obj]
    if (key !== None) {args.push($B.$Kw('key',key))}
    if(reverse){args.push($B.$Kw('reverse',true))}
    __builtins__.list.$dict.sort.apply(null,args)
    return obj
}

// staticmethod() built in function
var $StaticmethodDict = {__class__:$B.$type,__name__:'staticmethod'}
$StaticmethodDict.__mro__ = [$StaticmethodDict,$ObjectDict]

function staticmethod(func) {
    func.$type = 'staticmethod'
    return func
}
staticmethod.__class__=$B.$factory
staticmethod.$dict = $StaticmethodDict
$StaticmethodDict.$factory = staticmethod

// str() defined in py_string.js

function sum(iterable,start){
    if(start===undefined){start=0}
    var res = start
    var iterable = iter(iterable)
    while(true){
        try{
            var _item = next(iterable)
            res = getattr(res,'__add__')(_item)
        }catch(err){
           if(err.__name__==='StopIteration'){$B.$pop_exc();break}
           else{throw err}
        }
    }
    return res
}

// super() built in function
var $SuperDict = {__class__:$B.$type,__name__:'super'}

$SuperDict.__getattribute__ = function(self,attr){
    var mro = self.__thisclass__.$dict.__mro__,res
    //console.log(''+$B.$type.__getattribute__(mro[1], attr))
    for(var i=1;i<mro.length;i++){ // start with 1 = ignores the class where super() is defined
        res = mro[i][attr]
        if(res!==undefined){
            // if super() is called with a second argument, the result is bound
            if(self.__self_class__!==None){
                var _args = [self.__self_class__]
                if(attr=='__new__'){_args=[]}
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        for(var i=0;i<arguments.length;i++){
                            local_args.push(arguments[i])
                        }
                        var x = res.apply(null,local_args)
                        if(x===undefined){return None}else{return x}
                    }})(_args)
                method.__class__ = {
                    __class__:$B.$type,
                    __name__:'method',
                    __mro__:[$ObjectDict]
                }
                method.__func__ = res
                method.__self__ = self
                return method
            }
            return res
        }
    }
    throw __builtins__.AttributeError("object 'super' has no attribute '"+attr+"'")
}

$SuperDict.__mro__ = [$SuperDict,$ObjectDict]

$SuperDict.__repr__ = $SuperDict.__str__ = function(self){return "<object 'super'>"}

function $$super(_type1,_type2){
    return {__class__:$SuperDict,
        __thisclass__:_type1,
        __self_class__:(_type2 || None)
    }
}
$$super.$dict = $SuperDict
$$super.__class__ = $B.$factory
$SuperDict.$factory = $$super

function $url_open(){
    // first argument is file : can be a string, or an instance of a DOM File object
    // other arguments : 
    // - mode can be 'r' (text, default) or 'rb' (binary)
    // - encoding if mode is 'rb'
    var mode = 'r',encoding='utf-8'
    var $ns=$B.$MakeArgs('open',arguments,['file'],['mode','encoding'],'args','kw')
    for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
    if(args.length>0){var mode=args[0]}
    if(args.length>1){var encoding=args[1]}
    if(isinstance(file,$B.JSObject)){return new $OpenFile(file.js,mode,encoding)}
    else if(isinstance(file,__builtins__.str)){
        // read the file content and return an object with file object methods
        if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            var req=new XMLHttpRequest();
        }else{// code for IE6, IE5
            var req=new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = function(){
            var status = req.status
            if(status===404){
                $res = __builtins__.IOError('File not found')
            }else if(status!==200){
                $res = __builtins__.IOError('Could not open file '+file+' : status '+status) 
            }else{
                $res = req.responseText
            }
        }
        // add fake query string to avoid caching
        var fake_qs = '?foo='+Math.random().toString(36).substr(2,8)
        req.open('GET',file+fake_qs,false)
        req.send()
        if($res.constructor===Error){throw $res}
        // return the file-like object
        var lines = $res.split('\n')
        var res = new Object(),counter=0
        res.closed=false
        // methods for the "with" keyword
        res.__enter__ = function(){return res}
        res.__exit__ = function(){return false}
        res.__getattr__ = function(attr){return res[attr]}
        res.__iter__ = function(){return iter(lines)}
        res.__len__ = function(){return lines.length}
        res.close = function(){res.closed = true}
        res.read = function(nb){
            if(res.closed){throw __builtins__.ValueError('I/O operation on closed file')}
            if(nb===undefined){return $res}
            else{
                counter+=nb
                return $res.substr(counter-nb,nb)
            }
        }
        res.readable = function(){return true}
        res.readline = function(limit){
            if(res.closed){throw __builtins__.ValueError('I/O operation on closed file')}
            var line = ''
            if(limit===undefined||limit===-1){limit=null}
            while(true){
                if(counter>=$res.length-1){break}
                else{
                    var car = $res.charAt(counter)
                    if(car=='\n'){counter++;return line}
                    else{
                        line += car
                        if(limit!==null && line.length>=limit){return line}
                        counter++
                    }
                }
            }
        }
        res.readlines = function(hint){
            if(res.closed){throw __builtins__.ValueError('I/O operation on closed file')}
            var x = $res.substr(counter).split('\n')
            if(hint && hint!==-1){
                var y=[],size=0
                while(true){
                    var z = x.shift()
                    y.push(z)
                    size += z.length
                    if(size>hint || x.length==0){return y}
                }
            }else{return x}
        }
        res.seek = function(offset,whence){
            if(res.closed){throw __builtins__.ValueError('I/O operation on closed file')}
            if(whence===undefined){whence=0}
            if(whence===0){counter = offset}
            else if(whence===1){counter += offset}
            else if(whence===2){counter = $res.length+offset}
        }
        res.seekable = function(){return true}
        res.tell = function(){return counter}
        res.writeable = function(){return false}
        return res
    }
}


var $ZipDict = {__class__:$B.$type,__name__:'zip'}

var $zip_iterator = $B.$iterator_class('zip_iterator')
$ZipDict.__iter__ = function(self){
    return $B.$iterator(self.items,$zip_iterator)
}

$ZipDict.__mro__ = [$ZipDict,$ObjectDict]

function zip(){
    var res = {__class__:$ZipDict,items:[]}
    if(arguments.length==0){return res}
    var $ns=$B.$MakeArgs('zip',arguments,[],[],'args','kw')
    var _args = $ns['args']
    var args = []
    for(var i=0;i<_args.length;i++){args.push(iter(_args[i]))}
    var kw = $ns['kw']
    var rank=0,items=[]
    while(true){
        var line=[],flag=true
        for(var i=0;i<args.length;i++){
            try{
                var x=next(args[i])
                line.push(x)
            }catch(err){
                if(err.__name__==='StopIteration'){$B.$pop_exc();flag=false;break}
                else{throw err}
            }
        }
        if(!flag){break}
        items.push(__builtins__.tuple(line))
        rank++
    }
    res.items = items
    return res
}
zip.__class__=$B.$factory
zip.$dict = $ZipDict
$ZipDict.$factory = zip

// built-in constants : True, False, None

var $BoolDict = $B.$BoolDict = {__class__:$B.$type,
    __name__:'bool',
    __repr__ : function(){return "<class 'bool'>"},
    __str__ : function(){return "<class 'bool'>"},
    toString : function(){return "<class 'bool'>"},
    $native:true
}
$BoolDict.__mro__ = [$BoolDict,$ObjectDict]
bool.__class__ = $B.$factory
bool.$dict = $BoolDict
$BoolDict.$factory = bool

$BoolDict.__add__ = function(self,other){
    if(self.valueOf()) return other + 1;
    return other;
}

// True and False are the same as Javascript true and false

var True = true
var False = false

$BoolDict.__eq__ = function(self,other){
    if(self.valueOf()){return !!other}else{return !other}
}

$BoolDict.__ne__ = function(self,other){
    if(self.valueOf()){return !other}else{return !!other}
}

$BoolDict.__ge__ = function(self,other){
    return __builtins__.int.$dict.__ge__($BoolDict.__hash__(self),other)
}

$BoolDict.__gt__ = function(self,other){
    return __builtins__.int.$dict.__gt__($BoolDict.__hash__(self),other)
}

$BoolDict.__hash__ = function(self) {
   if(self.valueOf()) return 1
   return 0
}

$BoolDict.__le__ = function(self,other){return !$BoolDict.__gt__(self,other)}

$BoolDict.__lt__ = function(self,other){return !$BoolDict.__ge__(self,other)}

$BoolDict.__mul__ = function(self,other){
    if(self.valueOf()) return other;
    return 0;
}

$BoolDict.__repr__ = $BoolDict.__str__ = function(self){
    if(self.valueOf()) return "True"
    return "False"
}

$BoolDict.__sub__ = function(self,other){
    if(self.valueOf()) return 1-other;
    return -other;
}


var $EllipsisDict = {__class__:$B.$type,
    __name__:'Ellipsis',
}
$EllipsisDict.__mro__ = [$ObjectDict]
$EllipsisDict.$factory = $EllipsisDict

var Ellipsis = {
    __bool__ : function(){return False},
    __class__ : $EllipsisDict,
    //__hash__ : function(){return 0},
    __repr__ : function(){return 'Ellipsis'},
    __str__ : function(){return 'Ellipsis'},
    toString : function(){return 'Ellipsis'}
}

var $comp_ops = ['ge','gt','le','lt']
for(var $key in $B.$comps){ // Ellipsis is not orderable with any type
    if($comp_ops.indexOf($B.$comps[$key])>-1){
        Ellipsis['__'+$B.$comps[$key]+'__']=(function(k){
            return function(other){
            throw __builtins__.TypeError("unorderable types: ellipsis() "+k+" "+
                other.__class__.__name__)}
        })($key)
    }
}

for(var $func in Ellipsis){
    if(typeof Ellipsis[$func]==='function'){
        Ellipsis[$func].__str__ = (function(f){
            return function(){return "<method-wrapper "+f+" of Ellipsis object>"}
        })($func)
    }
}

var $NoneDict = {__class__:$B.$type,__name__:'NoneType',}
$NoneDict.__mro__ = [$NoneDict,$ObjectDict]
$NoneDict.$factory = $NoneDict

var None = {
    __bool__ : function(){return False},
    __class__ : $NoneDict,
    __hash__ : function(){return 0},
    __repr__ : function(){return 'None'},
    __str__ : function(){return 'None'},
    toString : function(){return 'None'}
}

var $comp_ops = ['ge','gt','le','lt']
for(var $key in $B.$comps){ // None is not orderable with any type
    if($comp_ops.indexOf($B.$comps[$key])>-1){
        None['__'+$B.$comps[$key]+'__']=(function(k){
            return function(other){
            throw __builtins__.TypeError("unorderable types: NoneType() "+k+" "+
                $B.get_class(other).__name__)}
        })($key)
    }
}
for(var $func in None){
    if(typeof None[$func]==='function'){
        None[$func].__str__ = (function(f){
            return function(){return "<method-wrapper "+f+" of NoneType object>"}
        })($func)
    }
}

// add attributes to native Function
var $FunctionCodeDict = {__class__:$B.$type,__name__:'function code'}
var $FunctionGlobalsDict = {__class:$B.$type,__name__:'function globals'}

var $FunctionDict = $B.$FunctionDict = {
    __class__:$B.$type,
    __code__:{__class__:$FunctionCodeDict,__name__:'function code'},
    __globals__:{__class__:$FunctionGlobalsDict,__name__:'function globals'},
    __name__:'function'
}
$FunctionDict.__repr__=$FunctionDict.__str__ = function(self){return '<function type>'}

$FunctionDict.__mro__ = [$FunctionDict,$ObjectDict]
var $Function = function(){}
$FunctionDict.$factory = $Function
$Function.$dict = $FunctionDict

// built-in exceptions

__builtins__.$BaseExceptionDict = {
    __class__:$B.$type,
    __name__:'BaseException'
}

__builtins__.$BaseExceptionDict.__init__ = function(self){
    console.log(self.__class__.__name__+' '+arguments[1])
    self.msg = arguments[1]
}

__builtins__.$BaseExceptionDict.__repr__ = function(self){
    if(self.message===None){return self.__class__.__name__+'()'}
    return self.message
}
__builtins__.$BaseExceptionDict.__str__ = __builtins__.$BaseExceptionDict.__repr__

__builtins__.$BaseExceptionDict.__mro__ = [__builtins__.$BaseExceptionDict,$ObjectDict]

__builtins__.$BaseExceptionDict.__new__ = function(cls){
    var err = __builtins__.BaseException()
    err.__name__ = cls.$dict.__name__
    err.__class__ = cls.$dict
    return err
}

// class of traceback objects
var $TracebackDict = {__class__:$B.$type,
    __name__:'traceback',
    __mro__:[$ObjectDict]
}

// class of frame objects
var $FrameDict = {__class__:$B.$type,
    __name__:'frame',
    __mro__:[$ObjectDict]
}

var BaseException = function (msg,js_exc){
    var err = Error()
    err.info = 'Traceback (most recent call last):'
    if(msg===undefined){msg='BaseException'}
    var tb = None
    
    if($B.debug && !msg.info){
        if(js_exc!==undefined){
            for(var attr in js_exc){
                if(attr==='message'){continue}
                try{err.info += '\n    '+attr+' : '+js_exc[attr]}
                catch(_err){void(0)}
            }
            err.info+='\n'        
        }
        // call stack
        var last_info
        for(var i=0;i<$B.call_stack.length;i++){
            var call_info = $B.call_stack[i]
            var lib_module = call_info[1]
            var caller = $B.modules[lib_module].caller
            if(caller!==undefined){
                call_info = caller
                lib_module = caller[1]
            }
            if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
            var lines = __BRYTHON__.$py_src[call_info[1]].split('\n')
            err.info += '\n  module '+lib_module+' line '+call_info[0]
            var line = lines[call_info[0]-1]
            while(line && line.charAt(0)==' '){line=line.substr(1)}
            err.info += '\n    '+line
            last_info = call_info
            // create traceback object
            if(i==0){
                tb = {__class__:$TracebackDict,
                    tb_frame:{__class__:$FrameDict},
                    tb_lineno:call_info[0],
                    tb_lasti:line,
                    tb_next: None // fix me
                    }
            }
        }
        // error line
        var err_info = $B.line_info
        while(true){
            var mod = $B.modules[err_info[1]]
            if(mod===undefined){break}
            var caller = mod.caller
            if(caller===undefined){break}
            err_info = caller
        }
        if(err_info!==last_info){
            var module = err_info[1]
            var line_num = err_info[0]
            try{
            var lines = __BRYTHON__.$py_src[module].split('\n')
            }catch(err){console.log('--module '+module);throw err}
            var lib_module = module
            if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
            err.info += "\n  module "+lib_module+" line "+line_num
            var line = lines[line_num-1]
            while(line && line.charAt(0)==' '){line = line.substr(1)}
            err.info += '\n    '+line
            // create traceback object
            tb = {__class__:$TracebackDict,
                tb_frame:{__class__:$FrameDict},
                tb_lineno:line_num,
                tb_lasti:line,
                tb_next: None   // fix me
            }
        }
    }
    err.message = msg
    err.args = msg
    err.__name__ = 'BaseException'
    err.__class__ = __builtins__.$BaseExceptionDict
    err.py_error = true
    err.type = 'BaseException'
    err.value = msg
    err.traceback = tb
    $B.exception_stack.push(err)
    return err
}

BaseException.__name__ = 'BaseException'
BaseException.__class__ = $B.$factory
BaseException.$dict = __builtins__.$BaseExceptionDict

__builtins__.BaseException = BaseException

$B.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute py_error set 
    // or by the Javascript interpreter (ReferenceError for instance)
    if(js_exc.py_error && $B.debug>0){
        //console.log('$B.exception '+js_exc)
        //for(var attr in js_exc){console.log(attr+' '+js_exc[attr])}
        //console.log('line info '+__BRYTHON__.line_info)
    }
    if(!js_exc.py_error){
        if($B.debug>0 && js_exc.info===undefined){
            if($B.line_info!==undefined){
                var mod_name = $B.line_info[1]
                var module = $B.modules[mod_name]
                if(module){
                    if(module.caller!==undefined){
                        // for list comprehension and the likes, replace
                        // by the line in the enclosing module
                        $B.line_info = module.caller
                        var mod_name = $B.line_info[1]
                    }
                    var lib_module = mod_name
                    if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
                    var line_num = $B.line_info[0]
                    var lines = __BRYTHON__.$py_src[mod_name].split('\n')
                    js_exc.message += "\n  module '"+lib_module+"' line "+line_num
                    js_exc.message += '\n'+lines[line_num-1]
                    js_exc.info_in_msg = true
                }
            }else{
                console.log('error '+js_exc)
            }
        }
        var exc = Error()
        exc.__name__ = js_exc.__name__ || js_exc.name
        exc.__class__ = __builtins__.$ExceptionDict
        if(js_exc.name=='ReferenceError'){
            exc.__name__='NameError'
            exc.__class__=__builtins__.$NameErrorDict
        }
        exc.message = js_exc.message
        exc.info = ''
    }else{
        var exc = js_exc
    }
    $B.exception_stack.push(exc)
    return exc
}

$B.is_exc=function(exc,exc_list){
    // used in try/except to check if an exception is an instance of
    // one of the classes in exc_list
    if(exc.__class__===undefined){
        exc = $B.exception(exc)
    }
    var exc_class = exc.__class__.$factory
    for(var i=0;i<exc_list.length;i++){
        if(issubclass(exc_class,exc_list[i])){return true}
    }
    return false
}

function $make_exc(names,parent){
    // create a class for exception called "name"
    for(var i=0;i<names.length;i++){
        var name = names[i]
        var $exc = (BaseException+'').replace(/BaseException/g,name)
        // class dictionary
        eval('__builtins__.$'+name+'Dict={__class__:$B.$type,__name__:"'+name+'"}')
        eval('__builtins__.$'+name+'Dict.__mro__=[__builtins__.$'+name+'Dict].concat(parent.$dict.__mro__)')
        // class constructor
        eval('__builtins__.'+name+'='+$exc)
        eval('__builtins__.'+name+'.__repr__ = function(){return "<class '+"'"+name+"'"+'>"}')
        eval('__builtins__.'+name+'.__str__ = function(){return "<class '+"'"+name+"'"+'>"}')
        eval('__builtins__.'+name+'.__class__=$B.$factory')
        eval('__builtins__.$'+name+'Dict.$factory=__builtins__.'+name)
        eval('__builtins__.'+name+'.$dict=__builtins__.$'+name+'Dict')
    }
}

$make_exc(['SystemExit','KeyboardInterrupt','GeneratorExit','Exception'],BaseException)
$make_exc(['StopIteration','ArithmeticError','AssertionError','AttributeError',
    'BufferError','EOFError','ImportError','LookupError','MemoryError',
    'NameError','OSError','ReferenceError','RuntimeError','SyntaxError',
    'SystemError','TypeError','ValueError','Warning'],__builtins__.Exception)
$make_exc(['FloatingPointError','OverflowError','ZeroDivisionError'],
    __builtins__.ArithmeticError)
$make_exc(['IndexError','KeyError'],__builtins__.LookupError)
$make_exc(['UnboundLocalError'],__builtins__.NameError)
$make_exc(['BlockingIOError','ChildProcessError','ConnectionError',
    'FileExistsError','FileNotFoundError','InterruptedError',
    'IsADirectoryError','NotADirectoryError','PermissionError',
    'ProcessLookupError','TimeoutError'],__builtins__.OSError)
$make_exc(['BrokenPipeError','ConnectionAbortedError','ConnectionRefusedError',
    'ConnectionResetError'],__builtins__.ConnectionError)
$make_exc(['NotImplementedError'],__builtins__.RuntimeError)
$make_exc(['IndentationError'],__builtins__.SyntaxError)
$make_exc(['TabError'],__builtins__.IndentationError)
$make_exc(['UnicodeError'],__builtins__.ValueError)
$make_exc(['UnicodeDecodeError','UnicodeEncodeError','UnicodeTranslateError'],
    __builtins__.UnicodeError)
$make_exc(['DeprecationWarning','PendingDeprecationWarning','RuntimeWarning',
    'SyntaxWarning','UserWarning','FutureWarning','ImportWarning',
    'UnicodeWarning','BytesWarning','ResourceWarning'],__builtins__.Warning)

$make_exc(['EnvironmentError','IOError','VMSError','WindowsError'],__builtins__.OSError)

var builtin_names=[ 'Ellipsis', 'False',  'None', 
'True', '_', '__build_class__', '__debug__', '__doc__', '__import__', '__name__', 
'__package__', 'abs', 'all', 'any', 'ascii', 'bin', 'bool', 'bytearray', 'bytes',
'callable', 'chr', 'classmethod', 'compile', 'complex', 'copyright', 'credits',
'delattr', 'dict', 'dir', 'divmod', 'enumerate', //'eval', 
'exec', 'exit', 
'filter', '__builtins__.float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 
'help', 'hex', 'id', 'input', '__builtins__.int', 'isinstance', 'issubclass', 'iter', 'len', 
'license', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 
'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr', 
'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 
'sum','super', 'tuple', 'type', 'vars', 'zip']

for(var i=0;i<builtin_names.length;i++){
    var name = builtin_names[i]
    try{
        eval('__builtins__.'+name+'='+name)
        if(typeof __builtins__[name]=='function'){
            __builtins__[name].__repr__ = __builtins__[name].__str__ = (function(x){
                return function(){return '<built-in function '+x+'>'}
            })(name)
        }
    }
    catch(err){}
}

$B._alert = _alert
__builtins__['$open']=$url_open
__builtins__['$print']=$print
__builtins__['$$super']=$$super

})(__BRYTHON__)
