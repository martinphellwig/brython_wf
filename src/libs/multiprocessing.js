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
   return self.$alive
}

$ProcessDict.join = function(self, timeout){
   // need to block until process is complete
   // could probably use a addEventListener to execute all existing code
   // after this join statement

   self.$worker.addEventListener('message', function (e) {
        var data=e.data
        if (data.stdout != '') { // output stdout from process
           $B.stdout.write(data.stdout)
        }
   }, false);
}

$ProcessDict.run = function(self){
   //fix me
}

$ProcessDict.start = function(self){
   var _args=[]
   for(var i=0; i < self.$args.length; i++) {
      var _a=self.$args[i]
      if(isinstance(_a, str)){_args.push("'"+_a+"'")} else {_args.push(_a)} 
   }
   self.$worker.postMessage({target: self.$target, 
                             args: _args.join(','),
                          //   kwargs: self.$kwargs
                           })
   self.$worker.addEventListener('error', function(e) { throw e})
   self.$alive=true
}

$ProcessDict.terminate = function(self){
   self.$worker.terminate()
   self.$alive=false
}

// variables
//name
//daemon
//pid
//exitcode

function Process(){
    //arguments group=None, target=None, name=None, args=(), kwargs=()

    var $ns=$B.$MakeArgs('Process',arguments,[],[],null,'kw')
    var kw=$ns['kw']

    var target=__builtins__.dict.$dict.get($ns['kw'],'target',None)
    var args=__builtins__.dict.$dict.get($ns['kw'],'args',tuple())

    var worker = new Worker('/src/web_workers/multiprocessing.js')

    var res = {
        __class__:$ProcessDict,
        $worker: worker,
        name: $ns['name'] || None,
        $target: target+'',
        $args: args,
        //$kwargs: $ns['kw'],
        $alive: false
    }
    return res
}

Process.__class__ = $B.$factory
Process.$dict = $ProcessDict

return {Process:Process}

})(__BRYTHON__)
