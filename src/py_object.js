// A function that builds the __new__ method for the factory function
__BRYTHON__.$__new__ = function(factory){
    return function(cls){
        if(cls===undefined){
            throw __BRYTHON__.builtins.TypeError(factory.$dict.__name__+'.__new__(): not enough arguments')
        }
        var res = factory.apply(null,[])
        res.__class__ = cls.$dict
        var init_func = null
        try{init_func = __BRYTHON__.builtins.getattr(res,'__init__')}
        catch(err){__BRYTHON__.$pop_exc()}
        if(init_func!==null){
            var args = []
            for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
            init_func.apply(null,args)
            res.__initialized__ = true
        }
        return res
    }
}

__BRYTHON__.builtins.object = (function($B){


// class object for the built-in class 'object'
var $ObjectDict = {
    //__class__:$type, : not here, added in py_type.js after $type is defined
    __name__:'object',
    $native:true
}

// function used to generate the methods that return 'unorderable types'
var $ObjectNI = function(name,op){
    return function(other){
        throw $B.builtins.TypeError('unorderable types: object() '+op+' '+$B.builtins.str(other.__class__.__name__)+'()')
    }
}

$ObjectDict.__delattr__ = function(self,attr){delete self[attr]}

$ObjectDict.__dir__ = function(self) {
    var res = []

    var objects = [self]
    var mro = self.__class__.__mro__
    for (var i=0; i<mro.length; i++) {
        objects.push(mro[i])
    }
    for (var i=0; i<objects.length; i++) {
        for(var attr in objects[i]){
            if(attr.charAt(0)!=='$'){
                res.push(attr)
            }
        }
    }
    res = $B.builtins.list($B.builtins.set(res))
    res.sort()
    return res
}

$ObjectDict.__eq__ = function(self,other){
    // equality test defaults to identity of objects
    return self===other
}

$ObjectDict.__ge__ = $ObjectNI('__ge__','>=')

$ObjectDict.__getattribute__ = function(obj,attr){
    var klass = $B.get_class(obj)
    if(attr==='__class__'){
        return klass.$factory
    }
    var res = obj[attr],args=[]

    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        //if(attr=='show'){console.log('object getattr '+attr+' of obj '+obj)}
        var mro = klass.__mro__
        for(var i=0;i<mro.length;i++){
            var v=mro[i][attr]
            if(v!==undefined){
                res = v
                break
            }
        }
    }else{
        if(res.__set__===undefined){
            // For non-data descriptors, the attribute found in object 
            // dictionary takes precedence
            return res
        }
    }

    if(res!==undefined){
        var get_func = res.__get__
        if(get_func===undefined && (typeof res=='function')){
            get_func = function(x){return x}
        }
        if(get_func!==undefined){ // descriptor
            res.__name__ = attr
            // __new__ is a static method
            if(attr=='__new__'){res.$type='staticmethod'}
            var res1 = get_func.apply(null,[res,obj,klass])
            if(typeof res1=='function'){
                // If attribute is a class then return it unchanged
                //
                // Example :
                // ===============
                // class A:
                //    def __init__(self,x):
                //        self.x = x
                //
                // class B:
                //    foo = A
                //    def __init__(self):
                //        self.info = self.foo(18)
                //
                // B()
                // ===============
                // In class B, when we call self.foo(18), self.foo is the
                // class A, its method __init__ must be called without B's
                // self as first argument
    
                if(res1.__class__===$B.$factory){return res}

                // instance method object
                var __self__,__func__,__repr__,__str__
                if(res.$type===undefined || res.$type=='function'){
                    // the attribute is a function : return an instance method,
                    // called with the instance as first argument
                    args = [obj]
                    __self__ = obj
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method '+attr
                        x += " of '"+klass.__name__+"' object>"
                        return x
                    }

                }else if(res.$type==='instancemethod'){
                    // The attribute is a method of an instance of another class
                    // Return it unchanged
                    return res

                }else if(res.$type==='classmethod'){
                    // class method : called with the class as first argument
                    args = [klass]
                    __self__ = klass
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method type'+'.'+attr
                        x += ' of '+klass.__name__+'>'
                        return x
                    }

                }else if(res.$type==='staticmethod'){
                    // static methods have no __self__ or __func__
                    args = []
                    __repr__ = __str__ = function(){
                        return '<function '+klass.__name__+'.'+attr+'>'
                    }
                }

                // build the instance method, called with a list of arguments
                // depending on the method type
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        for(var i=0;i<arguments.length;i++){
                            local_args.push(arguments[i])
                        }
                        var x = res.apply(obj,local_args)
                        if(x===undefined){return $B.builtins.None}else{return x}
                    }})(args)
                method.__class__ = __BRYTHON__.$InstanceMethodDict
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                method.__doc__ = res.__doc__ || ''
                method.$type = 'instancemethod'
                return method
            }else{
                // result of __get__ is not a function
                return res1
            }
        }
        // attribute is not a descriptor : return it unchanged
        return res
    }else{
        // search __getattr__
        var _ga = obj['__getattr__']
        if(_ga===undefined){
            var mro = klass.__mro__
            if(mro===undefined){console.log('in getattr mro undefined for '+obj)}
            for(var i=0;i<mro.length;i++){
                var v=mro[i]['__getattr__']
                if(v!==undefined){
                    _ga = v
                    break
                }
            }
        }
        if(_ga!==undefined){
            try{return _ga(obj,attr)}
            catch(err){void(0)}
        }
        //throw AttributeError('object '+obj.__class__.__name__+" has no attribute '"+attr+"'")
    }
}

$ObjectDict.__gt__ = $ObjectNI('__gt__','>')

$ObjectDict.__hash__ = function (self) { 
    $B.$py_next_hash+=1; 
    return $B.$py_next_hash;
}

$ObjectDict.__le__ = $ObjectNI('__le__','<=')

$ObjectDict.__lt__ = $ObjectNI('__lt__','<')

$ObjectDict.__mro__ = [$ObjectDict]

$ObjectDict.__new__ = function(cls){
    if(cls===undefined){throw $B.builtins.TypeError('object.__new__(): not enough arguments')}
    var obj = new Object()
    obj.__class__ = cls.$dict
    return obj
}

$ObjectDict.__ne__ = function(self,other){return self!==other}

$ObjectDict.__or__ = function(self,other){
    if($B.builtins.bool(self)){return self}else{return other}
}

$ObjectDict.__repr__ = function(self){
    if(self===object){return "<class 'object'>"}
    else if(self===undefined){return "<class 'object'>"}
    else if(self.__class__===$B.$type){return "<class '"+self.__class__.__name__+"'>"}
    else{return "<"+self.__class__.__name__+" object>"}
}

$ObjectDict.__setattr__ = function(self,attr,val){
    if(val===undefined){ // setting an attribute to 'object' type is not allowed
        throw $B.builtins.TypeError("can't set attributes of built-in/extension type 'object'")
    }else if(self.__class__===$ObjectDict){
        // setting an attribute to object() is not allowed
        if($ObjectDict[attr]===undefined){
            throw $B.builtins.AttributeError("'object' object has no attribute '"+attr+"'")
        }else{
            throw $B.builtins.AttributeError("'object' object attribute '"+attr+"' is read-only")
        }
    }
    self[attr]=val
}
$ObjectDict.__setattr__.__str__ = function(){return 'method object.setattr'}

$ObjectDict.__str__ = $ObjectDict.__repr__

$ObjectDict.toString = $ObjectDict.__repr__ //function(){return '$ObjectDict'}

// constructor of the built-in class 'object'
function object(){
    return {__class__:$ObjectDict}
}
object.$dict = $ObjectDict
// object.__class__ = $factory : this is done in py_types
$ObjectDict.$factory = object

return object

})(__BRYTHON__)
