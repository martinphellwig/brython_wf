// global object with brython built-ins
var __BRYTHON__ = __BRYTHON__ || {}   //just in case __BRYTHON__ is already
                                      //defined (ie, isa_web_worker=true, etc

if (__BRYTHON__.isa_web_worker==true) {
  // we need to emulate a window and document variables/functions for
  // web workers, since they don't exists. (this is much better than,
  // having a bunch of tests throughout code, making the code more complex) 

  window = {}
  window.XMLHttpRequest = XMLHttpRequest 
  window.navigator={}
  window.navigator.userLanguage=window.navigator.language="fixme"

  window.clearTimeout=function(timer) {clearTimeout(timer)}
}

// Python __builtins__
__BRYTHON__.builtins = {
    __repr__:function(){return "<module 'builtins>'"},
    __str__:function(){return "<module 'builtins'>"},    
}

__BRYTHON__.__getattr__ = function(attr){return this[attr]}
__BRYTHON__.__setattr__ = function(attr,value){
    // limited to some attributes
    if(['debug'].indexOf(attr)>-1){__BRYTHON__[attr]=value}
    else{throw __BRYTHON__.builtins.AttributeError('__BRYTHON__ object has no attribute '+attr)}
}

// system language ( _not_ the one set in browser settings)
// cf http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
__BRYTHON__.language = window.navigator.userLanguage || window.navigator.language

__BRYTHON__.date = function(){
    var JSObject = __BRYTHON__.JSObject
    if(arguments.length===0){return JSObject(new Date())}
    else if(arguments.length===1){return JSObject(new Date(arguments[0]))}
    else if(arguments.length===7){return JSObject(new Date(arguments[0],
        arguments[1]-1,arguments[2],arguments[3],
        arguments[4],arguments[5],arguments[6]))}
}
__BRYTHON__.has_local_storage = typeof(Storage)!=="undefined"
if(__BRYTHON__.has_local_storage){
    __BRYTHON__.local_storage = function(){
        // for some weird reason, typeof localStorage.getItem is 'object'
        // in IE8, not 'function' as in other browsers. So we have to
        // return a specific object...
        if(typeof localStorage.getItem==='function'){
            var res = __BRYTHON__.JSObject(localStorage)
        }else{
            var res = new Object()
            res.__getattr__ = function(attr){return this[attr]}
            res.getItem = function(key){return localStorage.getItem(str(key))}
            res.setItem = function(key,value){localStorage.setItem(str(key),str(value))}
            return res
        }
        res.__repr__ = function(){return "<object Storage>"}
        res.__str__ = function(){return "<object Storage>"}
        res.__item__ = function(rank){return localStorage.key(rank)}
        return res
    }
}

__BRYTHON__._indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
__BRYTHON__.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction
__BRYTHON__.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange

__BRYTHON__.has_indexedDB = typeof(__BRYTHON__._indexedDB) !== "undefined"
if (__BRYTHON__.has_indexedDB) {
   __BRYTHON__.indexedDB = function() {return __BRYTHON__.JSObject(__BRYTHON__._indexedDB)}
}

__BRYTHON__.re = function(pattern,flags){return__BRYTHON__. JSObject(new RegExp(pattern,flags))}
__BRYTHON__.has_json = typeof(JSON)!=="undefined"

__BRYTHON__.has_websocket = (function(){
    try{var x=window.WebSocket;return x!==undefined}
    catch(err){return false}
})()


