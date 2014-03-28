;(function($B){
var __builtins__ = $B.builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = __builtins__.object.$dict

var $LocationDict = {__class__:$B.$type,
    __name__:'Location'
}
$LocationDict.__mro__ = [$LocationDict,$ObjectDict]

function $Location(){ // used because of Firefox bug #814622
    var obj = {}
    for(var x in window.location){
        if(typeof window.location[x]==='function'){
            obj[x] = (function(f){
                return function(){
                    return f.apply(window.location,arguments)
                }
              })(window.location[x])
        }else{
            obj[x]=window.location[x]
        }
    }
    if(obj['replace']===undefined){ // IE
        obj['replace'] = function(url){window.location = url}
    }
    obj.__class__ = $LocationDict
    obj.toString = function(){return window.location.toString()}
    obj.__repr__ = obj.__str__ = obj.toString
    return obj
}

$LocationDict.$factory = $Location
$Location.$dict = $LocationDict

// transforms a Javascript constructor into a Python function
// that returns instances of the constructor, converted to Python objects
function $applyToConstructor(constructor, argArray) {
    var args = [null].concat(argArray);
    var factoryFunction = constructor.bind.apply(constructor, args);
    return new factoryFunction();
}

var $JSConstructorDict = {
    __class__:$B.$type,
    __name__:'JSConstructor'
}

$JSConstructorDict.__call__ = function(self){
    // this.js is a constructor
    // it takes Javascript arguments so we must convert
    // those passed to the Python function
    var args = []
    for(var i=1;i<arguments.length;i++){
        var arg = arguments[i]
        if(arg && (arg.__class__===$JSObjectDict || arg.__class__===$JSConstructorDict)){
            args.push(arg.js)
        }
        else if(isinstance(arg,__builtins__.dict)){
            var obj = new Object()
            for(var j=0;j<arg.$keys.length;j++){
                obj[arg.$keys[j]]=arg.$values[j].js || arg.$values[j]
            }
            args.push(obj)
        }else{args.push(arg)}
    }
    var res = $applyToConstructor(self.js,args)
    // res is a Javascript object
    return $B.$JS2Py(res)
}

$JSConstructorDict.__mro__ = [$JSConstructorDict,$ObjectDict]

function JSConstructor(obj){
    return {
        __class__:$JSConstructorDict,
        js:obj
    }
}
JSConstructor.__class__ = $B.$factory
JSConstructor.$dict = $JSConstructorDict
$JSConstructorDict.$factory = JSConstructor

// JSObject : wrapper around a native Javascript object

var $JSObjectDict = {
    __class__:$B.$type,
    __name__:'JSObject',
    toString:function(){return '(JSObject)'}
}

$JSObjectDict.__bool__ = function(self){
    return (new Boolean(self.js)).valueOf()
}

$JSObjectDict.__getattribute__ = function(obj,attr){
    if(attr.substr(0,2)=='$$'){attr=attr.substr(2)}
    if(obj.js===null){return $ObjectDict.__getattribute__(None,attr)}
    if(attr==='__class__'){return $JSObjectDict}
    if(attr=="bind" && obj.js[attr]===undefined &&
        obj.js['addEventListener']!==undefined){attr='addEventListener'}
        
    if(obj.js[attr] !== undefined){
        if(attr=="bind"){console.log('attr '+attr+' in js obj')}
        if(typeof obj.js[attr]=='function'){
            // If the attribute of a JSObject is a function F, it is converted to a function G
            // where the arguments passed to the Python function G are converted to Javascript
            // objects usable by the underlying function F
            var res = function(){
                var args = [],arg
                for(var i=0;i<arguments.length;i++){
                    arg = arguments[i]
                    if(arg && (arg.__class__===$JSObjectDict || arg.__class__===$JSConstructorDict)){
                        // instances of JSObject and JSConstructor are transformed into the
                        // underlying Javascript object
                        args.push(arg.js)
                    }else if(arg && arg.__class__===$B.DOMNode){
                        // instances of DOMNode are transformed into the underlying DOM element
                        args.push(arg.elt)
                    }else if(arg && arg.__class__===$B.builtins.dict.$dict){
                        // Python dictionaries are transformed into a Javascript object
                        // whose attributes are the dictionary keys
                        var jsobj = {}
                        for(var j=0;j<arg.$keys.length;j++){
                            jsobj[arg.$keys[j]]=arg.$values[j].js || arg.$values[j]
                        }
                        args.push(jsobj)
                    }else if(arg && arg.__class__===$B.builtins.float.$dict){
                        // Python floats are converted to the underlying value
                        args.push(arg.value)
                    }else{
                        // other types are left unchanged
                        args.push(arg)
                    }
                }
                var res = obj.js[attr].apply(obj.js,args)
                if(typeof res == 'object'){return JSObject(res)}
                else if(res===undefined){return None}
                else{return __BRYTHON__.$JS2Py(res)}
            }
            res.__repr__ = function(){return '<function '+attr+'>'}
            res.__str__ = function(){return '<function '+attr+'>'}
            return res
        }else{
            return __BRYTHON__.$JS2Py(obj.js[attr])
        }
    }else if(obj.js===window && attr==='$$location'){
        // special lookup because of Firefox bug 
        // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
        return $Location()
    }
    
    var res
    // search in classes hierarchy, following method resolution order
    var mro = [$JSObjectDict,$ObjectDict]
    for(var i=0;i<mro.length;i++){
        var v=mro[i][attr]
        if(v!==undefined){
            res = v
            break
        }
    }
    if(res!==undefined){
        if(typeof res==='function'){
            // res is the function in one of parent classes
            // return a function that takes obj as first argument
            return function(){
                var args = [obj],arg
                for(var i=0;i<arguments.length;i++){
                    arg = arguments[i]
                    if(arg && (arg.__class__===$JSObjectDict || arg.__class__===$JSConstructorDict)){
                        args.push(arg.js)
                    }else{
                        args.push(arg)
                    }
                }
                return res.apply(obj,args)
            }
        }
        return __BRYTHON__.$JS2Py(res)
    }else{
        // XXX search __getattr__
        throw __builtins__.AttributeError("no attribute "+attr+' for '+this)
    }

}

$JSObjectDict.__getitem__ = function(self,rank){
    try{return getattr(self.js,'__getitem__')(rank)}
    catch(err){
        if(self.js[rank]!==undefined){return JSObject(self.js[rank])}
        else{throw __builtins__.AttributeError(self+' has no attribute __getitem__')}
    }
}

var $JSObject_iterator = $B.$iterator_class('JS object iterator')
$JSObjectDict.__iter__ = function(self){
    return $B.$iterator(self.js,$JSObject_iterator)
}

$JSObjectDict.__len__ = function(self){
    try{return getattr(self.js,'__len__')()}
    catch(err){
        console.log('err in JSObject.__len__ : '+err)
        throw __builtins__.AttributeError(this+' has no attribute __len__')
    }
}

$JSObjectDict.__mro__ = [$JSObjectDict,$ObjectDict]

$JSObjectDict.__repr__ = function(self){return "<JSObject wraps "+self.js.toString()+">"}

$JSObjectDict.__setattr__ = function(self,attr,value){
    if(isinstance(value,JSObject)){
        self.js[attr]=value.js
    }else{
        self.js[attr]=value
    }
}

$JSObjectDict.__setitem__ = $JSObjectDict.__setattr__

$JSObjectDict.__str__ = $JSObjectDict.__repr__

function JSObject(obj){
    var klass = $B.get_class(obj)
    if(klass===__builtins__.list.$dict){
        // JS arrays not created by list() must be wrapped
        if(obj.__brython__){return obj}
        else{return {__class__:$JSObjectDict,js:obj}}
    }
    // If obj is a Python object, return it unchanged
    if(klass!==undefined){return obj}
    // else wrap it
    return {__class__:$JSObjectDict,js:obj}
}
JSObject.__class__ = $B.$factory
JSObject.$dict = $JSObjectDict
$JSObjectDict.$factory = JSObject

$B.JSObject = JSObject
$B.JSConstructor = JSConstructor
})(__BRYTHON__)
