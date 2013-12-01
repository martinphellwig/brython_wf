# hack to return special attributes
def __getattr__(None,attr):
    if attr=='modules':
        return dict(JSObject(__BRYTHON__.imported))
    else:
        raise ImportError("cannot import name "+attr)

from browser import doc
__stdout__=getattr(doc,"$stdout")
__stderr__=getattr(doc,"$stderr")

stdout = getattr(doc,"$stdout")
stderr = getattr(doc,"$stderr")

path_hooks=list(JSObject(__BRYTHON__.path_hooks))

has_local_storage=__BRYTHON__.has_local_storage
has_json=__BRYTHON__.has_json

argv = ['__main__']

class __version_info(object):
    def __init__(self, version_info):
        self.version_info = version_info
        self.major = version_info[0]
        self.minor = version_info[1]
        self.micro = version_info[2]
        self.releaselevel = version_info[3]
        self.serial = version_info[4]

    def __getitem__(self, index):
        return self.version_info[index]

    def __str__(self):
        return str(self.version_info)
     
version_info=__version_info(__BRYTHON__.version_info)
path=__BRYTHON__.path
builtin_module_names=['posix']

byteorder='little'
maxsize=9007199254740992   #largest integer..
maxint=9007199254740992   #largest integer..
maxunicode=1114111

platform="brython"
warnoptions=[]

class flag_class:
  def __init__(self):
      self.debug=0
      self.inspect=0
      self.interactive=0
      self.optimize=0
      self.dont_write_bytecode=0
      self.no_user_site=0
      self.no_site=0
      self.ignore_environment=0
      self.verbose=0
      self.bytes_warning=0
      self.quiet=0
      self.hash_randomization=1

flags=flag_class()

def exit(i=None):
    raise SystemExit('')
