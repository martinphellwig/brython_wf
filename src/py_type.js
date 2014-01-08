// generic code for class constructor
function $class_constructor(class_name,class_obj,parents,parents_names,kwargs){
    var cl_dict=__builtins__.dict(),bases=null
    // transform class object into a dictionary
    for(var attr in class_obj){
        __builtins__.dict.$dict.__setitem__(cl_dict,attr,class_obj[attr])
    }
    // check if parents are defined
    if(parents!==undefined){
        for(var i=0;i<parents.length;i++){
            if(parents[i]===undefined){
                // restore the line of class definition
                __BRYTHON__.line_info = class_obj.$def_line
                throw NameError("name '"+parents_names[i]+"' is not defined")
            }
        }
    }
    bases = parents
    if(bases.indexOf(__builtins__.object)==-1){
        bases=bases.concat(__builtins__.tuple([__builtins__.object]))
    }
    // see if there is 'metaclass' in kwargs
    var metaclass = __builtins__.type
    for(var i=0;i<kwargs.length;i++){
        var key=kwargs[i][0],val=kwargs[i][1]
        if(key=='metaclass'){metaclass=val}
    }
    if(metaclass===__builtins__.type){
        // see if one of the subclasses uses a metaclass
        for(var i=0;i<parents.length;i++){
            if(parents[i].$dict.__class__!==$type){
                metaclass = parents[i].__class__.$factory
                break
            }
        }
    }
    if(metaclass===__builtins__.type){return __builtins__.type(class_name,bases,cl_dict)}
    else{
        // create the factory function
        var factory = (function(_class){
                return function(){
                    return $instance_creator(_class).apply(null,arguments)
                }
            })(class_dict)
        var new_func = __builtins__.getattr(metaclass,'__new__')
        var factory = __builtins__.getattr(metaclass,'__new__').apply(null,[factory,class_name,bases,cl_dict])
        __builtins__.getattr(metaclass,'__init__').apply(null,[factory,class_name,bases,cl_dict])
        // set functions defined in metaclass dictionary as class methods, except __new__
        for(var member in metaclass.$dict){
            if(typeof metaclass.$dict[member]=='function' && member != '__new__'){
                metaclass.$dict[member].$type='classmethod'
            }
        }
        factory.__class__ = {toString:function(){return '<'+metaclass.$dict+'>'},
            __class__:$type,
            $factory:metaclass,
            is_class:true,
            __mro__:metaclass.$dict.__mro__
        }
        factory.$dict.__class__ = metaclass.$dict
        return factory
    }
}

__builtins__.type = function(name,bases,cl_dict){
    // if called with a single argument, returns the class of the first argument
    if(arguments.length==1){return name.__class__.$factory}

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
        if(bases[i]===__builtins__.str){bases[i] = $StringSubclassFactory}
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
    
    // type() returns the factory function  
    return factory
}

// class of classes
var $type = {__class__:$type,__name__:'type'}

$type.__new__ = function(self,name,bases,dct){
    return __builtins__.type(name,bases,dct)
}

$type.__init__ = function(self,name,bases,dct){}

$type.__mro__ = [$type,__builtins__.object.$dict]

$type.$factory = __builtins__.type
__builtins__.type.$dict = $type

// class of constructors
$factory = {toString:function(){return '<factory>'},
    __class__:$type,
    $factory:__builtins__.type,
    is_class:true
}
$factory.__mro__ = [$factory,$type]

// this could not be done before $type and $factory are defined
__builtins__.object.$dict.__class__ = $type
__builtins__.object.__class__ = $factory

$type.__class__ = $type
$type.__getattribute__=function(klass,attr){
    // klass is a class dictionary : in getattr(obj,attr), if obj is a factory,
    // we call $type.__getattribute__(obj.$dict,attr)
    if(attr==='__call__'){return $instance_creator(klass)}
    else if(attr==='__eq__'){return function(other){return klass.$factory===other}}
    else if(attr==='__repr__'){return function(){return "<class '"+klass.__name__+"'>"}}
    else if(attr==='__str__'){return function(){return "<class '"+klass.__name__+"'>"}}
    else if(attr==='__class__'){return klass.__class__.$factory}
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
    //if(attr=='__abstractmethods__'){console.log(klass.__name__+' direct attr '+attr+' '+res)}
    if(res===undefined){
        // search in classes hierarchy, following method resolution order
        var mro = klass.__mro__
        if(mro===undefined){console.log('mro undefined for class '+klass+' name '+klass.__name__)}
        //if(attr=='register'){console.log('mro '+mro+' is class '+klass.is_class)}
        for(var i=0;i<mro.length;i++){
            var v=mro[i][attr]
            if(v!==undefined){
                res = v
                break
            }
        }
        if(res===undefined){
            // try in klass class
            var cl_mro = klass.__class__.__mro__
            if(cl_mro!==undefined){
                for(var i=0;i<cl_mro.length;i++){
                    var v=cl_mro[i][attr]
                    if(v!==undefined){
                        res = v
                        break
                    }
                }
            }
        }
    }
    if(res!==undefined){
            if(res.__get__!==undefined){ // descriptor
            // __new__ is a static method
            if(attr=='__new__'){res.$type='staticmethod'}
            res1 = res.__get__.apply(null,[res,__builtins__.None,klass])
            var args
            if(typeof res1=='function'){
                res.__name__ = attr
                // method
                var __self__,__func__,__repr__,__str__
                if(res.$type===undefined || res.$type==='function' || res.$type==='instancemethod'){
                    // function called from a class
                    args = []
                    __repr__ = __str__ = function(){
                        return '<unbound method '+klass.__name__+'.'+attr+'>'
                    }
                }else if(res.$type==='classmethod'){
                    // class method : called with the class as first argument
                    args = [klass.$factory]
                    __self__ = klass
                    __func__ = res1
                    __repr__ = __str__ = function(){
                        var x = '<bound method '+klass.__name__+'.'+attr
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

                // return a method that adds initial args to the function
                // arguments
                var method = (function(initial_args){
                    return function(){
                        // class method
                        // make a local copy of initial args
                        //console.log('function '+attr+' of '+klass.__name__+' '+res)
                        var local_args = initial_args.slice()
                        for(var i=0;i < arguments.length;i++){
                            local_args.push(arguments[i])
                        }
                        return res.apply(null,local_args)
                    }})(args)
                method.__class__ = {
                    __class__:$type,
                    __name__:'method',
                    __mro__:[__builtins__.object.$dict]
                }
                method.__func__ = __func__
                method.__repr__ = __repr__
                method.__self__ = __self__
                method.__str__ = __str__
                method.im_class = klass
                return method
            }
        }else{
            return res
        }
    }else{
        // search __getattr__
        //throw AttributeError("type object '"+klass.__name__+"' has no attribute '"+attr+"'")
    }
}
$type.__mro__ = [$type,__builtins__.object.$dict]
$type.__name__ = 'type'
$type.__str__ = function(){return "<class 'type'>"}
$type.toString = $type.__str__

function $instance_creator(klass){
    // return the function to initalise a class instance
    var getattr = __builtins__.getattr
    return function(){
        var new_func=null,init_func=null,obj
        // apply __new__ to initialize the instance
        try{
            new_func = getattr(klass,'__new__')
        }catch(err){__BRYTHON__.$pop_exc()}
        if(new_func!==null){
            var args = [klass.$factory]
            for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
            obj = new_func.apply(null,args)
        }
        // __initialized__ is set in object.__new__ if klass has a method __init__
        if(!obj.__initialized__){
            try{init_func = getattr(klass,'__init__')}
            catch(err){__BRYTHON__.$pop_exc()}
            if(init_func!==null){
                var args = [obj]
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                init_func.apply(null,args)
            }
        }
        return obj
    }
}

// used as the factory for method objects
function $MethodFactory(){}
$MethodFactory.__name__ = 'method'
$MethodFactory.__class__ = $factory
$MethodFactory.__repr__ = $MethodFactory.__str__ = $MethodFactory.toString = function(){return 'method'}

$MethodDict = {__class__:$type,
    __name__:'method',
    __mro__:[__builtins__.object.$dict],
    $factory:$MethodFactory
}
$MethodFactory.$dict = $MethodDict



