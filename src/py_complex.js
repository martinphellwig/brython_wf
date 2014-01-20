;(function($B){
var __builtins__ = $B.builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = object.$dict

function $UnsupportedOpType(op,class1,class2){
    throw __builtins__.TypeError("unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}

var $ComplexDict = {__class__:$B.$type,
    __name__:'complex',
    toString:function(){return '$ComplexDict'},
    $native:true
}

$ComplexDict.__abs__ = function(self,other){return complex(abs(self.real),abs(self.imag))}

//$ComplexDict.__and__ = function(self,other){$UnsupportedOpType("&","complex",other.__class__)}

$ComplexDict.__bool__ = function(self){return new Boolean(self.real || self.imag)}

$ComplexDict.__class__ = $B.$type

$ComplexDict.__eq__ = function(self,other){
    if(isinstance(other,complex)){return self.real==other.real && self.imag==other.imag}
    else if(isinstance(other,__builtins__.int)){
      if (self.imag != 0) return False
      return self.real == other.valueOf()}
    else if(isinstance(other,__builtins__.float)){
      if (self.imag != 0) return False
      return self.real == other.value}
    else{$UnsupportedOpType("==","complex",other.__class__)}
}

$ComplexDict.__floordiv__ = function(self,other){
    $UnsupportedOpType("//","complex",other.__class__)
}

$ComplexDict.__hash__ = function(self){return hash(self)}

//$ComplexDict.__ior__ = function(self,other){$UnsupportedOpType("|","complex",other.__class__)} // bitwise OR

$ComplexDict.__init__ = function(self,real,imag){
    self.toString = function(){return '('+real+'+'+imag+'j)'}
}

$ComplexDict.__invert__ = function(self){return ~self}

//$ComplexDict.__lshift__ = function(self,other){$UnsupportedOpType("<<","complex",other.__class__)} // bitwise left shift

$ComplexDict.__mod__ = function(self,other) {
    throw __builtins__.TypeError("TypeError: can't mod complex numbers.")
}

$ComplexDict.__mro__ = [$ComplexDict,$ObjectDict]

$ComplexDict.__mul__ = function(self,other){
    if(isinstance(other,complex)){
      return complex(self.real*other.real-self.imag*other.imag, self.imag*other.real + self.real*other.imag) }
    else if(isinstance(other,__builtins__.int)){
      return complex(self.real*other.valueOf(), self.imag*other.valueOf()) }
    else if(isinstance(other,__builtins__.float)){
      return complex(self.real*other.value, self.imag*other.value)}
    else if(isinstance(other,bool)){
      if (other.valueOf()) return self
      return complex(0)}
    else{$UnsupportedOpType("*",complex,other)}
}

$ComplexDict.__name__ = 'complex'

$ComplexDict.__ne__ = function(self,other){return !$ComplexDict.__eq__(self,other)}

$ComplexDict.__neg__ = function(self){return complex(-self.real,-self.imag)}

$ComplexDict.__new__ = function(cls){
    if(cls===undefined){throw __builtins__.TypeError('complex.__new__(): not enough arguments')}
    return {__class__:cls.$dict}
}

//$ComplexDict.__or__ = function(self,other){return self}

$ComplexDict.__pow__ = function(self,other){
    $UnsupportedOpType("**",complex,other.__class__)
}

$ComplexDict.__str__ = $ComplexDict.__repr__ = function(self){
    if (self.real == 0) { return self.imag+'j'}
    return '('+self.real+'+'+self.imag+'j)'
}

//$ComplexDict.__rshift__ = function(self,other){$UnsupportedOpType(">>","complex",other.__class__)} // bitwise left shift

$ComplexDict.__sqrt__= function(self) {
  if (self.imag == 0) {return complex(Math.sqrt(self.real))}
  var _a = Math.sqrt((self.real + Math.sqrt(self.real*self.real + self.imag*self.imag))/2)
  var _b = Number.sign(self.imag) * Math.sqrt((-self.real + Math.sqrt(self.real*self.real + self.imag*self.imag))/2)

  return complex(_a, _b)
}

$ComplexDict.__truediv__ = function(self,other){
    if(isinstance(other,complex)){
      if (other.real == 0 && other.imag == 0) {
         throw ZeroDivisionError('division by zero')
      }
      var _num=self.real*other.real + self.imag*other.imag
      var _div=other.real*other.real + other.imag*other.imag

      var _num2=self.imag*other.real - self.real*other.imag

      return complex(_num/_div, _num2/_div)
    }else if(isinstance(other,__builtins__.int)){
        if(!other.valueOf()){throw ZeroDivisionError('division by zero')}
        return $ComplexDict.__truediv__(self, complex(other.valueOf()))
    }else if(isinstance(other,__builtins__.float)){
        if(!other.value){throw ZeroDivisionError('division by zero')}
        return $ComplexDict.__truediv__(self, complex(other.value))
    }else{$UnsupportedOpType("//","complex",other.__class__)}
}

//$ComplexDict.__xor__ = function(self,other){
//    throw __builtins__.TypeError("TypeError: unsupported operand type(s) for ^: 'complex' and '" + other.__class__+"'")
//} // bitwise XOR

// operators
var $op_func = function(self,other){
    throw __builtins__.TypeError("TypeError: unsupported operand type(s) for -: 'complex' and '" + other.__class__+"'")
}
$op_func += '' // source code
var $ops = {'&':'and','|':'ior','<<':'lshift','>>':'rshift','^':'xor'}
for(var $op in $ops){
    eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}

$ComplexDict.__ior__=$ComplexDict.__or__

// operations
var $op_func = function(self,other){
    if(isinstance(other,complex)){
         return complex(self.real - other.real, self.imag-other.imag)
    }else if (isinstance(other,__builtins__.int)) {
         return complex(self.real - other.valueOf(), self.imag)
    }else if(isinstance(other,__builtins__.float)){
         return complex(self.real - other.value, self.imag)
    }else if(isinstance(other,bool)){
         var bool_value=0;
         if(other.valueOf()) bool_value=1;
         return complex(self.real - bool_value, self.imag)
    }else{throw __builtins__.TypeError(
        "unsupported GG operand type(s) for -: "+self.__repr__()+" and '"+__builtins__.str(other.__class__)+"'")
    }
}
$op_func += '' // source code
var $ops = {'+':'add','-':'sub'}
for(var $op in $ops){
    eval('$ComplexDict.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}


// comparison methods
var $comp_func = function(self,other){
    throw __builtins__.TypeError("TypeError: unorderable types: complex() > " + other.__class__ + "()")
}
$comp_func += '' // source codevar $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $B.$comps){
    eval("$ComplexDict.__"+$B.$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

var complex=function(real,imag){
    var res = {
        __class__:$ComplexDict,
        real:real || 0,
        imag:imag || 0
    }

    res.__repr__ = res.__str__ = function() {
        if (real == 0){return imag + 'j'}
        return '('+real+'+'+imag+'j)'
    }

    return res
}

complex.$dict = $ComplexDict
complex.__class__ = $B.$factory
$ComplexDict.$factory = complex

$B.builtins.complex = complex

})(__BRYTHON__)
