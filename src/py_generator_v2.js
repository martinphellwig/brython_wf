;(function($B){
$B.$generator = function() { 

$B.builtins.__debug__ = false
var __builtins__ = $B.builtins

// insert already defined builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = __builtins__.object.$dict
    // local state variables used by the simpliest generators.
    var $generator_state = [0], $generator_exc = [null], 
        $yield_value = null, $exc = null, $is_executing=false;

    // variables for more advance generators.
    var $iter=[]

    var $GeneratorDict = {__class__:$B.$type,
            __name__:'generator',
            toString:function(){return '$GeneratorDict'},
    }

    $GeneratorDict.__mro__ = [$GeneratorDict,__builtins__.object.$dict]
    $GeneratorDict.__iter__ = function (self) {return self}
    $GeneratorDict.__next__ = function (self, noStop) {
        var $res;
        $yield_value = $exc = null;

        try {
             $res = getattr(self, 'genfunc')()
             $is_executing=false;
             if (typeof $res == 'undefined') {
                if (noStop === true) {
                     $generator_state[0] = -1;
                     return;
                }
                throw StopIteration()
             }
        } catch (e) {
             $is_executing=false;
             $generator_state[0] = -1;
             if (noStop === true && isinstance(e, StopIteration)) {
                return;
             }
             throw e;
        }
        return $res;
    };

    $GeneratorDict.__iter__ = function (self) {return self}

    $GeneratorDict.send = function (self, val) {
        $yield_value = val
        $exc = null

        try {
             var $res = getattr(self, 'genfun')()
             if (typeof $res == 'undefined') throw StopIteration()
        } catch (e) {
             $generator_state[0] = -1;
             $is_executing=false;
             throw e;
        }

        $is_executing=false;
        return $res;
    };

    $GeneratorDict.throw = function (self, $exc_type, $exc_value) {
        $yield_value = null;
        //$exc=(typeof $exc_value == 'undefined' ? $exc_type() :
        //                ($p['isinstance']($exc_value, $exc_type)
        //                ? $exc_value : $exc_type($exc_value)));

        $exc=(typeof $exc_value == 'undefined' ? $exc_type() :
                        (isinstance($exc_value, $exc_type)
                        ? $exc_value : $exc_type($exc_value)));

        try {
             var $res = getattr(self, 'genfunc')()
        } catch (e) {
             $generator_state[0] = -1
             $is_executing=false
             throw (e)
        }

        $is_executing=false
        return $res
    }

    $GeneratorDict.close = function (self) {
        $yield_value = null
        $exc=GeneratorExit()
                                
        try {
             var $res = getattr(self, 'genfunc')()
             $is_executing=false
             if (typeof $res != 'undefined') throw RuntimeError('generator ignored GeneratorExit');
        } catch (e) {
             $generator_state[0] = -1
             $is_executing=false
             if (isinstance(e, StopIteration) || isinstance(e, GeneratorExit)) return null;
             throw (e)
        }
        return null
    };

    var func1 = function (self) {
        var $yielding = false
        if ($is_executing) throw ValueError('generator already executing')
        $is_executing = true

        if (typeof $generator_state[0] == 'undefined' || $generator_state[0] === 0) {
           for (var $i = 0 ; $i < ($generator_state.length<2?2:$generator_state.length); $i++) 
               $generator_state[$i]=0

           if (typeof $exc != 'undefined' && $exc !== null) {
              $yielding = null;
              $generator_state[0] = -1;
              throw $exc;
           }

           $yield_value = 1;
           $yielding = true;
           $generator_state[0] = 1;
           return $yield_value;
           //$generator_state[0]=1;
        }

        if ($generator_state[0] == 1) {
           if (typeof $exc != 'undefined' && $exc !== null) {
              $yielding = null;
              $generator_state[0] = -1;
              throw $exc;
           }

           $generator_state[0]=2;
        }

        //if ($generator_state[0] == 2) {}

        return;
    }

    var func2 = function (self) {
           var $yielding = false;
           if ($is_executing) throw ValueError('generator already executing');
           $is_executing = true;

           if (typeof $generator_state[0] == 'undefined' || $generator_state[0] === 0) {
              for (var $i = 0 ; $i < ($generator_state.length<2?2:$generator_state.length); $i++) $generator_state[$i]=0;
                                
              if (typeof $exc != 'undefined' && $exc !== null) {
                  $yielding = null;
                  $generator_state[0] = -1;
                  throw $exc;
              }
                                
              $iter[0]=getattr(iter(getattr(range,"__call__")(Number(10))),"__next__")
              $generator_state[0]=1;
           }

           if ($generator_state[0] == 1) {
              $generator_state[1] = 0;
              $generator_state[0]=2;
           }
           

           if ($generator_state[0] == 2) {
              //for (;($generator_state[1] > 0 || typeof($p['__wrapped_next']($iter2_nextval).$nextval) != 'undefined');$generator_state[1] = 0) {
              for (;1;$generator_state[1] = 0) {
                  if (typeof $generator_state[1] == 'undefined' || $generator_state[1] === 0) {
                     for (var $i = 1 ; $i < ($generator_state.length<3?3:$generator_state.length); $i++) 
                         $generator_state[$i]=0;
                     
                     _i = $iter[0]()
                     $yield_value = 1;
                     $yielding = true;
                     $generator_state[1] = 1;
                     return $yield_value;
                  }
                                        
                  if ($generator_state[1] == 1) {
                     if (typeof $exc != 'undefined' && $exc !== null) {
                        $yielding = null;
                        $generator_state[1] = -1;
                        throw $exc;
                      }
                      $generator_state[1]=2;
                  }
                                        
                  if ($generator_state[1] == 2) {}
              }
                                
              $generator_state[0]=3;
           }

           return;
    }

    var func3 = function (self) {
        var $yielding = false;
        if ($is_executing) throw ValueError('generator already executing');
        $is_executing = true;

        if (typeof $generator_state[0] == 'undefined' || $generator_state[0] === 0) {
           for (var $i = 0 ; $i < ($generator_state.length<2?2:$generator_state.length); $i++) 
               $generator_state[$i]=0;

           if (typeof $exc != 'undefined' && $exc !== null) {
              $yielding = null;
              $generator_state[0] = -1;
              throw $exc;
           }
                                
           $iter[0] = getattr(iter(getattr(range,"__call__")(Number(10))),"__next__")
           $generator_state[0]=1;
        }
                        
        if ($generator_state[0] == 1) {
           $generator_state[1] = 0;
           $generator_state[0]=2;
        }
        
        if ($generator_state[0] == 2) {
           //for (;($generator_state[1] > 0 || typeof($p['__wrapped_next']($iter5_nextval).$nextval) != 'undefined');$generator_state[1] = 0) {
           for (;$generator_state[1] > 0||1;$generator_state[1] = 0) {
               if (typeof $generator_state[1] == 'undefined' || $generator_state[1] === 0) {
                  for (var $i = 1 ; $i < ($generator_state.length<3?3:$generator_state.length); $i++) 
                      $generator_state[$i]=0;

                  try {
                    _i = $iter[0]()
                  } catch(e) {
                    //since this is the outer for loop, we need to throw a StopIteration
                    throw(e)
                  }
                  $iter[1] = getattr(iter(getattr(range,"__call__")(Number(10))),"__next__")

                  $generator_state[1]=1;
               }

               if ($generator_state[1] == 1) {
                  $generator_state[2] = 0;
                  $generator_state[1]=2;
               }

               if ($generator_state[1] == 2) {
                  //for (;($generator_state[2] > 0 || typeof($p['__wrapped_next']($iter6_nextval).$nextval) != 'undefined');$generator_state[2] = 0) {
                  for (;$generator_state[2] > 0||1;$generator_state[2] = 0) {
                      if (typeof $generator_state[2] == 'undefined' || $generator_state[2] === 0) {
                         for (var $i = 2 ; $i < ($generator_state.length<4?4:$generator_state.length); $i++) 
                             $generator_state[$i]=0;

                         try {
                           _j = $iter[1]()
                         } catch(e) {
                            if (__BRYTHON__.is_exc(e,[__builtins__.StopIteration])) {
                               break
                            }
                            throw(e)
                         }

                         $yield_value = getattr(_i, '__mul__')(_j)
                         $yielding = true;
                         $generator_state[2] = 1;
                         return $yield_value;
                      }
                                                        
                      if ($generator_state[2] == 1) {
                         if (typeof $exc != 'undefined' && $exc !== null) {
                            $yielding = null;
                            $generator_state[2] = -1;
                            throw $exc;
                         }
                         $generator_state[2]=2;
                      }
                  }
                  $generator_state[1]=3;
               }
               if ($generator_state[1] == 3) {
                  $generator_state[1]=4;
               }
           }
                                
           $generator_state[0]=3;
        }

        return;
    }


    var res = function(){

        var obj = {
            __class__ : $GeneratorDict,
            //genfunc: func1
            //genfunc: func2
            genfunc: func3
        }

        return obj
    }

    res.__repr__ = function(){return "<function "+func.__name__+">"}
    return res
}

$B.$generator.__repr__ = function(){return "<class 'generator'>"}
$B.$generator.__str__ = function(){return "<class 'generator'>"}
$B.$generator.__class__ = __BRYTHON__.$type

})(__BRYTHON__)
