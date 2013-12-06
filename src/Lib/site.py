import VFS_import

_path_hooks=list(JSObject(__BRYTHON__.path_hooks))
_path_hooks.insert(0,VFS_import.VFSModuleFinder)

import external_import
_path_hooks.append(external_import.ModuleFinder)

