import os
from browser import doc
import urllib.request
import sys

## this module is able to download modules that are external to
## localhost/src
## so we could download from any URL

class ModuleFinder:
    def __init__(self, path_entry):
        #print("external_import here..")
        self._module_source=None

        if path_entry.startswith('http://') and not \
           path_entry.startswith(JSObject(__BRYTHON__.brython_path)): # and not \
           #path.entry.startswith('http://localhost'):
           self.path_entry=path_entry
        else:
            raise ImportError('external_import: path not supported (%s)' % path_entry)
        
    def __str__(self):
        return '<%s for "%s">' % (self.__class__.__name__, self.path_entry)
        
    def load_module(self, name):
        return sys.modules[self.fullname]

    def find_module(self, fullname, path=None):
        #print(fullname)
        if fullname in sys.modules:
           self.fullname=fullname
           return self

        #path = path or self.path_entry
        for _ext in ['js', 'py']:
            _fp,_url,_headers=urllib.request.urlopen(self.path_entry + '/' + '%s.%s' % (fullname, _ext))
            #print(_headers)
            if 'status' in _headers and _headers['status'] == '200':
               self._module_source=_fp.read()
            else:
               continue   #give up something with wrong with this url

            #print(self._module_source)
            #if self._module_source is not None:
            print("external_import:module found at %s:%s" % (self.path_entry, fullname))
            return ModuleLoader('%s/%s.%s' % (self.path_entry, fullname, _ext), fullname, self._module_source)

        #print('module %s not found' % fullname)
        raise ImportError('module %s not found' % fullname)
        return None

class ModuleLoader:
    """Load source for modules"""
    
    def __init__(self, filepath, name, module_source):
        print(filepath, name, module_source)
        self._filepath=filepath
        self._name=name
        self._module_source=module_source
        
    def get_source(self):
        return self._module_source

    def is_package(self):
        return '.' in self._name
            
    def load_module(self, name):
        #print(self)
        #print(name)
        if self._name in sys.modules:
           #print('reusing existing module from previous import of "%s"' % fullname)
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
           #print("Invalid Module: %s" % self._filepath)
           raise ImportError('Invalid Module: %s' % self._filepath)

        # Set a few properties required by PEP 302
        mod.__file__ = self._filepath
        mod.__name__ = self._name
        mod.__path__ = self._filepath
        mod.__loader__ = self
        mod.__package__ = '.'.join(self._name.split('.')[:-1])
        
        if self.is_package():
           print('adding path for package')
           # Set __path__ for packages
           # so we can find the sub-modules.
           mod.__path__ = [ self._filepath ]
        else:
            print('imported as regular module')
        
        print('creating a new module object for "%s"' % self._name)
        #sys.modules.setdefault(self._name, mod)
        sys.modules[self._name]=mod
        #JSObject(__BRYTHON__.imported)[self._name]=mod

        return mod
