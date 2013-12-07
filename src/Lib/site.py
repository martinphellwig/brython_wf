import sys

#from VFS_import import VFSModuleFinder
#sys.path_hooks.insert(VFSModuleFinder)

from external_import import ModuleFinder
sys.path_hooks.append(ModuleFinder)

