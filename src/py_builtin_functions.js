// built-in functions

function abs(obj){
    if(isinstance(obj,int)){return int(Math.abs(obj))}
    else if(isinstance(obj,float)){return float(Math.abs(obj.value))}
    else if(hasattr(obj,'__abs__')){return getattr(obj,'__abs__')()}
    else{throw TypeError("Bad operand type for abs(): '"+str(obj.__class__)+"'")}
}

function $alert(src){alert(str(src))}

function all(iterable){
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
    var $ns=$MakeArgs('assert_raises',arguments,['exc','func'],{},'args','kw')
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
  if (isinstance(obj, int)) {
     value=obj;
  } else if (obj.__index__ !== undefined) {
     value=obj.__index__()
  }
  if (value === undefined) {
     // need to raise an error
     Exception('TypeError', 'Error, argument must be an integer or contains an __index__ function')
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
            $pop_exc()
            try{return getattr(obj,'__len__')()>0}
            catch(err){$pop_exc();return true}
        }
    }
}
bool.__class__ = $type
bool.__mro__ = [bool,object]
bool.__name__ = 'bool'
bool.__str__ = function(){return "<class 'bool'>"}
bool.toString = bool.__str__
bool.__hash__ = function() {
    if(this.valueOf()) return 1
    return 0
}

//bytearray() (built in function)
function bytearray(source, encoding, errors) {
  throw NotImplementedError('bytearray has not been implemented')
}

//bytes() (built in function)
$BytesDict = {
    __class__ : $type,
    __name__ : 'bytes'
}

$BytesDict.__len__ = function(){return self.value.length}

$BytesDict.__mro__ = [$BytesDict,$ObjectDict]

$BytesDict.__repr__ = $BytesDict.__str__ = function(){return self.value}

function bytes(source, encoding, errors) {
    return {
        __class__:$BytesDict,
        source:source,
        encoding:encoding,
        errors:errors
    }
}
bytes.__class__ = $factory
bytes.$dict = $BytesDict

//callable() (built in function)
function callable(obj) {
  if (obj.__call__) return True
  // todo: need to figure out if an object is a class or an instance
  // classes are callable, instances usually aren't unless they have __call__
  // functions are callable..
  //for now assume the worst..
  return False
}

//chr() (built in function)
function chr(i) {
  if (i < 0 || i > 1114111) { Exception('ValueError', 'Outside valid range')}

  return String.fromCharCode(i)
}

//classmethod() (built in function)
function classmethod(klass,func) {
    // the first argument klass is added by py2js in $CallCtx
    func.$type = 'classmethod'
    return func
}

function $class(obj,info){
    this.obj = obj
    this.info = info
    this.__class__ = Object
    this.toString = function(){return "<class '"+info+"'>"}
}

//compile() (built in function)
function compile(source, filename, mode) {
    //for now ignore mode variable, and flags, etc
    return __BRYTHON__.py2js(source, filename).to_js()
}

//complex() (built in function)

function $confirm(src){return confirm(src)}

//delattr() (built in function)
function delattr(obj, attr) {
   if (obj.__delattr__ !== undefined) { obj.__delattr(attr)
   } else {
     //not sure this statement is possible or valid.. ?
     getattr(obj, attr).__del__()
   }
}

function dir(obj){
    if(isinstance(obj,JSObject)){obj=obj.js}
    var res = []
    for(var attr in obj){if(attr.charAt(0)!=='$'){res.push(attr)}}
    res.sort()
    return res
}

//divmod() (built in function)
function divmod(x,y) {
    if (x < 0) {
       var x2=(Number(y)+Number(x))%y;
       if (abs(x) <= y) {
          return [int(Math.floor(x/y)), x2]
       } 
       return [int(Math.ceil(x/y)), x2]
    } 
    return list([int(Math.floor(x/y)), x.__class__.__mod__(x,y)])
}

function enumerate(iterator){
    var _iter = iter(iterator)
    var res = {
        __class__:enumerate,
        __getattr__:function(attr){return res[attr]},
        __iter__:function(){return res},
        __name__:'enumerate iterator',
        __next__:function(){
            res.counter++
            return [res.counter,next(_iter)]
        },
        __repr__:function(){return "<enumerate object>"},
        __str__:function(){return "<enumerate object>"},
        counter:-1
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
enumerate.__class__ = $type
enumerate.__repr__ = function(){return "<class 'enumerate'>"}
enumerate.__str__ = function(){return "<class 'enumerate'>"}

//eval() (built in function)
//exec() (built in function)

function filter(){
    if(arguments.length!=2){throw TypeError(
            "filter expected 2 arguments, got "+arguments.length)}
    var func=arguments[0],iterable=iter(arguments[1])
    var res=[]
    while(true){
        try{
            var _item = next(iterable)
            if(func(_item)){res.push(_item)}
        }catch(err){
            if(err.__name__==='StopIteration'){$pop_exc();break}
            else{throw err}
        }
    }
    var obj = {
        __class__:{
            __class__:$type,
            __repr__:function(){return "<class 'filter'>"},
            __str__:function(){return "<class 'filter'>"}
        },
        __getattr__:function(attr){return obj[attr]},
        __iter__:function(){return iter(res)},
        __repr__:function(){return "<filter object>"},
        __str__:function(){return "<filter object>"}
    }
    return obj
}

// dictionary for built-in class 'float'
$FloatDict = {}

$FloatDict.__bool__ = function(self){return bool(self.value)}

$FloatDict.__class__ = $type

$FloatDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "float"
        return self===float
    }
    if(isinstance(other,int)){return self.value==other}
    else if(isinstance(other,float)){return self.value==other.value}
    else{return self.valueOf()===other}
}

$FloatDict.__floordiv__ = function(self,other){
    if(isinstance(other,int)){
        if(other===0){throw ZeroDivisionError('division by zero')}
        else{return float(Math.floor(self.value/other))}
    }else if(isinstance(other,float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        else{return float(Math.floor(self.value/other.value))}
    }else{throw TypeError(
        "unsupported operand type(s) for //: 'float' and '"+other.__class__+"'")
    }
}

$FloatDict.__hash__ = function() {
    // http://cw.tactileint.com/++Floats/Ruby,JavaScript,Ruby
    frexp=function (re) {
       var ex = Math.floor(Math.log(re) / Math.log(2)) + 1;
       var frac = re / Math.pow(2, ex);
       return [frac, ex];
    }

    if (this.value === Infinity || this.value === -Infinity) {
       if (this.value < 0.0) return -271828
       return 314159;
    } else if (isNaN(this.value)) {
       return 0;
    }

    var r=frexp(this.value);
    r[0] *= Math.pow(2,31)
    hipart = int(r[0])
    r[0] = (r[0] - hipart) * Math.pow(2,31)
    var x = hipart + int(r[0]) + (r[1] << 15)
    return x & 0xFFFFFFFF;
}

$FloatDict.__in__ = function(self,item){return item.__contains__(self)}

$FloatDict.__mod__ = function(self,other) {
    // can't use Javascript % because it works differently for negative numbers
    if(isinstance(other,int)){
        return float((self.value%other+other)%other)
    }
    else if(isinstance(other,float)){
        return float(((self.value%other.value)+other.value)%other.value)
    }else if(isinstance(other,bool)){ 
         var bool_value=0; 
         if (other.valueOf()) bool_value=1;
         return float((self.value%bool_value+bool_value)%bool_value)
    }else{throw TypeError(
        "unsupported operand type(s) for -: "+self.value+" (float) and '"+other.__class__+"'")
    }
}

$FloatDict.__mro__ = [$FloatDict,$ObjectDict]

$FloatDict.__name__ = 'float'

$FloatDict.__ne__ = function(self,other){return !$FloatDict.__eq__(self,other)}

$FloatDict.__neg__ = function(self,other){return float(-self.value)}

$FloatDict.__new__ = function(cls,arg){return float(arg)}

$FloatDict.__not_in__ = function(self,item){return !(getattr(item,'__contains__')(self))}

$FloatDict.__repr__ = $FloatDict.__str__ = function(self){
    if(self===float){return "<class 'float'>"}
    var res = self.value+'' // coerce to string
    if(res.indexOf('.')==-1){res+='.0'}
    return str(res)
}

$FloatDict.__truediv__ = function(self,other){
    if(isinstance(other,int)){
        if(other===0){throw ZeroDivisionError('division by zero')}
        else{return float(self.value/other)}
    }else if(isinstance(other,float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        else{return float(self.value/other.value)}
    }else{throw TypeError(
        "unsupported operand type(s) for //: 'float' and '"+other.__class__+"'")
    }
}

// operations
var $op_func = function(self,other){
    if(isinstance(other,int)){return float(self.value-other)}
    else if(isinstance(other,float)){return float(self.value-other.value)}
    else if(isinstance(other,bool)){ 
         var bool_value=0; 
         if (other.valueOf()) bool_value=1;
         return float(self.value-bool_value)}
    else{throw TypeError(
        "unsupported operand type(s) for -: "+self.value+" (float) and '"+other.__class__+"'")
    }
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub','*':'mul'}
for($op in $ops){
    eval('$FloatDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}

$FloatDict.__pow__= function(self,other){
    if(isinstance(other,int)){return float(Math.pow(self,other))}
    else if(isinstance(other,float)){return float(Math.pow(self.value,other.value))}
    else{throw TypeError(
        "unsupported operand type(s) for -: "+self.value+" (float) and '"+other.__class__+"'")
    }
}

// comparison methods
var $comp_func = function(self,other){
    if(isinstance(other,int)){return self.value > other.valueOf()}
    else if(isinstance(other,float)){return self.value > other.value}
    else{throw TypeError(
        "unorderable types: "+self.__class__+'() > '+other.__class__+"()")
    }
}
$comp_func += '' // source code
var $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for($op in $comps){
    eval("$FloatDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// unsupported operations
var $notimplemented = function(self,other){
    throw TypeError(
        "unsupported operand types for OPERATOR: '"+self.__class__+"' and '"+other.__class__+"'")
}
$notimplemented += '' // coerce to string
for($op in $operators){
    // use __add__ for __iadd__ etc, so don't define __iadd__ below
    if(['+=','-=','*=','/=','%='].indexOf($op)>-1) continue
    var $opfunc = '__'+$operators[$op]+'__'
    if(!($opfunc in $FloatDict)){
        eval('$FloatDict.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
    }
}

function $FloatClass(value){
    this.value = value
    this.__class__ = $FloatDict
    this.toString = function(){return this.value}
    this.valueOf = function(){return value}
}

// constructor for built-in class 'float'
float = function (value){
    if(value===undefined){return new $FloatClass(0.0)}
    if(typeof value=="number" || (typeof value=="string" && !isNaN(value))){
        var res = new $FloatClass(parseFloat(value))
        return res
    }
    if(isinstance(value,float)) return value
    if (value == 'inf') return new $FloatClass(Infinity);
    if (value == '-inf') return new $FloatClass(-Infinity);
    if (typeof value == 'string' && value.toLowerCase() == 'nan') return new $FloatClass(Number.NaN)
    
    throw ValueError("Could not convert to float(): '"+str(value)+"'")
}
float.__class__ = $factory
float.$dict = $FloatDict
$FloatDict.$factory = float

//format() (built in function)

$FrozensetDict = {__class__:$type,
    __name__:'frozenset',
}
$FrozensetDict.__mro__ = [$FrozensetDict,$ObjectDict]

// __mro__ is defined after $ObjectDict
function frozenset(){
    var res = set.apply(null,arguments)
    res.__class__ = $SetDict
    res.$real = 'frozen'
    return res
}
frozenset.__class__ = $factory
frozenset.$dict = $FrozensetDict

function getattr(obj,attr,_default){

    var klass = obj.__class__
    if(klass===undefined){
        // for native JS objects used in Python code
        if(obj[attr]!==undefined){return obj[attr]}
        else if(_default!==undefined){return _default}
        else{throw AttributeError('object has no attribute '+attr)}
    }

    // attribute __class__ is set for all Python objects
    if(attr=='__class__'){
        // return the factory function
        return klass.$factory
    }
    
    // __call__ on a function returns the function itself
    if(attr==='__call__' && (typeof obj=='function')){return obj}
    
    if(klass===$IntDict || klass===$ListDict){
        if(klass[attr]===undefined){
            throw AttributeError(klass.__name__+" object has no attribute '"+attr+"'")
        }
        return function(){
            var args = [obj]
            for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
            return klass[attr].apply(null,args)
        }
    }
    
    // module attribute are returned unmodified
    if(obj.__class__===$ModuleDict){
        var res = obj[attr]
        if(res!==undefined){return res}
        else{throw AttributeError('module '+obj.__name__+" has no attribute '"+attr+"'")}
    }
    var is_class = obj.__class__===$factory, mro, attr_func
    //if(attr=='$$delete'){console.log('get attr '+attr+', is class '+is_class)}
    //if(attr=='calc_v'){console.log('2 ! getattr '+attr+' of '+obj+' ('+type(obj)+') '+' class '+is_class)}
    if(is_class){
        attr_func=$type.__getattribute__
        if(obj.$dict===undefined){console.log('obj '+obj+' $dict undefined')}
        obj=obj.$dict
    }else{
        var mro = obj.__class__.__mro__
        if(mro===undefined){
            console.log('in getattr '+attr+' mro undefined for '+obj+' dir '+dir(obj)+' class '+obj.__class__)
            for(var _attr in obj){
                console.log('obj attr '+_attr+' : '+obj[_attr])
            }
            console.log('obj class '+dir(obj.__class__)+' str '+obj.__class__)
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
    else{throw AttributeError("'"+type(obj).__name__+"' object has no attribute '"+attr+"'")}
}

//globals() (built in function)
function globals(module){
    // the translation engine adds the argument mdoule
    var res = dict()
    var scope = __BRYTHON__.scope[module].__dict__
    for(var name in scope){res.__setitem__(name,scope[name])}
    return res
}

function hasattr(obj,attr){
    try{getattr(obj,attr);return True}
    catch(err){$pop_exc();return False}
}

function hash(obj){
    if (isinstance(obj, int)) { return obj.valueOf();}
    if (isinstance(obj, bool)) { return int(obj);}
    if (obj.__hashvalue__ !== undefined) { return obj.__hashvalue__;}
    if (obj.__hash__ !== undefined) {
       obj.__hashvalue__=obj.__hash__()
       return obj.__hashvalue__
    } else {
       throw AttributeError(
        "'"+str(obj.__class__)+"' object has no attribute '__hash__'")
    }
}

//help() (built in function)

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
      isinstance(obj, list) || isinstance(obj, dict)) {
      __BRYTHON__.$py_next_hash+=1
      obj.__hashvalue=__BRYTHON__.$py_next_hash
      return obj.__hashvalue__
   }
   if (obj.__hash__ !== undefined) {
      return obj.__hash__()
   }

   return null
}

//not a direct alias of prompt: input has no default value
function input(src){
    return prompt(src)
}

$IntDict = {__class__:$type,
    __name__:'int',
    toString:function(){return '$IntDict'}
}
// Pierre, this probably isn't correct, but may work for now.
// do we need to create a $IntDict, like what we did for Float?
$IntDict.from_bytes = function(x, byteorder) {
  var len = x.length
  var num = x.charCodeAt(len - 1);
  if (type.signed && (num >= 128)) {
    num = num - 256;
  }
  for (var i = (len - 2); i >= 0; i--) {
    num = 256 * num + x.charCodeAt(i);
  }
  return num;
}

$IntDict.__and__ = function(self,other){return self & other} // bitwise AND

$IntDict.__bool__ = function(self){return new Boolean(self.valueOf())}

$IntDict.__class__ = $type

$IntDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "int"
        return self===int
    }
    if(isinstance(other,int)){return self.valueOf()==other.valueOf()}
    else if(isinstance(other,float)){return self.valueOf()==other.value}
    else{return self.valueOf()===other}
}

$IntDict.__floordiv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0){throw ZeroDivisionError('division by zero')}
        else{return Math.floor(self/other)}
    }else if(isinstance(other,float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        else{return float(Math.floor(self/other.value))}
    }else{$UnsupportedOpType("//","int",other.__class__)}
}

$IntDict.__hash__ = function(self){return self.valueOf()}

$IntDict.__in__ = function(self,item){
    return getattr(item,'__contains__')(self)
}

$IntDict.__ior__ = function(self,other){return self | other} // bitwise OR

$IntDict.__init__ = function(self,value){
    self.toString = function(){return '$'+value+'$'}
    self.valueOf = function(){return value}
}

$IntDict.__int__ = function(self){return self}

$IntDict.__invert__ = function(self){return ~self}

$IntDict.__lshift__ = function(self,other){return self << other} // bitwise left shift

$IntDict.__mod__ = function(self,other) {
    // can't use Javascript % because it works differently for negative numbers
    if(isinstance(other,int)){
        return (self%other+other)%other
    }
    else if(isinstance(other,float)){
        return ((self%other)+other)%other
    }else if(isinstance(other,bool)){ 
         var bool_value=0; 
         if (other.valueOf()) bool_value=1;
         return (self%bool_value+bool_value)%bool_value
    }else{throw TypeError(
        "unsupported operand type(s) for -: "+self+" (int) and '"+other.__class__+"'")
    }
}

$IntDict.__mro__ = [$IntDict,$ObjectDict]

$IntDict.__mul__ = function(self,other){
    var val = self.valueOf()
    if(isinstance(other,int)){return self*other}
    else if(isinstance(other,float)){return float(self*other.value)}
    else if(isinstance(other,bool)){
         var bool_value=0
         if (other.valueOf()) bool_value=1
         return self*bool_value}
    else if(typeof other==="string") {
        var res = ''
        for(var i=0;i<val;i++){res+=other}
        return res
    }else if(isinstance(other,[list,tuple])){
        var res = []
        // make temporary copy of list
        var $temp = other.slice(0,other.length)
        for(var i=0;i<val;i++){res=res.concat($temp)}
        if(isinstance(other,tuple)){res=tuple(res)}
        return res
    }else{$UnsupportedOpType("*",int,other)}
}

$IntDict.__name__ = 'int'

$IntDict.__ne__ = function(self,other){return !$IntDict.__eq__(self,other)}

$IntDict.__neg__ = function(self){return -self}

$IntDict.__new__ = function(cls,value){
    return {__class__:cls}
}

$IntDict.__not_in__ = function(self,item){
    res = getattr(item,'__contains__')(self)
    return !res
}

$IntDict.__or__ = function(self,other){return self | other} // bitwise OR

$IntDict.__pow__ = function(self,other){
    if(isinstance(other, int)) {return int(Math.pow(self.valueOf(),other.valueOf()))}
    else if (isinstance(other, float)) { return float(Math.pow(self.valueOf(), other.valueOf()))}
    else{$UnsupportedOpType("**",int,other.__class__)}
}

$IntDict.__repr__ = function(self){
    if(self===int){return "<class 'int'>"}
    return self.toString()
}

$IntDict.__rshift__ = function(self,other){return self >> other} // bitwise right shift

$IntDict.__setattr__ = function(self,attr,value){throw AttributeError(
    "'int' object has no attribute "+attr+"'")}

$IntDict.__str__ = $IntDict.__repr__

$IntDict.__truediv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0){throw ZeroDivisionError('division by zero')}
        else{return float(self/other)}
    }else if(isinstance(other,float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        else{return float(self/other.value)}
    }else{$UnsupportedOpType("//","int",other.__class__)}
}

$IntDict.__xor__ = function(self,other){return self ^ other} // bitwise XOR

//Number.prototype.__repr__ = function(){return $IntDict.__repr__(this)}
//Number.prototype.__str__ = function(){return $IntDict.__str__(this)}

// operations
var $op_func = function(self,other){
    //console.log('op - self '+self+' other '+other)
    if(isinstance(other,int)){
        var res = self.valueOf()-other.valueOf()
        if(isinstance(res,int)){return res}
        else{return float(res)}
    }
    else if(isinstance(other,float)){return float(self.valueOf()-other.value)}
    else if(isinstance(other,bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return self.valueOf()-bool_value}
    else{throw TypeError(
        "unsupported operand type(s) for -: "+self.valueOf()+" and '"+str(other.__class__)+"'")
    }
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub'}
for($op in $ops){
    eval('$IntDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}

// comparison methods
var $comp_func = function(self,other){
    if(isinstance(other,int)){return self.valueOf() > other.valueOf()}
    else if(isinstance(other,float)){return self.valueOf() > other.value}
    else{throw TypeError(
        "unorderable types: "+str(self.__class__)+'() > '+str(other.__class__)+"()")}
}
$comp_func += '' // source code
var $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for($op in $comps){
    eval("$IntDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

Number.prototype.__class__ = $IntDict

$IntDict.$dict = $IntDict

int = function(value){
    var res
    if(value===undefined){res = Number(0)}
    else if(isinstance(value,int)){res = Number(value)}
    else if(value===True){res = Number(1)}
    else if(value===False){res = Number(0)}
    else if(typeof value=="number"){res = Number(parseInt(value))}
    else if(typeof value=="string" && (new RegExp(/^[+-]?\d+$/)).test(value)){
        res = Number(parseInt(value))
    }else if(isinstance(value,float)){
        res = Number(parseInt(value.value))
    }else{ throw ValueError(
        "Invalid literal for int() with base 10: '"+str(value)+"'")
    }
    return res
}
int.$dict = $IntDict
int.__class__ = $factory
$IntDict.$factory = int

function isinstance(obj,arg){
    if(obj===null){return arg===None}
    if(obj===undefined){return false}
    if(arg.constructor===Array){
        for(var i=0;i<arg.length;i++){
            if(isinstance(obj,arg[i])){return true}
        }
        return false
    }else{
        if(arg===int){
            return ((typeof obj)=="number"||obj.constructor===Number)&&(obj.valueOf()%1===0)
        }
        if(arg===float){
            return ((typeof obj=="number" && obj.valueOf()%1!==0))||
                (obj.__class__===$FloatDict)
        }
        if(arg===str){return (typeof obj=="string"||obj.__class__===str)}
        if(arg===list){return (obj.constructor===Array)}
        if(obj.__class__!==undefined){
            // arg is the class constructor ; the attribute __class__ is the 
            // class dictionary, ie arg.$dict
            //return obj.__class__===arg.$dict
            var klass = obj.__class__
            if(klass.__mro__===undefined){console.log('mro undef for '+klass+' '+dir(klass)+' '+arg)}
            for(var i=0;i<klass.__mro__.length;i++){
                if(klass.__mro__[i]===arg.$dict){return true}
            }
            return false
        }
        return obj.constructor===arg
    }
}

//issubclass() (built in function)

function iter(obj){
    try{return getattr(obj,'__iter__')()}
    catch(err){
        $pop_exc()
        throw TypeError("'"+obj.__class__.__name__+"' object is not iterable")
    }
}

function $iterator_getitem(obj){
    this.counter = -1
    this.__getattr__ = function(attr){
        if(attr==='__next__'){return $bind(this[attr],this)}
    }
    this.__iter__ = function(rank){return $iterator_getitem(obj)}
    this.__len__ = function(){return obj.length}
    this.__name__ = 'iterator'
    this.__next__ = function(){
        this.counter++
        if(this.counter<getattr(obj,'__len__')()){
            return getattr(obj,'__getitem__')(this.counter)
        }
        else{throw StopIteration("")}
    }
    if (obj.__class__ !== undefined) {
       this.__class__=obj.__class__
    }
}

function len(obj){
    try{return getattr(obj,'__len__')()}
    catch(err){
        console.log('len error '+err)
        throw TypeError("object of type '"+obj.__class__.__name__+"' has no len()")}
}

// list built in function is defined in py_list

function locals(obj_id){
    // used for locals() ; the translation engine adds the argument obj,
    // a dictionary mapping local variable names to their values
    if(__BRYTHON__.scope[obj_id]===undefined){
        var module=document.$line_info[1]
        return globals(module)
    }
    var res = dict()
    var scope = __BRYTHON__.scope[obj_id].__dict__
    for(var name in scope){$DictDict.__setitem__(res,name,scope[name])}
    return res
}

$MapDict = {
    __class__:$type,
    __name__:'map'
}
$MapDict.__mro__ = [$MapDict,$ObjectDict]

function map(){
    var func = arguments[0],res=[],rank=0
    var iter_args = []
    for(var i=1;i<arguments.length;i++){iter_args.push(iter(arguments[i]))}
    while(true){
        var args = [],flag=true
        for(var i=0;i<iter_args.length;i++){
            try{
                var x = next(iter_args[i])
                args.push(x)
            }catch(err){
                if(err.__name__==='StopIteration'){
                    $pop_exc();flag=false;break
                }else{throw err}
            }
        }
        if(!flag){break}
        res.push(func.apply(null,args))
        rank++
    }
    var obj = {
        __class__:$MapDict,
        __getattr__:function(attr){return obj[attr]},
        __iter__:function(){return iter(res)},
        __repr__:function(){return "<map object>"},
        __str__:function(){return "<map object>"}
    }
    return obj
}

function $extreme(args,op){ // used by min() and max()
    if(op==='__gt__'){var $op_name = "max"}
    else{var $op_name = "min"}
    if(args.length==0){throw TypeError($op_name+" expected 1 argument, got 0")}
    var last_arg = args[args.length-1]
    var last_i = args.length-1
    var has_key = false
    if(isinstance(last_arg,$Kw)){
        if(last_arg.name === 'key'){
            var func = last_arg.value
            has_key = true
            last_i--
        }else{throw TypeError($op_name+"() got an unexpected keyword argument")}
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
    throw TypeError("'"+obj.__class__.__name__+"' object is not an iterator")
}

$NotImplementedDict = {
    __class__:$type,
    __name__:'NotImplementedType'
}
$NotImplementedDict.__mro__ = [$NotImplementedDict,$ObjectDict]
$NotImplementedDict.__repr__ = $NotImplementedDict.__str__ = function(){return 'NotImplemented'}

NotImplemented = {
    __class__ : $NotImplementedDict,
}
    
function $not(obj){return !bool(obj)}

// oct() (built in function)
function oct(x) {
   return $builtin_base_convert_helper(x, 8)
}

function $open(){
    // first argument is file : can be a string, or an instance of a DOM File object
    // other arguments : 
    // - mode can be 'r' (text, default) or 'rb' (binary)
    // - encoding if mode is 'rb'
    var $ns=$MakeArgs('open',arguments,['file'],{'mode':'r','encoding':'utf-8'},'args','kw')
    for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
    if(args.length>0){var mode=args[0]}
    if(args.length>1){var encoding=args[1]}
    if(isinstance(file,JSObject)){return new $OpenFile(file.js,mode,encoding)}
    else if(isinstance(file,str)){
        // read the file content and return an object with file object methods
        if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            var req=new XMLHttpRequest();
        }else{// code for IE6, IE5
            var req=new ActiveXObject("Microsoft.XMLHTTP");
        }
        req.onreadystatechange = function(){
            var status = req.status
            if(status===404){
                $res = IOError('File not found')
            }else if(status!==200){
                $res = IOError('Could not open file '+file+' : status '+status) 
            }else{
                $res = req.responseText
            }
        }
        req.open('GET',file,false)
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
            if(res.closed){throw ValueError('I/O operation on closed file')}
            if(nb===undefined){return $res}
            else{
                counter+=nb
                return $res.substr(counter-nb,nb)
            }
        }
        res.readable = function(){return true}
        res.readline = function(limit){
            if(res.closed){throw ValueError('I/O operation on closed file')}
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
            if(res.closed){throw ValueError('I/O operation on closed file')}
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
            if(res.closed){throw ValueError('I/O operation on closed file')}
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

function ord(c) {
    return c.charCodeAt(0)
}

// pow() (built in function)
function pow() {
    var $ns=$MakeArgs('pow',arguments,[],{},'args','kw')
    var args = $ns['args']
    if(args.length!=2){throw TypeError(
        "pow expected 2 arguments, got "+args.length)
    }
    var x = args[0]
    var y = args[1]
    var a,b
    if (isinstance(x, float)) {a=x.value} else {a=x}
    if (isinstance(y, float)) {b=y.value} else {b=y}

    return Math.pow(a,b)
}

function $print(){
    var $ns=$MakeArgs('print',arguments,[],{},'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    var end = $DictDict.get(kw,'end','\n')
    var res = ''
    for(var i=0;i<args.length;i++){
        res += str(args[i])
        if(i<args.length-1){res += ' '}
    }
    res += end
    getattr(document.$stdout,'write')(res)
}
$print.__name__ = 'print'

// compatibility with previous versions
log = function(arg){console.log(arg)} 

function $prompt(text,fill){return prompt(text,fill || '')}

// property (built in function)
$PropertyDict = {
    __class__ : $type,
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
        if(self.fget===undefined){throw AttributeError("unreadable attribute")}
        return self.fget(obj)
    }
    return p
    //p.__set__ = fdel; 
    //p.__delete__ = fdel;
}

property.__class__ = $factory
property.$dict = $PropertyDict

// range
$RangeDict = {__class__:$type,__name__:'range'}

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
            throw IndexError('range object index out of range')
    }
    return res   
}

$RangeDict.__iter__ = function(self){
    self.$counter=self.start-self.step
    return self
}

$RangeDict.__len__ = function(self){
    if(self.step>0){return 1+int((self.stop-1-self.start)/self.step)}
    else{return 1+int((self.start-1-self.stop)/-self.step)}
}

$RangeDict.__next__ = function(self){
    self.$counter += self.step
    if((self.step>0 && self.$counter >= self.stop)
        || (self.step<0 && self.$counter <= self.stop)){
            throw StopIteration('')
    }
    return self.$counter
}

$RangeDict.__mro__ = [$RangeDict,$ObjectDict]

$RangeDict.__reversed__ = function(self){
    return range(self.stop-1,self.start-1,-self.step)
}

function range(){
    var $ns=$MakeArgs('range',arguments,[],{},'args',null)
    var args = $ns['args']
    if(args.length>3){throw TypeError(
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
    if(step==0){throw ValueError("range() arg 3 must not be zero")}
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
range.__class__ = $factory
range.$dict = $RangeDict

function repr(obj){
    var func = getattr(obj,'__repr__')
    if(func!==undefined){return func()}
    else{throw AttributeError("object has no attribute __repr__")}
}

function reversed(seq){
    // Return a reverse iterator. seq must be an object which has a 
    // __reversed__() method or supports the sequence protocol (the __len__() 
    // method and the __getitem__() method with integer arguments starting at 
    // 0).

    var $ReversedDict = {
        __class__:$type,
        __name__:'reversed'
    }
    $ReversedDict.__mro__ = [$ReversedDict,$ObjectDict]
    $ReversedDict.__iter__ = function(self){return self}
    $ReversedDict.__next__ = function(self){
        self.$counter--
        //console.log('next '+self+' len '+self.len+' counter '+self.$counter)
        if(self.$counter<0){throw StopIteration('')}
        return self.getter(self.$counter)
    }

    try{return getattr(seq,'__reversed__')()}
    catch(err){if(err.__name__=='AttributeError'){$pop_exc()}
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
        throw TypeError("argument to reversed() must be a sequence")
    }
}

function round(arg,n){
    if(!isinstance(arg,[int,float])){
        throw TypeError("type "+str(arg.__class__)+" doesn't define __round__ method")
    }
    if(n===undefined){n=0}
    if(!isinstance(n,int)){throw TypeError(
        "'"+n.__class__+"' object cannot be interpreted as an integer")}
    var mult = Math.pow(10,n)
    var res = $IntDict.__truediv__(Number(Math.round(arg.valueOf()*mult)),mult)
    if(n==0){return int(res)}else{return float(res)}
}


function setattr(obj,attr,value){
    if(!isinstance(attr,str)){throw TypeError("setattr(): attribute name must be string")}
    try{
        getattr(obj,'__setattr__')(attr,value)
    }
    catch(err){$pop_exc();obj[attr]=value}
}

// slice
$SliceDict = {__class__:$type,
    __name__:'slice'
}
$SliceDict.__mro__ = [$SliceDict,$ObjectDict]

function slice(){
    var $ns=$MakeArgs('slice',arguments,[],{},'args',null)
    var args = $ns['args']
    if(args.length>3){throw TypeError(
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
    if(step==0){throw ValueError("slice step must not be zero")}
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
slice.__class__ = $factory
slice.$dict = $SliceDict

// sorted() built in function
function sorted (iterable, key, reverse) {
   if (reverse === undefined) {reverse=False}

   var obj = new $list()
   iterable = iter(iterable)
   while(true){
       try{obj.append(next(iterable))}
       catch(err){
           if(err.__name__==='StopIteration'){$pop_exc();break}
           else{throw err}
       }
   }

   if (key !== undefined) {
      var d=$DictClass(('key', key), ('reverse', reverse))
      obj.sort(d)
   } else {
      var d=$DictClass(('reverse', reverse))
      obj.sort(d)
   }

   return obj
}

// staticmethod() built in function
function staticmethod(func) {
    func.$type = 'staticmethod'
    return func
}

// str() defined somewhere else

function sum(iterable,start){
    if(start===undefined){start=0}
    var res = start
    var iterable = iter(iterable)
    while(true){
        try{
            var _item = next(iterable)
            res = getattr(res,'__add__')(_item)
        }catch(err){
           if(err.__name__==='StopIteration'){$pop_exc();break}
           else{throw err}
        }
    }
    return res
}

// super() built in function

function $tuple(arg){return arg} // used for parenthesed expressions

$TupleDict = {__class__:$type,__name__:'tuple'}

$TupleDict.__iter__ = function(self){
    var res = {
        __class__:$tuple_iterator,
        __getattr__:function(attr){return res[attr]},
        __iter__:function(){return res},
        __len__:function(){return self.length},
        __name__:'tuple iterator',
        __next__:function(){
            res.counter++
            if(res.counter<self.length){return self[res.counter]}
            else{throw StopIteration("StopIteration")}
        },
        __repr__:function(){return "<tuple iterator object>"},
        __str__:function(){return "<tuple iterator object>"},
        counter:-1
    }
    return res
}
$TupleDict.__new__ = function(arg){return tuple(arg)}
// other attributes are defined in py_list.js, once list is defined

$tuple_iterator = {
    __class__:$type,
    __getattr__:function(){return $tuple_iterator[attr]},
    __name__:'tuple iterator',
    __repr__:function(){return "<class 'tuple_iterator'>"},
    __str__:function(){return "<class 'tuple_iterator'>"}
}
$tuple_iterator.__mro__=[$tuple_iterator,$type]
// type() is implemented in py_utils

function tuple(){
    var obj = list.apply(null,arguments)
    obj.__class__ = $TupleDict
    //obj.__bool__ = function(){return obj.length>0}

    obj.__hash__ = function () {
      // http://nullege.com/codes/show/src%40p%40y%40pypy-HEAD%40pypy%40rlib%40test%40test_objectmodel.py/145/pypy.rlib.objectmodel._hash_float/python
      var x= 0x345678
      for(var i=0; i < args.length; i++) {
         var y=_list[i].__hash__();
         x=(1000003 * x) ^ y & 0xFFFFFFFF;
      }
      return x
    }
    return obj
}
tuple.__class__ = $factory
tuple.$dict = $TupleDict
$TupleDict.$factory = tuple

function zip(){
    var $ns=$MakeArgs('zip',arguments,[],{},'args','kw')
    var _args = $ns['args']
    var args = []
    for(var i=0;i<_args.length;i++){args.push(iter(_args[i]))}
    var kw = $ns['kw']
    var rank=0,res=[]
    while(true){
        var line=[],flag=true
        for(var i=0;i<args.length;i++){
            try{
                var x=next(args[i])
                line.push(x)
            }catch(err){
                if(err.__name__==='StopIteration'){$pop_exc();flag=false;break}
                else{throw err}
            }
        }
        if(!flag){return res}
        res.push(line)
        rank++
    }
}

// built-in constants : True, False, None

True = true
False = false

$BoolDict = {__class__:$type,
    __name__:'bool',
    __repr__ : function(){return "<class 'bool'>"},
    __str__ : function(){return "<class 'bool'>"},
    toString : function(){return "<class 'bool'>"},
}
$BoolDict.__mro__ = [$BoolDict,$ObjectDict]
bool.__class__ = $factory
bool.$dict = $BoolDict
$BoolDict.$factory = bool

$BoolDict.__add__ = function(self,other){
    if(self.valueOf()) return other + 1;
    return other;
}

Boolean.prototype.__class__ = $BoolDict

$BoolDict.__eq__ = function(self,other){
    if(self.valueOf()){return !!other}else{return !other}
}

$BoolDict.__hash__ = function(self) {
   if(self.valueOf()) return 1
   return 0
}

$BoolDict.__mul__ = function(self,other){
    if(self.valueOf()) return other;
    return 0;
}

$BoolDict.toString = function(){
    if(this.valueOf()) return "True"
    return "False"
}

$BoolDict.__repr__ = $BoolDict.toString

$BoolDict.__str__ = $BoolDict.toString

$NoneDict = {__class__:$type,
    __mro__ : [$ObjectDict],
    __name__:'NoneType',
    __str__:function(){return "<class 'NoneType'>"}
}

None = {
    __bool__ : function(){return False},
    __class__ : $NoneDict,
    __hash__ : function(){return 0},
    __repr__ : function(){return 'None'},
    __str__ : function(){return 'None'},
    toString : function(){return 'None'}
}

var $comp_ops = ['ge','gt','le','lt']
for(var key in $comps){ // None is not orderable with any type
    if($comp_ops.indexOf($comps[key])>-1){
        None['__'+$comps[key]+'__']=(function(k){
            return function(other){
            throw TypeError("unorderable types: NoneType() "+$comps[k]+" "+
                other.__class__.__name__)}
        })(key)
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
$FunctionDict = {__class__:$type}
$FunctionDict.__str__ = function(self){return '<function '+self.__name__+'>'}

Function.prototype.__mro__ = [$FunctionDict,$ObjectDict]
Function.__name__ = 'function'

Function.prototype.__call__ = function(){return this.apply(null,arguments)}
Function.prototype.__class__ = Function
Function.prototype.__get__ = function(self,obj,objtype){
    // Functions are Python descriptors, so this function is called by
    // __getattribute__ if the attribute of an object is a function
    // If the object is a class, __get__ is called with (None,klass)
    // If it is an instance, it is called with (instance,type(instance))
    return self
}
//Function.prototype.__str__ = function(){return 'a function'}

// built-in exceptions

Exception = function (msg,js_exc){
    var err = Error()
    err.info = ''
    if(msg===undefined){msg='Exception'}
    
    if(__BRYTHON__.debug && !msg.info){
        if(js_exc!==undefined){
            for(var attr in js_exc){
                if(attr==='message'){continue}
                try{err.info += '\n    '+attr+' : '+js_exc[attr]}
                catch(_err){void(0)}
            }
            err.info+='\n\n'        
        }
        var module = document.$line_info[1]
        var line_num = document.$line_info[0]
        var lines = document.$py_src[module].split('\n')
        var lib_module = module
        if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
        err.info += "module '"+lib_module+"' line "+line_num
        err.info += '\n'+lines[line_num-1]
    }
    err.message = msg
    err.args = msg
    err.__str__ = function(){return msg}
    err.toString = err.__str__
    err.__getattr__ = function(attr){return this[attr]}
    err.__name__ = 'Exception'
    err.__class__ = Exception
    err.py_error = true
    __BRYTHON__.exception_stack.push(err)
    return err
}

Exception.__name__ = 'Exception'
Exception.__class__ = $type

__BRYTHON__.exception = function(js_exc){
    // thrown by eval(), exec() or by a function
    // js_exc is the Javascript exception, which can be raised by the
    // code generated by Python - in this case it has attribute py_error set 
    // or by the Javascript interpreter (ReferenceError for instance)
    if(!js_exc.py_error){
        if(__BRYTHON__.debug>0 && js_exc.info===undefined){
            var mod_name = document.$line_info[1]
            var module = __BRYTHON__.modules[mod_name]
            if(module){
                if(module.caller!==undefined){
                    // for list comprehension and the likes, replace
                    // by the line in the enclosing module
                    document.$line_info = module.caller
                    var module = document.$line_info[1]
                }
                var lib_module = mod_name
                if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}
                var line_num = document.$line_info[0]
                var lines = document.$py_src[mod_name].split('\n')
                js_exc.message += "\nmodule '"+lib_module+"' line "+line_num
                js_exc.message += '\n'+lines[line_num-1]
                js_exc.info_in_msg = true
            }
        }
        var exc = Error()
        exc.__name__ = js_exc.name
        exc.message = js_exc.message
        exc.info = ''
    }else{
        var exc = js_exc
    }
    __BRYTHON__.exception_stack.push(exc)
    return exc
}

function $make_exc(name){
    var $exc = (Exception+'').replace(/Exception/g,name)
    eval(name+'='+$exc)
    eval(name+'.__str__ = function(){return "<class '+"'"+name+"'"+'>"}')
    eval(name+'.__class__=$type')
}

var $errors = ['AssertionError','AttributeError','EOFError','FloatingPointError',
    'GeneratorExit','ImportError','IndexError','KeyError','KeyboardInterrupt',
    'NameError','NotImplementedError','OSError','OverflowError','ReferenceError',
    'RuntimeError','StopIteration','SyntaxError','IndentationError','TabError',
    'SystemError','SystemExit','TypeError','UnboundLocalError','ValueError',
    'ZeroDivisionError','IOError']
for(var $i=0;$i<$errors.length;$i++){$make_exc($errors[$i])}

//do the same for warnings.. :)
var $warnings = ['Warning', 'DeprecationWarning', 'PendingDeprecationWarning',
                 'RuntimeWarning', 'SyntaxWarning', 'UserWarning',
                 'FutureWarning', 'ImportWarning', 'UnicodeWarning',
                 'BytesWarning', 'ResourceWarning']
for(var $i=0;$i<$warnings.length;$i++){$make_exc($warnings[$i])}

