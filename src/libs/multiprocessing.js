// multiprocessing
var $module = (function($B){

var __builtins__ = $B.builtins

for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}

var $ProcessDict = {
    __class__:$B.$type,
    __name__:'Process'
}

$ProcessDict.__mro__ = [$ProcessDict, __builtins__.object.$dict]

$ProcessDict.__repr__ = function(self){
    return '<object Process>'
}

$ProcessDict.__str__ = $ProcessDict.toString = $ProcessDict.__repr__

$ProcessDict.is_alive = function(self){
   return self.alive
}

$ProcessDict.join = function(self, timeout){
   // need to block until process is complete
   // could probably use a addEventListener to execute all existing code
   // after this join statement
}

$ProcessDict.run = function(self){
   //fix me
}

$ProcessDict.start = function(self){
   console.log(self.$target+'')
   self.$worker.postMessage({target: self.$target+'', 
                             args: self.$args.join(','),
                          //   kwargs: self.$kwargs
                           })
   self.alive=true
}

$ProcessDict.terminate = function(self){
   self.$worker.terminate()
   self.alive=false
}

// variables
//name
//daemon
//pid
//exitcode

function Process(){
    //arguments group=None, target=None, name=None, args=(), kwargs=()
    // MakeArgs
    var $ns=$B.$MakeArgs('Process',arguments,[],[],'args','kw')
    var kw=$ns['kw']

    var target=getattr(kw,'get')('target',undefined)

    var worker = new Worker('/src/web_workers/multiprocessing.js')

    var res = {
        __class__:$ProcessDict,
        $worker: worker,
        name: $ns['name'] || None,
        $target: target || self.run,
        $args: $ns['args'] || [],
        $kwargs: $ns['kwargs']
    }
    return res
}

Process.__class__ = $B.$factory
Process.$dict = $ProcessDict

return {Process:Process}

})(__BRYTHON__)
