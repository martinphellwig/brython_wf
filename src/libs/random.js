$module = {
    __getattr__ : function(attr){return this[attr]},
    random:function(){return float(Math.random())},
    randint:function(a,b){return int(Math.floor(Math.random()*(b-a)+a))},
    randrange:function(stop){return int(Math.floor(Math.random()*stop))},
    shuffle:function(x, rnd){
      if (x.length <= 1) { return x}

      if (rnd === undefined) {
         rnd=Math.random
      }

      for(var j, o, i = x.length; i; j = parseInt(rnd() * i), o = x[--i], x[i] = x[j], x[j] = o);
    }
}
$module.__class__ = $module // defined in $py_utils
$module.__str__ = function(){return "<module 'random'>"}
