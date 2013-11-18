import sys

sys.path.append("/src/Lib/lib_migration")

import _sre

print(dir(_sre))
_a=_sre._OpcodeDispatcher()

print(dir(_a))

print(_a.match())   #lists _ChcodeDispatcher instead.. 
