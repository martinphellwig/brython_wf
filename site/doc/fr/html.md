module html
-----------

Le module intégré `html` définit des classes correspondant aux balises HTML, en majuscules. Comme pour tous les modules Python, on peut 
- soit importer seulement le nom du module : `import html`, puis faire référence aux balises par `html.DIV`
- soit importer les noms dont on a besoin : `from html import A,B,DIV`, ou si on ne craint pas les conflits de noms : `from html import *`

La syntaxe pour créer un objet (par exemple un lien hypertexte) est :

><code>A([_content,[attributes]_]])</code>

- *content* est le noeud "fils" de l'objet ; il peut s'agir d'un objet Python comme une chaine de caractères, une liste, etc, ou bien une instance d'une autre classe du module `html`
- *attributes* est une suite de mots-clés correspondant aux attributs de la balise HTML. Ces attributs doivent être fournis avec la syntaxe Javascript, pas CSS : *backgroundColor* et pas *background-color*

Exemple :

>    import html
>    link1 = html.A('Brython',href='http://www.brython.info')
>    link2 = html.A(html.B('Python'),href='http://www.python.org')

Pour éviter les conflits avec des mots-clés de Python, des attributs comme *class* ou *id* doivent être écrits avec une majuscule :

>    d = html.DIV('Brython',Id="zone",Class="container")

Pour l'attribut _style_, la valeur doit être un dictionnaire :

>    d = html.DIV('Brython',style={'height':100,'width':200})


On peut aussi créer un objet sans argument, puis le compléter :
- pour ajouter un noeud enfant, utiliser l'opérateur <=
- pour ajouter des attributs, utiliser la syntaxe Python classique : `objet.attribut = valeur`

par exemple :
>    link = html.A()
>    link <= html.B('connexion')
>    link.href = 'http://exemple.com'

On peut aussi créer plusieurs éléments de même niveau par addition :

>    row = html.TR(html.TH('Nom')+html.TH('Prénom'))

En combinant ces opérateurs et la syntaxe Python, voici comment créer une boite de sélection à partir d'une liste :

>    items = ['un','deux','trois']
>    sel = html.SELECT()
>    for i,elt in enumerate(items):
>        sel <= html.OPTION(elt,value=i)
>    doc <= sel

A noter que la création d'une instance d'une classe HTML entraine la création d'un unique objet DOM. Si on affecte l'instance à une variable, on ne peut pas l'utiliser à plusieurs endroits. Par exemple avec ce code :

>    link = html.A('Python',href='http://www.python.org')
>    doc <= 'Site officiel de Python : '+link
>    doc <= html.P()+'Je répète : le site est '+link

le lien ne sera montré que dans la deuxième ligne. Une solution est de cloner l'objet initial :

>    link = html.A('Python',href='http://www.python.org')
>    doc <= 'Site officiel de Python : '+link
>    doc <= html.P()+'Je répète : le site est '+link.clone()

