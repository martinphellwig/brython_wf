;(function($B){

var __builtins__ = $B.builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = object.$dict

function $list(){
    // used for list displays
    // different from list : $list(1) is valid (matches [1])
    // but list(1) is invalid (integer 1 is not iterable)
    var args = new Array()
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    return new $ListDict(args)
}

var $ListDict = {__class__:$B.$type,__name__:'list',$native:true}

$ListDict.__add__ = function(self,other){
    var res = self.valueOf().concat(other.valueOf())
    if(isinstance(self,tuple)){res = tuple(res)}
    return res
}

$ListDict.__contains__ = function(self,item){
    for(var i=0;i<self.length;i++){
        try{if(getattr(self[i],'__eq__')(item)){return true}
        }catch(err){__BRYTHON__.$pop_exc();void(0)}
    }
    return false
}

$ListDict.__delitem__ = function(self,arg){
    if(isinstance(arg,__builtins__.int)){
        var pos = arg
        if(arg<0){pos=self.length+pos}
        if(pos>=0 && pos<self.length){
            self.splice(pos,1)
            return
        }
        else{throw __builtins__.IndexError('list index out of range')}
    } else if(isinstance(arg,slice)) {
        var start = arg.start;if(start===None){start=0}
        var stop = arg.stop;if(stop===None){stop=self.length}
        var step = arg.step || 1
        if(start<0){start=self.length+start}
        if(stop<0){stop=self.length+stop}
        var res = [],i=null
        if(step>0){
            if(stop>start){
                for(var i=start;i<stop;i+=step){
                    if(self[i]!==undefined){res.push(i)}
                }
            }
        } else {
            if(stop<start){
                for(var i=start;i>stop;i+=step.value){
                    if(self[i]!==undefined){res.push(i)}
                }
                res.reverse() // must be in ascending order
            }
        }
        // delete items from left to right
        for(var i=res.length-1;i>=0;i--){
            self.splice(res[i],1)
        }
        return
    } else {
        throw __builtins__.TypeError('list indices must be integer, not '+__builtins__.str(arg.__class__))
    }
}

$ListDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "list"
        return self===list
    }
    if($B.get_class(other)===$B.get_class(self)){
        if(other.length==self.length){
            for(var i=0;i<self.length;i++){
                if(!getattr(self[i],'__eq__')(other[i])){return False}
            }
            return True
        }
    }
    return False
}

$ListDict.__getitem__ = function(self,arg){
    if(isinstance(arg,__builtins__.int)){
        var items=self.valueOf()
        var pos = arg
        if(arg<0){pos=items.length+pos}
        if(pos>=0 && pos<items.length){return items[pos]}
        else{
            throw __builtins__.IndexError('list index out of range')
        }
    } else if(isinstance(arg,slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? self.length : arg.stop
        }else{
            var start = arg.start===None ? self.length-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0){start=__builtins__.int(self.length+start)}
        if(stop<0){stop=self.length+stop}
        var res = [],i=null,items=self.valueOf()
        if(step>0){
            if(stop<=start){return res}
            else {
                for(var i=start;i<stop;i+=step){
                    if(items[i]!==undefined){res.push(items[i])}
                    else {res.push(None)}
                }
                return res
            }
        } else {
            if(stop>=start){return res}
            else {
                for(var i=start;i>=stop;i+=step){
                    if(items[i]!==undefined){res.push(items[i])}
                    else {res.push(None)}
                }
                return res
            }
        } 
    } else if(isinstance(arg,bool)){
        return $ListDict.__getitem__(self,__builtins__.int(arg))
    } else {
        throw __builtins__.TypeError('list indices must be integer, not '+arg.__class__.__name__)
    }
}

$ListDict.__ge__ = function(self,other){
    if(!isinstance(other,list)){
        throw __builtins__.TypeError("unorderable types: list() >= "+other.__class__.__name__+'()')
    }
    var i=0
    while(i<self.length){
        if(i>=other.length){return true}
        else if(getattr(self[i],'__eq__')(other[i])){i++}
        else return(getattr(self[i],"__ge__")(other[i]))
    }
    // other starts like self, but is longer
    return false        
}

$ListDict.__gt__ = function(self,other){
    if(!isinstance(other,list)){
        throw __builtins__.TypeError("unorderable types: list() > "+other.__class__.__name__+'()')
    }
    var i=0
    while(i<self.length){
        if(i>=other.length){return true}
        else if(getattr(self[i],'__eq__')(other[i])){i++}
        else return(getattr(self[i],'__gt__')(other[i]))
    }
    // other starts like self, but is longer
    return false        
}

$ListDict.__hash__ = function(){throw __builtins__.TypeError("unhashable type: 'list'")}

$ListDict.__init__ = function(self,arg){
    var len_func = getattr(self,'__len__'),pop_func=getattr(self,'pop')
    while(len_func()){pop_func()}
    if(arg===undefined){return}
    var arg = iter(arg)
    var next_func = getattr(arg,'__next__')
    while(true){
        try{self.push(next_func())}
        catch(err){if(err.__name__=='StopIteration'){__BRYTHON__.$pop_exc()};break}
    }
}

var $list_iterator = $B.$iterator_class('list_iterator')
$ListDict.__iter__ = function(self){
    return $B.$iterator(self,$list_iterator)
}

$ListDict.__le__ = function(self,other){
    return !$ListDict.__gt__(self,other)
}

$ListDict.__len__ = function(self){return self.length}

$ListDict.__lt__ = function(self,other){
    return !$ListDict.__ge__(self,other)
}

$ListDict.__mro__ = [$ListDict,$ObjectDict]

$ListDict.__mul__ = function(self,other){
    if(isinstance(other,__builtins__.int)){return getattr(other,'__mul__')(self)}
    else{
        throw __builtins__.TypeError("can't multiply sequence by non-__builtins__.int of type '"+other.__class__.__name__+"'")
    }
}

$ListDict.__ne__ = function(self,other){return !$ListDict.__eq__(self,other)}

$ListDict.__new__ = $B.$__new__(list)

$ListDict.__repr__ = function(self){
    if(self===undefined){return "<class 'list'>"}
    var items=self.valueOf()
    var res = '['
    if(self.__class__===$TupleDict){res='('}
    for(var i=0;i<self.length;i++){
        var x = self[i]
        try{res+=getattr(x,'__repr__')()}
        catch(err){console.log('no __repr__');res += x.toString()}
        if(i<self.length-1){res += ', '}
    }
    if(self.__class__===$TupleDict){
        if(self.length==1){res+=','}
        return res+')'
    }
    else{return res+']'}
}

$ListDict.__setitem__ = function(self,arg,value){
    if(isinstance(arg,__builtins__.int)){
        var pos = arg
        if(arg<0){pos=self.length+pos}
        if(pos>=0 && pos<self.length){self[pos]=value}
        else{throw __builtins__.IndexError('list index out of range')}
    } else if(isinstance(arg,slice)){
        var start = arg.start===None ? 0 : arg.start
        var stop = arg.stop===None ? self.length : arg.stop
        var step = arg.step===None ? 1 : arg.step
        if(start<0){start=self.length+start}
        if(stop<0){stop=self.length+stop}
        self.splice(start,stop-start)
        // copy items in a temporary JS array
        // otherwise, a[:0]=a fails
        if(hasattr(value,'__iter__')){
            var $temp = list(value)
            for(var i=$temp.length-1;i>=0;i--){
                self.splice(start,0,$temp[i])
            }
        }else{
            throw __builtins__.TypeError("can only assign an iterable")
        }
    }else {
        throw __builtins__.TypeError('list indices must be integer, not '+arg.__class__.__name__)
    }
}

$ListDict.__str__ = $ListDict.__repr__

$ListDict.append = function(self,other){self.push(other)}

$ListDict.clear = function(self){
    while(self.length){self.pop()}
}

$ListDict.copy = function(self){
    var res = []
    for(var i=0;i<self.length;i++){res.push(self[i])}
    return res
}

$ListDict.count = function(self,elt){
    var res = 0
    for(var i=0;i<self.length;i++){
        if(getattr(self[i],'__eq__')(elt)){res++}
    }
    return res
}

$ListDict.extend = function(self,other){
    if(arguments.length!=2){throw __builtins__.TypeError(
        "extend() takes exactly one argument ("+arguments.length+" given)")}
    other = iter(other)
    while(true){
        try{self.push(next(other))}
        catch(err){
            if(err.__name__=='StopIteration'){__BRYTHON__.$pop_exc();break}
            else{throw err}
        }
    }
}

$ListDict.index = function(self,elt){
    for(var i=0;i<self.length;i++){
        if(getattr(self[i],'__eq__')(elt)){return i}
    }
    throw __builtins__.ValueError(__builtins__.str(elt)+" is not in list")
}

$ListDict.insert = function(self,i,item){self.splice(i,0,item)}

$ListDict.remove = function(self,elt){
    for(var i=0;i<self.length;i++){
        if(getattr(self[i],'__eq__')(elt)){
            self.splice(i,1)
            return
        }
    }
    throw __builtins__.ValueError(__builtins__.str(elt)+" is not in list")
}

$ListDict.pop = function(self,pos){
    if(pos===undefined){ // can't use self.pop() : too much recursion !
        var res = self[self.length-1]
        self.splice(self.length-1,1)
        return res
    }else if(arguments.length==2){
        if(isinstance(pos,__builtins__.int)){
            var res = self[pos]
            self.splice(pos,1)
            return res
        }else{
            throw __builtins__.TypeError(pos.__class__+" object cannot be interpreted as an integer")
        }
    }else{ 
        throw __builtins__.TypeError("pop() takes at most 1 argument ("+(arguments.length-1)+' given)')
    }
}

$ListDict.reverse = function(self){
    for(var i=0;i<parseInt(self.length/2);i++){
        var buf = self[i]
        self[i] = self[self.length-i-1]
        self[self.length-i-1] = buf
    }
}
    
// QuickSort implementation found at http://en.literateprograms.org/Quicksort_(JavaScript)
function $partition(arg,array,begin,end,pivot)
{
    var piv=array[pivot];
    array = swap(array, pivot, end-1);
    var store=begin;
    for(var ix=begin;ix<end-1;++ix) {
        if(getattr(arg(array[ix]),'__le__')(arg(piv))) {
            array = swap(array, store, ix);
            ++store;
        }
    }
    array = swap(array, end-1, store);
    return store;
}

function swap(_array,a,b){
    var tmp=_array[a];
    _array[a]=_array[b];
    _array[b]=tmp;
    return _array
}

function $qsort(arg,array, begin, end)
{
    if(end-1>begin) {
        var pivot=begin+Math.floor(Math.random()*(end-begin));
        pivot=$partition(arg,array, begin, end, pivot);
        $qsort(arg,array, begin, pivot);
        $qsort(arg,array, pivot+1, end);
    }
}

$ListDict.sort = function(self){
    var func=function(x){return x}
    var reverse = false
    for(var i=1;i<arguments.length;i++){
        var arg = arguments[i]
        if(arg.__class__==__BRYTHON__.$KwDict){
            if(arg.name==='key'){func=getattr(arg.value,'__call__')}
            else if(arg.name==='reverse'){reverse=arg.value}
        }
    }
    if(self.length==0){return}
    $qsort(func,self,0,self.length)
    if(reverse){$ListDict.reverse(self)}
    // Javascript libraries might use the return value
    if(!self.__brython__){return self}
}

$ListDict.toString = function(){return '$ListDict'}

// attribute __dict__
$ListDict.__dict__ = dict()
for(var $attr in list){
    $ListDict.__dict__.$keys.push($attr)
    $ListDict.__dict__.$values.push(list[$attr])
}

// constructor for built-in type 'list'
function list(){
    if(arguments.length===0){return []}
    else if(arguments.length>1){
        throw __builtins__.TypeError("list() takes at most 1 argument ("+arguments.length+" given)")
    }
    var res = []
    var arg = iter(arguments[0])
    var next_func = getattr(arg,'__next__')
    while(true){
        try{res.push(next_func())}
        catch(err){
            if(err.__name__=='StopIteration'){
                __BRYTHON__.$pop_exc()
            }else{
                //console.log('err in next func '+err+'\n'+dir(arguments[0]))
            }
            break
        }
    }
    res.__brython__ = true // false for Javascript arrays - used in sort()
    return res
}
list.__class__ = $B.$factory
list.$dict = $ListDict
$ListDict.$factory = list

function $tuple(arg){return arg} // used for parenthesed expressions

var $TupleDict = {__class__:$B.$type,__name__:'tuple',$native:true}

$TupleDict.__iter__ = function(self){
    return $B.$iterator(self,$tuple_iterator)
}

$TupleDict.toString = function(){return '$TupleDict'}

// other attributes are defined in py_list.js, once list is defined

var $tuple_iterator = $B.$iterator_class('tuple_iterator')

// type() is implemented in py_utils

function tuple(){
    var obj = __builtins__.list.apply(null,arguments)
    obj.__class__ = $TupleDict

    obj.__hash__ = function () {
      // http://nullege.com/codes/show/src%40p%40y%40pypy-HEAD%40pypy%40rlib%40test%40test_objectmodel.py/145/pypy.rlib.objectmodel._hash_float/python
      var x= 0x345678
      for(var i=0; i < args.length; i++) {
         var y=args[i].__hash__();
         x=(1000003 * x) ^ y & 0xFFFFFFFF;
      }
      return x
    }
    return obj
}
tuple.__class__ = $B.$factory
tuple.$dict = $TupleDict
$TupleDict.$factory = tuple
$TupleDict.__new__ = $B.$__new__(tuple)

// add tuple methods
for(var attr in $ListDict){
    if(['__delitem__','__setitem__',
        'append','extend','insert','remove','pop','reverse','sort'].indexOf(attr)>-1){continue}
    if($TupleDict[attr]===undefined){
        $TupleDict[attr] = $ListDict[attr]
    }
}

$TupleDict.__delitem__ = function(){
    throw __builtins__.TypeError("'tuple' object doesn't support item deletion")
}
$TupleDict.__setitem__ = function(){
    throw __builtins__.TypeError("'tuple' object does not support item assignment")
}

$TupleDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "list"
        return self===tuple
    }
    return $ListDict.__eq__(self,other)
}

$TupleDict.__mro__ = [$TupleDict,$ObjectDict]
$TupleDict.__name__ = 'tuple'

$B.builtins.list = list
$B.builtins.tuple = tuple
})(__BRYTHON__)
