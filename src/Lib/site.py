import sys

import VFS_import
sys.path_hooks.insert(0,VFS_import.VFSModuleFinder)

import external_import
sys.path_hooks.append(external_import.ModuleFinder)
