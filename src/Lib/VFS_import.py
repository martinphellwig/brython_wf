VFS=JSObject(__BRYTHON__.py_VFS)

class VFSModuleFinder:
    def __init__(self, path_entry):
        if path_entry.startswith('/src/libs') or path_entry.startswith('/src/Lib'):
           self.path_entry=path_entry
        else:
            raise ImportError()
        
    def __str__(self):
        return '<%s for "%s">' % (self.__class__.__name__, self.path_entry)
        
    def find_module(self, fullname, path=None):
        path = path or self.path_entry
        print('looking for "%s" in %s ...' % (fullname, path))
        if os.path.join(self.path_entry, fullname) in VFS:
           return VFSModuleLoader(path)

        print('not found')
        return None

class VFSModuleLoader:
    """Load source for modules"""
    
    def __init__(self, path_entry):
        self.path_entry = path_entry
        
    def _get_filename(self, fullname):
        # Make up a fake filename that starts with the path entry
        # so pkgutil.get_data() works correctly.
        return os.path.join(self.path_entry, fullname)
        
    def get_source(self, fullname):
        print('loading source for "%s"' % fullname)

        if self._get_filename(fullname) in VFS:
           return VFS[key_name]

        raise ImportError('could not find source for %s' % fullname)
            
    def get_code(self, fullname):
        source = self.get_source(fullname)
        print('compiling code for "%s"' % fullname)
        return compile(source, self._get_filename(fullname), 'exec', dont_inherit=True)
    
        
    def is_package(self, fullname):
        init_name = _mk_init_name(fullname)
        return init_name in VFS

    def load_module(self, fullname):
        source = self.get_source(fullname)

        if fullname in sys.modules:
            print('reusing existing module from previous import of "%s"' % fullname)
            mod = sys.modules[fullname]
        else:
            print('creating a new module object for "%s"' % fullname)
            mod = sys.modules.setdefault(fullname, imp.new_module(fullname))

        # Set a few properties required by PEP 302
        mod.__file__ = self._get_filename(fullname)
        mod.__name__ = fullname
        mod.__path__ = self.path_entry
        mod.__loader__ = self
        mod.__package__ = '.'.join(fullname.split('.')[:-1])
        
        if self.is_package(fullname):
            print('adding path for package')
            # Set __path__ for packages
            # so we can find the sub-modules.
            mod.__path__ = [ self.path_entry ]
        else:
            print('imported as regular module')
        
        print('execing source...')
        exec(source in mod.__dict__)
        print('done')
        return mod
