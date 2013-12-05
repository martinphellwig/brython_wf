"""Generates a skeleton for non-pure Python modules of the CPython distribution
The resulting script has the same names as the original module, with the same values
if they are a built-in type (integer, string etc) and a value of the same type
(function, class etc) if possible, else a string with information on the missing
value
"""

import types
import inspect


stdlib_name = 'nt'
ns = {}
exec('import %s;print(dir(%s))' %(stdlib_name,stdlib_name),ns)
out = open('%s_skeleton.py' %stdlib_name,'w')

infos = ns[stdlib_name]
print(dir(infos))
if infos.__doc__:
    out.write('"""%s"""\n\n' %infos.__doc__)
for key in dir(infos):
    if key in ['__doc__','__name__','__file__','__package__']:
        continue
    val = getattr(infos,key)
    if isinstance(val,(int,float)):
        out.write('\n%s = %s\n' %(key,val))
    elif val in [True,False,None]:
        out.write('\n%s = %s\n' %(key,val))
    elif isinstance(val,str):
        out.write('\n%s = """%s"""\n' %(key,val))
    elif type(val)in [types.BuiltinFunctionType,
        types.BuiltinMethodType,
        types.FunctionType]:
        out.write('\ndef %s(*args,**kw):\n' %key)
        if val.__doc__:
            lines = val.__doc__.split('\n')
            out.write('    """')
            if len(lines)==1:
                out.write(lines[0]+'"""\n')
            else:
                out.write(lines[0])
                for line in lines[1:-1]:
                    out.write('    %s\n' %line)
                out.write('    %s"""\n' %lines[-1])
        out.write('    pass\n')
    elif inspect.isclass(val):
        out.write('\nclass %s:\n    pass\n' %key)
    else:
        out.write('\n%s = "%s"\n' %(key,val))
out.close()