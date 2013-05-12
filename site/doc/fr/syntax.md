Syntaxe
-------

Brython est conforme à la syntaxe de Python 3

- blocs délimités par l'indentation
- définition de listes par `[]` ou `list()`, de tuples par `()` ou `tuple()`, de dictionnaires par `{}` ou `dict()`, d'ensembles par `{}` ou `set()` 
- listes, dictionnaires, ensembles en extansion : 

 - `[ expr for item in iterable if condition ]`
 - `dict((i,2*i) for i in range(5))`
 - `set(x for x in 'abcdcga')`

- générateurs (mot-clé `yield`), expressions de générateur : `foo(x for x in bar if x>5)`
- opérateur ternaire : `x = r1 if condition else r2`
- la définition des fonctions peut comporter des valeurs par défaut et des arguments et mot-clés optionnels : <br>`def foo(x,y=0,*args,**kw):`
- décompactage de listes ou de dictionnaires dans l'appel de fonctions : `x = foo(*args,**kw)`
- classes avec héritage multiple
- décorateurs
- importation : 
 - `import foo`
 - `from foo import X`
 - `import foo as bar`
 - `from foo import X as Y`
 - `from foo import *`
