### Syntax

Brython follows the Python syntax:

- whitespaces are significant and define blocks
- lists are created with `[]` or `list()`, tuples with `()` or `tuple()`, dictionnaries with `{}` or `dict()` and sets with `set()`
- list, dict and set comprehensions:
 -`[ expr for item in iterable if condition ]`
 -`dict((i,2*i) for i in range(5))`
 -`set(x for x in 'abcdcga')`

-generators (keyword `yield`), generator expressions : `foo(x for x in bar if x>5)`
-ternary operator: `x = r1 if condition else r2`
-functions can be defined with any combination of fixed arguments, default values, variable positional arguments 
 and variable keyword arguments : `def foo(x, y=0, \*args, \*\*kw):`
-unpacking of argument lists or dictionaries in function calls: `x = foo(*args, **kw)`
-classes with multiple inheritance
-decorators
-imports :  
 -`import foo`
 -`from foo import X`
 -`import foo as bar`
 -`from foo import X as Y`
 -`from foo import *`

