;(function($B){

var __builtins__ = $B.builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = object.$dict

// dictionary
function $DictClass($keys,$values){
    // JS dict objects are indexed by strings, not by arbitrary objects
    // so we must use 2 arrays, one for keys and one for values
    this.iter = null
    this.__class__ = $DictDict
    this.$keys = $keys // JS Array
    this.$values = $values // idem
}

var $DictDict = {__class__:$B.$type,
    __name__ : 'dict',
    $native:true
}

$DictDict.__add__ = function(self,other){
    var msg = "unsupported operand types for +:'dict' and "
    throw __builtins__.TypeError(msg+"'"+(__builtins__.str(other.__class__) || typeof other)+"'")
}

$DictDict.__bool__ = function (self) {return self.$keys.length>0}

$DictDict.__contains__ = function(self,item){
    if(self.$jsobj){return self.$jsobj[item]!==undefined}
    return __builtins__.list.$dict.__contains__(self.$keys,item)
}

$DictDict.__delitem__ = function(self,arg){
    // search if arg is in the keys
    for(var i=0;i<self.$keys.length;i++){
        if(getattr(arg,'__eq__')(self.$keys[i])){
            self.$keys.splice(i,1)
            self.$values.splice(i,1)
            if(self.$jsobj){delete self.$jsobj[arg]}
            return
        }
    }
    throw KeyError(__builtins__.str(arg))
}

$DictDict.__eq__ = function(self,other){
    if(other===undefined){ // compare self to class "dict"
        return self===dict
    }
    if(!isinstance(other,dict)){console.log('other is not dict');return False}
    if(other.$keys.length!==self.$keys.length){return False}
    for(var i=0;i<self.$keys.length;i++){
        var key = self.$keys[i]
        for(var j=0;j<other.$keys.length;j++){
            try{
                if(getattr(other.$keys[j],'__eq__')(key)){
                    if(!getattr(other.$values[j],'__eq__')(self.$values[i])){
                        return False
                    }
                }
            }catch(err){__BRYTHON__.$pop_exc()}
        }
    }
    return True
}

$DictDict.__getitem__ = function(self,arg){
    // search if arg is in the keys
    for(var i=0;i<self.$keys.length;i++){
        if(getattr(arg,'__eq__')(self.$keys[i])){return self.$values[i]}
    }
    throw KeyError(__builtins__.str(arg))
}

$DictDict.__hash__ = function(self) {throw __builtins__.TypeError("unhashable type: 'dict'");}

$DictDict.__init__ = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    self.$keys = []
    self.$values = []
    if(args.length==0){return}
    else if(args.length===1){
        var obj = args[0]
        if(isinstance(obj,dict)){
            self.$keys = obj.$keys
            self.$values = obj.$values
            return
        }
        else if(obj.__class__===__BRYTHON__.JSObject.$dict){
            // convert a JSObject into a Python dictionary
            var res = new $DictClass([],[])
            for(var attr in obj.js){
                $DictDict.__setitem__(res,attr,obj.js[attr])
            }
            self.$keys = res.$keys
            self.$values = res.$values
            self.$jsobj = obj.js // used to reflect changes in underlying JS object
            return
        }
    }
    var $ns=__BRYTHON__.$MakeArgs('dict',args,[],[],'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    if(args.length>0){ 
        if(isinstance(args[0],dict)){
            self.$keys = args[0].$keys
            self.$values = args[0].$values
        }else{
            // format dict([(k1,v1),(k2,v2)...])
            var iterable = iter(args[0])
            while(true){
                try{
                    var elt = next(iterable)
                    self.$keys.push(getattr(elt,'__getitem__')(0))
                    self.$values.push(getattr(elt,'__getitem__')(1))
                }catch(err){
                    if(err.__name__==='StopIteration'){__BRYTHON__.$pop_exc();break}
                    else{throw err}
                }
            }
        }
        return
    }else if(kw.$keys.length>0){ // format dict(k1=v1,k2=v2...)
        self.$keys = kw.$keys
        self.$values = kw.$values
    }
}

var $dict_iterator = $B.$iterator_class('dict iterator')
$DictDict.__iter__ = function(self){
    return $B.$iterator(self.$keys,$dict_iterator)
}

$DictDict.__len__ = function(self) {return self.$keys.length}

$DictDict.__mro__ = [$DictDict,$ObjectDict]

$DictDict.__ne__ = function(self,other){return !$DictDict.__eq__(self,other)}

$DictDict.__next__ = function(self){
    if(self.iter==null){self.iter==0}
    if(self.iter<self.$keys.length){
        self.iter++
        return self.$keys[self.iter-1]
    } else {
        self.iter = null
        throw __builtins__.StopIteration()
    }
}

$DictDict.__repr__ = function(self){
    if(self===undefined){return "<class 'dict'>"}
    //if(self.$keys.length==0){return '{}'}
    var res = "{",key=null,value=null,i=null        
    var qesc = new RegExp('"',"g") // to escape double quotes in arguments
    for(var i=0;i<self.$keys.length;i++){
        res += repr(self.$keys[i])+':'+repr(self.$values[i])
        if(i<self.$keys.length-1){res += ','}
    }
    return res+'}'
}

$DictDict.__setitem__ = function(self,key,value){
    for(var i=0;i<self.$keys.length;i++){
        try{
            if(getattr(key,'__eq__')(self.$keys[i])){ // reset value
                self.$values[i]=value
                return
            }
        }catch(err){ // if __eq__ throws an exception
            __BRYTHON__.$pop_exc()
        }
    }
    // create a new key/value
    self.$keys.push(key)
    self.$values.push(value)
    // if dict wraps a JS object, set its attribute
    if(self.$jsobj){self.$jsobj[key]=value}
}

$DictDict.__str__ = $DictDict.__repr__

$DictDict.clear = function(self){
    // Remove all items from the dictionary.
    self.$keys = []
    self.$values = []
    if(self.$jsobj){self.$jsobj={}}
}

$DictDict.copy = function(self){
    // Return a shallow copy of the dictionary
    var res = dict()
    for(var i=0;i<self.$keys.length;i++){
        res.$keys.push(self.$keys[i])
        res.$values.push(self.$values[i])
    }
    return res
}

$DictDict.get = function(self,key,_default){
    try{return $DictDict.__getitem__(self,key)}
    catch(err){
        __BRYTHON__.$pop_exc()
        if(_default!==undefined){return _default}
        else{return None}
    }
}

var $dict_itemsDict = $B.$iterator_class('dict_itemiterator')

$DictDict.items = function(self){
    var items = []
    for(var i=0;i<self.$keys.length;i++){
        items.push(__builtins__.tuple([self.$keys[i],self.$values[i]]))
    }
    return $B.$iterator(items,$dict_itemsDict)
}

$DictDict.fromkeys = function(keys,value){
    // class method
    if(value===undefined){value=__builtins__.None}
    var res = dict()
    var keys_iter = __builtins__.iter(keys)
    while(true){
        try{
            var key = __builtins__.next(keys_iter)
            $DictDict.__setitem__(res,key,value)
        }catch(err){
            if($B.is_exc(err,[__builtins__.StopIteration])){
                $B.$pop_exc()
                return res
            }else{
                throw err
            }
        }
    }
}

var $dict_keysDict = $B.$iterator_class('dict_keys')

$DictDict.keys = function(self){
    return $B.$iterator(self.$keys,$dict_keysDict)
}

$DictDict.pop = function(self,key,_default){
    try{
        var res = $DictDict.__getitem__(self,key)
        $DictDict.__delitem__(self,key)
        return res
    }catch(err){
        __BRYTHON__.$pop_exc()
        if(err.__name__==='KeyError'){
            if(_default!==undefined){return _default}
            throw err
        }else{throw err}
    }
}

$DictDict.popitem = function(self){
    if(self.$keys.length===0){throw KeyError("'popitem(): dictionary is empty'")}
    return __builtins__.tuple([self.$keys.pop(),self.$values.pop()])
}

$DictDict.setdefault = function(self,key,_default){
    try{return $DictDict.__getitem__(self,key)}
    catch(err){
        if(_default===undefined){_default=None}
        $DictDict.__setitem__(self,key,_default)
        return _default
    }
}

$DictDict.update = function(self){
    var params = []
    for(var i=1;i<arguments.length;i++){params.push(arguments[i])}
    var $ns=__BRYTHON__.$MakeArgs('$DictDict.update',params,[],[],'args','kw')
    var args = $ns['args']
    if(args.length>0 && isinstance(args[0],dict)){
        var other = args[0]
        for(var i=0;i<other.$keys.length;i++){
            $DictDict.__setitem__(self,other.$keys[i],other.$values[i])
        }
    }
    var kw = $ns['kw']
    var keys = kw.$keys
    for(var i=0;i<keys.length;i++){
        $DictDict.__setitem__(self,keys[i],kw.$values(keys[i]))
    }
}

var $dict_valuesDict = $B.$iterator_class('dict_values')

$DictDict.values = function(self){
    return $B.$iterator(self.$values,$dict_valuesDict)
}

function dict(){
    var res = {__class__:$DictDict}
    // apply __init__ with arguments of dict()
    var args = [res]
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    $DictDict.__init__.apply(null,args)
    return res
}
$B.$dict = dict // used for dict literals : "x={}" is translated to "x=__BRYTHON__.$dict()",
             // not to "x=dict()"
             // otherwise this would fail :
             // def foo(dict=None):
             //     x = {}
             // because inside the function, 'dict' has beeen set to the 
             // value of argument 'dict'
dict.__class__ = $B.$factory
dict.$dict = $DictDict
$DictDict.$factory = dict
$DictDict.__new__ = $B.$__new__(dict)

$B.builtins.dict = dict
})(__BRYTHON__)