Sintaxe
-------

Brython usa a mesma sintaxe que Python:
- espaços em branco são significativos e definem blocos
- listas são criadas com `[]` ou `list()`, tuplas com `()` ou `tuple()`, dicionários com `{}` ou `dict()`, e conjuntos com `set()`
- criação de listas, dicionários e conjuntos por compreensão:<ul>
- `[ expr for item in iterable if condition ]`
- ` dict((i,2*i) for i in range(5))`
- `set(x for x in 'abcdcga')`
</ul>
- geradores (palavra-chave `yield`), expresões geradoras : `(x for x in bar if x>5)`
- operador ternário: `x = r1 if condition else r2`
- funções podem ser definidas com qualquer combinação de argumentos fixos, valores padrão,<br>argumentos posicionais variáveis e argumentos de palavras-chave variáveis : `def foo(x, y=0, *args, **kw):`
- desempacotamento de argumentos em listas ou dicionários em chamadas de funções : `x = foor(*args, **kw)`
- classes com herança múltipla
- decoradores
- imports :<ul>
 - `import foo`
 - `from foo import X`
 - `import foo as bar`
 - `from foo import X as Y`
 - `from foo import *`
</ul>
