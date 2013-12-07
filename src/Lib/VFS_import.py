import sys
VFS=dict(JSObject(__BRYTHON__.py_VFS))
class VFSModuleFinder:
    def __init__(self, path_entry):
        #print("in VFSModuleFinder")
        _root=JSObject(__BRYTHON__.brython_path)
        #print('root:%s' % _root)
        if len(path_entry) > len(_root):
           path_entry=path_entry[len(_root):]

        #print(path_entry)
        if path_entry.startswith('/libs') or path_entry.startswith('/Lib'):
           self.path_entry=path_entry
        elif path_entry.startswith('libs') or path_entry.startswith('Lib'):
           self.path_entry='/%s' % path_entry
        else:
            raise ImportError('VFSModuleFinder: path not supported (%s)' % path_entry)
        
    def __str__(self):
        return '<%s for "%s">' % (self.__class__.__name__, self.path_entry)
    
    def load_module(self, name):
        #print(self)
        mod=sys.modules[self._fullname]
        return mod

    def find_module(self, fullname, path=None):
        if fullname in sys.modules:
           if sys.modules[fullname]['__file__'] is not None:
              self._fullname=fullname
              return self

        #path = path or self.path_entry
        #path = self.path_entry
        for _ext in ['js', 'py']:
            _filepath=self.path_entry +'/%s.%s' % (fullname, _ext)
            if _filepath in VFS:
               #print("VFS_import:module found at %s:%s" % (_filepath, fullname))
               return VFSModuleLoader(_filepath, fullname)

        #print('module %s not found' % fullname)
        raise ImportError('VFS_import:module %s not found, path:%s' % (fullname, _filepath))

class VFSModuleLoader:
    """Load source for modules"""
    
    def __init__(self, filepath, name):
        self._filepath=filepath
        self._name=name
        
    def get_source(self):
        if self._filepath in VFS:
           return JSObject(readFromVFS(self._filepath))

        raise ImportError('could not find source for %s' % self._filepath)

    def is_package(self):
        return '.' in self._name
            
    def load_module(self, name):
        if self._name in sys.modules:
           print('reusing existing module from previous import of "%s"' % self._name)
           mod = sys.modules[self._name]
           return mod
        
        _src=self.get_source()
        if self._filepath.endswith('.js'):
           mod=JSObject(import_js_module(_src, self._filepath, self._name))
        elif self._filepath.endswith('.py'):
           mod=JSObject(import_py_module(_src, self._filepath, self._name))
        elif self._filepath.endswith('.pyj'):
           mod=JSObject(import_pyj_module(_src, self._filepath, self._name))
        else:
           raise ImportError('Invalid Module: %s' % self._filepath)

        # Set a few properties required by PEP 302
        mod.__file__ = self._filepath
        mod.__name__ = self._name
        mod.__path__ = self._filepath
        mod.__loader__ = self
        mod.__package__ = '.'.join(self._name.split('.')[:-1])

        
        if self.is_package():
           #print('adding path for package')
           # Set __path__ for packages
           # so we can find the sub-modules.
           mod.__path__ = [ self._filepath ]
        #else:
        #    print('imported as regular module')
        
        #print('creating a new module object for "%s"' % self._name)
        sys.modules[self._name]=mod
        #JSObject(__BRYTHON__.imported)[self._name]=mod

        return mod
