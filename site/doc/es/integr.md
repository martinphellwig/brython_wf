Keywords y funciones integradas (built-in functions)
----------------------------------------------------

Brython soporta la mayor parte de keywords y funciones de Python 3 :

- keywords : `as, assert, break, class, continue, def, del, elif, else, except, False, finally, for, from, global, if, import, is, lambda, None, pass, return, True, try, while, with, yield`
- built-in functions : `abs(), all(), any(), ascii(), bin(), bool(), callable(), chr(), classmethod(), delattr(), dict(), dir(), divmod(), enumerate(), eval(), exec(), filter(), float(), frozenset(), getattr(), globals(), hasattr(), hash(), hex(), id(), input(), int(), isinstance(), iter(), len(), list(), locals(), map(), max(), min(), next(), object(), open(), ord(), pow(), print(), property(), range(), repr(), reversed(), round(), set(), setattr(), slice(), sorted(), str(), sum(), tuple(), type(), zip()`

Por defecto, `print()` mostrar&aacute; la salida en la consola del navegador de la misma forma que sucede con los errores. `sys.stderr` y `sys.stdout` se pueden asignar a un objeto usando el m&eacute;todo `write()` permitiendo la redirecci&oacute;n del 'output' a una ventana o &aacute;rea texto. 

`sys.stdin`, de momento, no ha sido implementado, sin embargo, existe la funci&oacute;n integrada (built-in function) `input()` que abre un di&aacute;logo bloqueante de entrada (un 'prompt').

Para abrir un di&aacute;logo de impresi&oacute;n (a una impresora), llama a `win.print`

Lo siguiente no ha sido implementado en la versi&oacute;n actual : 

- keyword `nonlocal`
- built-in functions `bytearray(), bytes(), compile(), complex(), format(), help(),  memoryview(), super(), vars(), __import__`
- El tipo de n&uacute;meros complejos (`j`) no est&aacute; soportado

A diferencia de Python, puedes a&ntilde;adir atributos a objetos creados mediante `object()`:

>    x = object()
>    x.foo = 44
>    del x.foo

Por &uacute;ltimo, se han incluido algunas keywords y funciones integradas (built-in functions) dise&ntilde;adas para realizar operaciones en el navegador :
- Los 'built-ins' `alert(), confirm(), prompt()` corresponden a sus equivalentes en Javascript.
- La funci&oacute;n integrada `ajax()` permite la ejecuci&oacute;n de peticiones HTTP requests en modo Ajax.
- La 'keyword' `win` es la ventana (objeto _window_ en Javascripts) y `doc` representa el documento HTML (_document_ en Javascript).
