// class object for the built-in class 'object'
$ObjectDict = {}

// function used to generate the methods that return 'unorderable types'
var $ObjectNI = function(name,op){
    return function(other){
        throw TypeError('unorderable types: object() '+op+' '+str(other.__class__.__name__)+'()')
    }
}

$ObjectDict.__class__ = $type

$ObjectDict.__delattr__ = function(self,attr){delete self[attr]}

$ObjectDict.__eq__ = function(self,other){
    // equality test defaults to identity of objects
    return self===other
}

$ObjectDict.__ge__ = $ObjectNI('__ge__','>=')

$ObjectDict.__getattribute__ = function(obj,attr){
    //if(attr=='$$delete'){console.log('object getattr '+attr+' of obj '+obj)}
    if(attr==='__class__'){
        return obj.__class__.$factory
    }
    var res = obj[attr],args=[]
    if(obj.$dict!==undefined && obj.$dict[attr]!==undefined){
        res=obj.$dict[attr]
    }
    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        var mro = type(obj).__mro__
        for(var i=0;i<mro.length;i++){
            var v=mro[i][attr]
            if(v!==undefined){
                res = v
                break
            }
        }
    }
    if(res!==undefined){
        //if(attr=='calc_v'){console.log('found res '+res+' descriptor '+(res.__get__!==undefined))}
        if(res.__get__!==undefined){ // descriptor
            res.__name__ = attr
            // __new__ is a static method
            if(attr=='__new__'){res.$type='staticmethod'}
            res1 = res.__get__.apply(null,[res,obj,type(obj)])
            if(res1.__class__===Function){
                // instance method object
                var __self__,__func__,__repr__,__str__
                if(res.$type===undefined || res.$type==='instancemethod'){
                    // instance method : called with the instance as first 
                    // argument
                    args = [obj]
                    __self__ = obj
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method '+type(obj).__name__+'.'+attr
                        x += ' of '+str(obj)+'>'
                        return x
                    }
                }else if(res.$type==='function'){
                    // module level function
                    return res
                }else if(res.$type==='classmethod'){
                    // class method : called with the class as first argument
                    args = [type(obj)]
                    __self__ = type(obj)
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method type'+'.'+attr
                        x += ' of '+str(type(obj))+'>'
                        return x
                    }
                }else if(res.$type==='staticmethod'){
                    // static methods have no __self__ or __func__
                    args = []
                    __repr__ = __str__ = function(){
                        return '<function '+type(obj).__name__+'.'+attr+'>'
                    }
                }
                var method = (function(initial_args){
                    return function(){
                        // make a local copy of initial args
                        var local_args = initial_args.slice()
                        for(var i=0;i<arguments.length;i++){
                            local_args.push(arguments[i])
                        }
                        var x = res.apply(obj,local_args)
                        if(x===undefined){return None}else{return x}
                    }})(args)
                    method.__class__ = {
                    __class__:$type,
                    __name__:'method',
                    __mro__:[object]
                }
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                return method
            }else{
                return res1
            }
        }
        return res
    }else{
        // XXX search __getattr__
        var _ga = obj['__getattr__']
        if(_ga===undefined){
            var mro = type(obj).__mro__
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
        throw AttributeError('object '+obj.__class__.__name__+" has no attribute '"+attr+"'")
    }
}

$ObjectDict.__gt__ = $ObjectNI('__gt__','>')

$ObjectDict.__hash__ = function (self) { 
    __BRYTHON__.$py_next_hash+=1; 
    return __BRYTHON__.$py_next_hash;
}

$ObjectDict.__in__ = function(self,other){
    return getattr(other,'__contains__')(self)
}

$ObjectDict.__le__ = $ObjectNI('__le__','<=')

$ObjectDict.__lt__ = $ObjectNI('__lt__','<')

$ObjectDict.__mro__ = [$ObjectDict]

$ObjectDict.__name__ = 'object'

$ObjectDict.__new__ = function(cls){
    //console.log('new object of type '+cls.__name__)
    var obj = new Object()
    obj.__class__ = cls
    return obj
}

$ObjectDict.__ne__ = function(self,other){return self!==other}

$ObjectDict.__repr__ = function(self){
    if(self===object){return "<class 'object'>"}
    else if(self.__class__===$type){return "<class '"+self.__class__.__name__+"'>"}
    else{return "<"+self.__class__.__name__+" object>"}
}

//$ObjectDict.__setattr__ = function(self,attr,val){console.log('object setattr');self[attr]=val}

$ObjectDict.__str__ = $ObjectDict.__repr__

$ObjectDict.toString = function(){return '$ObjectDict'}

// constructor of the built-in class 'object'
function object(){
    var obj = new Object()
    obj.__class__ = $ObjectDict
    return obj
}
object.$dict = $ObjectDict
object.__class__ = $factory

