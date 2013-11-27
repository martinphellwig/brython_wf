// import modules

$ModuleDict = {
    __class__ : $type,
    __name__ : 'module',
}
$ModuleDict.__repr__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__str__ = function(self){return '<module '+self.__name__+'>'}
$ModuleDict.__mro__ = [$ModuleDict,$ObjectDict]


function $__import__(name, globals, locals, fromlist, level, curpath) {
   // doc: http://docs.python.org/dev/library/functions.html#__import__
   // curpath is the location of the code where this import takes place
   // curpath = '__main__' means its in the main script 
   // if 'import a' takes place in module '/src/Lib/mymodule'
   // curpath = '/src/Lib'
   // note: curpath is ignored if level =0 (absolute import)
   // level > 0 (is a relative import)

   if(globals === undefined) {

   }
   if(locals === undefined) {

   }
   if(fromlist === undefined) {fromlist=[]}
   if(level === undefined){level=0}

   var _loader=None
   if(level > 0) {
     // this is a relative import! so our search path is set..
     var elts = cur_path.split('/')
     var pymod_elts = elts.slice(0,elts.length-level)
     var _path=pymod_elts.join('/')

     for (var j=0; j < __BRYTHON__.path_hooks.length; j++) {
         if (_loader != None) continue;
         var _mod=__BRYTHON__.path_hooks(j)
         var _found=False
         try {_mod(_path)
              _found=True
         } catch (ImportError) {}
         if (_found) { // this hook thinks it can find/load the module
            _loader=_mod.find_module(name, _path)
         }
     }
   } else {
     for (var i=0; i < __BRYTHON__.path.length; i++) {
         if (_loader != None) continue;
         var _path=__BRYTHON__.path[i]
         for (var j=0; j < __BRYTHON__.path_hooks.length; j++) {
             if (_loader != None) continue;
             var _mod=__BRYTHON__.path_hooks(j)
             var _found=False
             try {_mod(_path)
                  _found=True
             } catch (ImportError) {}
             if (_found) { // this hook thinks it can find/load the module
                _loader=_mod.find_module(name, _path)
             }
         }
      }
   }

   if(_loader == None) {
     throw ImportError('')
     return
   }

   // _loader is not None, so lets run the loader
   return _loader.load_module(name)
}
