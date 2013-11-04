
// dictionary
function $DictClass($keys,$values){
    // JS dict objects are indexed by strings, not by arbitrary objects
    // so we must use 2 arrays, one for keys and one for values
    this.iter = null
    this.__class__ = $DictDict
    this.$keys = $keys // JS Array
    this.$values = $values // idem
}

$DictDict = {__class__:$type,
    __name__ : 'dict',
    __repr__ : function(){return "<class 'dict'>"},
    __str__ : function(){return "<class 'dict'>"},
    toString : function(){return "$DictDict"}
}

$DictDict.__add__ = function(self,other){
    var msg = "unsupported operand types for +:'dict' and "
    throw TypeError(msg+"'"+(str(other.__class__) || typeof other)+"'")
}

$DictDict.__bool__ = function (self) {return self.$keys.length>0}

$DictDict.__contains__ = function(self,item){
    return $ListDict.__contains__(self.$keys,item)
}

$DictDict.__delitem__ = function(self,arg){
    // search if arg is in the keys
    for(var i=0;i<self.$keys.length;i++){
        if(getattr(arg,'__eq__')(self.$keys[i])){
            self.$keys.splice(i,1)
            self.$values.splice(i,1)
            return
        }
    }
    throw KeyError(str(arg))
}

$DictDict.__eq__ = function(self,other){
    if(other===undefined){ // compare self to class "dict"
        return self===dict
    }
    if(!isinstance(other,dict)){console.log('other is not dict');return False}
    if(other.$keys.length!==self.$keys.length){return False}
    for(var i=0;i<self.$keys.length;i++){
        var key = self.$keys[i]
        for(j=0;j<other.$keys.length;j++){
            try{
                if(getattr(other.$keys[j],'__eq__')(key)){
                    if(!getattr(other.$values[j],'__eq__')(self.$values[i])){
                        return False
                    }
                }
            }catch(err){$pop_exc()}
        }
    }
    return True
}

$DictDict.__getattribute__ = function(self,attr){
    var res = $DictDict[attr]
    if(res===undefined){
        throw AttributeError("'dict' object has no attribute '"+attr+"'")
    }else if(typeof res==='function'){
        var method = function(){
            var args = [self]
            for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
            return res.apply(null,args)
        }
        method.__repr__ = function(){return '<built-in method '+attr+' of dict object>'}
        method.__str__ = method.toString = method.__repr__
        return method
    }else{
        return res
    }
}

$DictDict.__getitem__ = function(self,arg){
    // search if arg is in the keys
    for(var i=0;i<self.$keys.length;i++){
        if(getattr(arg,'__eq__')(self.$keys[i])){return self.$values[i]}
    }
    throw KeyError(str(arg))
}

$DictDict.__hash__ = function(self) {throw TypeError("unhashable type: 'dict'");}

$DictDict.__in__ = function(self,item){return getattr(item,'__contains__')(self)}

$dict_iterator = $iterator_class('dict iterator')

$DictDict.__iter__ = function(self){
    return $iterator(self.$keys,$dict_iterator)
}

$DictDict.__len__ = function(self) {return self.$keys.length}

$DictDict.__mro__ = [$DictDict,$ObjectDict]

$DictDict.__ne__ = function(self,other){return !$DictDict.__eq__(self,other)}

$DictDict.__new__ = function(arg){return dict(arg)}

$DictDict.__next__ = function(self){
    if(self.iter==null){self.iter==0}
    if(self.iter<self.$keys.length){
        self.iter++
        return self.$keys[self.iter-1]
    } else {
        self.iter = null
        throw StopIteration()
    }
}

$DictDict.__not_in__ = function(self,item){return !$DictDict.__in__(self,item)}

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
            $pop_exc()
        }
    }
    // create a new key/value
    self.$keys.push(key)
    self.$values.push(value)
}

$DictDict.__str__ = $DictDict.__repr__

$DictDict.clear = function(self){
    // Remove all items from the dictionary.
    self.$keys = []
    self.$values = []
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
        $pop_exc()
        if(_default!==undefined){return _default}
        else{return None}
    }
}

$dict_itemsDict = $iterator_class('dict_itemiterator')

$DictDict.items = function(self){
    return $iterator(zip(self.$keys,self.$values),$dict_itemsDict)
}

$dict_keysDict = $iterator_class('dict_keys')

$DictDict.keys = function(self){
    return $iterator(self.$keys,$dict_keysDict)
}

$DictDict.pop = function(self,key,_default){
    try{
        var res = $DictDict.__getitem__(self,key)
        $DictDict.__delitem__(self,key)
        return res
    }catch(err){
        $pop_exc()
        if(err.__name__==='KeyError'){
            if(_default!==undefined){return _default}
            throw err
        }else{throw err}
    }
}

$DictDict.popitem = function(self){
    if(self.$keys.length===0){throw KeyError("'popitem(): dictionary is empty'")}
    return tuple([self.$keys.pop(),self.$values.pop()])
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
    var $ns=$MakeArgs('$DictDict.update',params,[],{},'args','kw')
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

$dict_valuesDict = $iterator_class('dict_values')

$DictDict.values = function(self){
    return $iterator(self.$values,$dict_valuesDict)
}

function dict(){
    if(arguments.length==0){return new $DictClass([],[])}
    else if(arguments.length===1){
        var obj = arguments[0]
        if(isinstance(obj,dict)){return obj}
        else if(isinstance(obj,JSObject)){
            // convert a JSObject into a Python dictionary
            var res = new $DictClass([],[])
            for(var attr in obj.js){
                res.__setitem__(attr,obj.js[attr])
            }
            return res
        }
    }
    var $ns=$MakeArgs('dict',arguments,[],{},'args','kw')
    var args = $ns['args']
    var kw = $ns['kw']
    if(args.length>0){ // format dict([(k1,v1),(k2,v2)...])
        var iterable = iter(args[0])
        var obj = {__class__:$DictDict,$keys:[],$values:[]}
        while(true){
            try{
                var elt = next(iterable)
                obj.$keys.push(getattr(elt,'__getitem__')(0))
                obj.$values.push(getattr(elt,'__getitem__')(1))
            }catch(err){
                if(err.__name__==='StopIteration'){$pop_exc();break}
                else{throw err}
            }
        }
        return obj
    }else if(kw.$keys.length>0){ // format dict(k1=v1,k2=v2...)
        return kw
    }
}
dict.__class__ = $factory
dict.$dict = $DictDict
$DictDict.$factory = dict
