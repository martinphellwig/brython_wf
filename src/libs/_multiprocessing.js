// multiprocessing
var $module = (function($B){

var __builtins__ = $B.builtins

for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}

var $ProcessDict = {
    __class__:$B.$type,
    __name__:'Process'
}

var $convert_args=function(args) {
    var _list=[]
    for(var i=0; i < args.length; i++) {
      var _a=args[i]
      if(isinstance(_a, str)){_list.push("'"+_a+"'")} else {_list.push(_a)} 
   }

   return _list.join(',')
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
   //var _args=[]
   //for(var i=0; i < self.$args.length; i++) {
   //   var _a=self.$args[i]
   //   if(isinstance(_a, str)){_args.push("'"+_a+"'")} else {_args.push(_a)} 
   //}

   self.$worker.postMessage({target: self.$target, 
                             args: $convert_args(self.$args),
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


var $PoolDict = {
    __class__:$B.$type,
    __name__:'Pool'
}

$PoolDict.__mro__ = [$PoolDict, __builtins__.object.$dict]

$PoolDict.__repr__ = function(self){
    return '<object Pool>'
}

$PoolDict.__enter__ = function(self){}
$PoolDict.__exit__ = function(self){}

$PoolDict.__str__ = $PoolDict.toString = $PoolDict.__repr__

$PoolDict.map = function(self){
   var args = []
   for(var i=1;i<arguments.length;i++){args.push(arguments[i])}

   var $ns=$B.$MakeArgs('Pool.map',args,['func', 'fargs'],[],'args','kw')
   var func=$ns['func']
   var fargs=$ns['fargs']

   var _results=[]

   fargs=iter(fargs)

   var _pos=0
   for(var i=0; i < self.$processes; i++) {
       var worker = new Worker('/src/web_workers/multiprocessing.js')
       var arg

       try{ 
          arg=getattr(fargs, '__next__')()
       } catch(err) {
          if (err.__name__ == 'StopIteration') {
             __BRYTHON__.$pop_exc()
          } else {
             throw err
          }
       }
       //console.log(arg)
       worker.postMessage({target: func+'', pos: _pos,
                             args: $convert_args([arg])})
       _pos++

       worker.addEventListener('message', function(e) {
           _results[e.data.pos]=e.data.result
           if (_results.length == args.length) return 

           try {
               arg=getattr(fargs, '__next__')()
               e.currentTarget.postMessage({target: func+'', pos: _pos,
                                            args: $convert_args([arg])})
               _pos++
           } catch(err) {
               if (err.__name__ != 'StopIteration') throw err
           }
       }, false);
   }

   return _results
}

function Pool(){

    var $ns=$B.$MakeArgs('Pool',arguments,[],[],null,'kw')
    var kw=$ns['kw']

    var processes=__builtins__.dict.$dict.get($ns['kw'],'processes',None)
    //var args=__builtins__.dict.$dict.get($ns['kw'],'args',tuple())

    var res = {
        __class__:$PoolDict,
        $processes:processes
    }
    return res
}

Pool.__class__ = $B.$factory
Pool.$dict = $PoolDict

return {Process:Process, Pool:Pool}

})(__BRYTHON__)
