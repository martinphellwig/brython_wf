import sys

sys.path.append("/src/Lib/lib_migration")

import re_python as re

_m=re.compile('^\s*$')

print(_m.match('abc'))
