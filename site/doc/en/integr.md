## Keywords and built-in functions

Brython supports most keywords and functions of Python 3 :
- keywords : `as, assert, break, class, continue, def, del, elif, else, except, False, finally, for, from, global, if, import, is, lambda, None, pass, return, True, try, while, yield`
- built-in functions : `abs(), all(), any(), ascii(), bin(), bool(), chr(), dict(), dir(), divmod(), enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), iter(), len(), list(), map(), max(), min(), next(), object(), open(), ord(), pow(), print(), property(), range(), repr(), reversed(), round(), set(), setattr(), slice(), sorted(), str(), sum(), tuple(), zip()`


By default, `print()` will output to the web browser console and so are the error messages. `sys.stderr` and `sys.stdout` can be assigned to an object with a `write()` method, and this allows for the redirection of output to go to a window or text area, for example

`sys.stdin` is not implemented at this time, however there is an `input()` built-in function that will open a blocking input dialog (a prompt).

To open a print dialog (to a printer), call `win.print`

The following are not implemented in the current version : 

- keywords `nonlocal with`
- built-in functions `bytearray(), bytes(), callable(), classmethod(), compile(), complex(), delattr(), format(), globals(), help(), locals(), memoryview(), staticmethod(), super(), type(), vars(), \_\_import\_\_`
- the complex number type (`j`) is not supported

Unlike Python, you can add attributes to objects created by the `object()` built-in:

>    x = object()
>    x.foo = 44
>    del x.foo

Finally, some keywords and built-in functions designed for operation in a browser have been added :

- built-ins `alert(), confirm(), prompt()` correspond to their Javascript equivalents
- the `ajax()` built-in function allows the execution of HTTP requests in Ajax mode
- the `win` keyword  is the window (_window_ object in JS) and `doc` represents the HTML document (_document_ in JS)
