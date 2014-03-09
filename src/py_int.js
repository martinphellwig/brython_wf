;(function($B){
var __builtins__ = $B.builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = object.$dict

function $UnsupportedOpType(op,class1,class2){
    throw __builtins__.TypeError("unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}

var $IntDict = {__class__:$B.$type,
    __name__:'int',
    toString:function(){return '$IntDict'},
    $native:true
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

//$IntDict.__and__ = function(self,other){return self & other} // bitwise AND

$IntDict.__bool__ = function(self){return new Boolean(self.valueOf())}

//is this a duplicate?
$IntDict.__class__ = $B.$type

$IntDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "int"
        return self===int
    }
    if(isinstance(other,int)){return self.valueOf()==other.valueOf()}
    else if(isinstance(other,__builtins__.float)){return self.valueOf()==other.value}
    else if(isinstance(other,__builtins__.complex)){
      if (other.imag != 0) return False
      return self.valueOf() == other.real}
    else{return self.valueOf()===other}
}

$IntDict.__floordiv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0){throw ZeroDivisionError('division by zero')}
        else{return Math.floor(self/other)}
    }else if(isinstance(other,__builtins__.float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        else{return __builtins__.float(Math.floor(self/other.value))}
    }else{$UnsupportedOpType("//","int",other.__class__)}
}

$IntDict.__hash__ = function(self){return self.valueOf()}

$IntDict.__in__ = function(self,item){
    return getattr(item,'__contains__')(self)
}

//$IntDict.__ior__ = function(self,other){return self | other} // bitwise OR

$IntDict.__init__ = function(self,value){
    self.toString = function(){return value}
    self.valueOf = function(){return value}
}

$IntDict.__int__ = function(self){return self}

$IntDict.__invert__ = function(self){return ~self}

//$IntDict.__lshift__ = function(self,other){// bitwise left shift
//    if(isinstance(other,int)){return self << other}
//    $UnsupportedOpType("<<","int",other.__class__)
//}

$IntDict.__mod__ = function(self,other) {
    // can't use Javascript % because it works differently for negative numbers
    if(isinstance(other,__builtins__.tuple) && other.length==1){other=other[0]}
    if(isinstance(other,int)){
        return (self%other+other)%other
    }
    else if(isinstance(other,__builtins__.float)){
        return ((self%other)+other)%other
    }else if(isinstance(other,bool)){ 
         var bool_value=0; 
         if (other.valueOf()) bool_value=1;
         return (self%bool_value+bool_value)%bool_value
    }else{throw __builtins__.TypeError(
        "unsupported operand type(s) for %: "+self+" (int) and '"+other.__class__+"'")
    }
}

$IntDict.__mro__ = [$IntDict,$ObjectDict]

$IntDict.__mul__ = function(self,other){
    var val = self.valueOf(),list=__builtins__.list,tuple=__builtins__.tuple
    if(isinstance(other,int)){return self*other}
    else if(isinstance(other,__builtins__.float)){return __builtins__.float(self*other.value)}
    else if(isinstance(other,__builtins__.bool)){
         var bool_value=0
         if (other.valueOf()) bool_value=1
         return self*bool_value}
    else if(isinstance(other,__builtins__.complex)){
        return __builtins__.complex(self.valueOf() * other.real, self.valueOf() * other.imag)}
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

$IntDict.__new__ = function(cls){
    if(cls===undefined){throw __builtins__.TypeError('int.__new__(): not enough arguments')}
    return {__class__:cls.$dict}
}

$IntDict.__not_in__ = function(self,item){
    res = getattr(item,'__contains__')(self)
    return !res
}

//$IntDict.__or__ = function(self,other){return self | other} // bitwise OR

$IntDict.__pow__ = function(self,other){
    if(isinstance(other, int)) {
      if (other.valueOf() >= 0) {return int(Math.pow(self.valueOf(),other.valueOf()))}
      else {return Math.pow(self.valueOf(),other.valueOf())} }
    else if (isinstance(other, __builtins__.float)) { return __builtins__.float(Math.pow(self.valueOf(), other.valueOf()))}
    else{$UnsupportedOpType("**",int,other.__class__)}
}

$IntDict.__repr__ = function(self){
    if(self===int){return "<class 'int'>"}
    return self.toString()
}

//$IntDict.__rshift__ = function(self,other){return self >> other} // bitwise right shift

$IntDict.__setattr__ = function(self,attr,value){
    if(self.__class__===$IntDict){throw __builtins__.AttributeError("'int' object has no attribute "+attr+"'")}
    // subclasses of int can have attributes set
    self[attr] = value
}

$IntDict.__str__ = $IntDict.__repr__

$IntDict.__truediv__ = function(self,other){
    if(isinstance(other,int)){
        if(other==0){throw ZeroDivisionError('division by zero')}
        else{return __builtins__.float(self/other)}
    }else if(isinstance(other,__builtins__.float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        else{return __builtins__.float(self/other.value)}
    }else{$UnsupportedOpType("//","int",other.__class__)}
}

//$IntDict.__xor__ = function(self,other){return self ^ other} // bitwise XOR

$IntDict.bit_length = function(self){
    s = bin(self)
    s = getattr(s,'lstrip')('-0b') // remove leading zeros and minus sign
    return s.length       // len('100101') --> 6
}

var $op_func = function(self,other){
    if(isinstance(other,int)){return self-other}
    else if(isinstance(other,__builtins__.bool)){return self-other}
    $UnsupportedOpType("-","int",other.__class__)
}

$op_func += '' // source code
var $ops = {'&':'and','|':'ior','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){
    eval('$IntDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}

$IntDict.__or__ = $IntDict.__ior__

// operations
var $op_func = function(self,other){
    //console.log('op - self '+self+' other '+other)
    if(isinstance(other,int)){
        var res = self.valueOf()-other.valueOf()
        if(isinstance(res,int)){return res}
        else{return __builtins__.float(res)}
    }
    else if(isinstance(other,__builtins__.float)){return __builtins__.float(self.valueOf()-other.value)}
    else if(isinstance(other,bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return self.valueOf()-bool_value}
    else if(isinstance(other,__builtins__.complex)){
        return __builtins__.complex(self.valueOf() - other.real, other.imag)}
    else{throw __builtins__.TypeError(
        "unsupported GG operand type(s) for -: "+self.valueOf()+" and '"+__builtins__.str(other.__class__)+"'")
    }
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub'}
for(var $op in $ops){
    eval('$IntDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}

// comparison methods
var $comp_func = function(self,other){
    if(isinstance(other,int)){return self.valueOf() > other.valueOf()}
    else if(isinstance(other,__builtins__.float)){return self.valueOf() > other.value}
    else if(isinstance(other,bool)){return self.valueOf() > __builtins__.bool.$dict.__hash__(other)}
    else{throw __builtins__.TypeError(
        "unorderable types: "+self.__class__.__name__+'() > '+other.__class__.__name__+"()")}
}
$comp_func += '' // source codevar $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $B.$comps){
    eval("$IntDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

var int = function(value,base){
    var res
    if(base===undefined){base=10}
    if(value===undefined){res = Number(0)}
    else if(isinstance(value,int)){res = Number(value)}
    else if(value===True){res = Number(1)}
    else if(value===False){res = Number(0)}
    else if(typeof value=="number"){res = Number(parseInt(value))}
    else if(typeof value=="string") { // && (new RegExp(/^[ ]*[+-]?\d+[ ]*$/)).test(value)){
      try{
         res = Number(parseInt(value,base))
      } catch(err){
         throw __builtins__.ValueError(
        "Invalid literal for int() with base "+base +": '"+__builtins__.str(value)+"'")
      }
    }else if(isinstance(value,__builtins__.float)){
        res = Number(parseInt(value.value))
    }else{ throw __builtins__.ValueError(
        "Invalid literal for int() with base "+base +": '"+__builtins__.str(value)+"'")
    }
    return res
}
int.$dict = $IntDict
int.__class__ = $B.$factory
$IntDict.$factory = int

$B.builtins.int = int

})(__BRYTHON__)
