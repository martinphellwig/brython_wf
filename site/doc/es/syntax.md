Sintaxis
--------

Brython usa la misma sintaxis que Python:
- Los espacios en blanco son significativos e importantes y definen bloques
- Las listas se crean con `[]` o `list()`, Las tuplas se crean con `()` o `tuple()`, los diccionarios se crean con `{}` o `dict()` y los conjuntos (sets) se crean con  `set()`
- listas, diccionarios y conjuntos por comprensi&oacute;n (comprehension): <ul>
- `[ expr for item in iterable if condition ]`
- ` dict((i,2*i) for i in range(5))`
- `set(x for x in 'abcdcga')`
</ul>
- generadores (keyword `yield`), expresiones generadoras : `foo(x for x in bar if x>5)`
- operador ternario: `x = r1 if condition else r2`
- Las funciones pueden ser definidas con cualquier combinaci&oacute;n de argumentos fijos, argumentos por defecto, argumentos posicionales variables y argumentos de palabras clave variables : <br>`def foo(x, y=0, *args, **kw):`
- Desempaquetado de argumentos en listas o diccionarios en llamadas a funciones : `x = foo(*args, **kw)`
- clases con herencia m&uacute;ltiple
- decoradores
- imports : 
 - `import foo`
 - `from foo import X`
 - `import foo as bar`
 - `from foo import X as Y`
 - `from foo import *`

