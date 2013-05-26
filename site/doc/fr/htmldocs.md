Manipulation de documents HTML
------------------------------

Une page HTML est considérée comme un arbre, dont le sommet est représenté par le mot-clé `doc` et les noeuds sont soit des objets intégrés Python (chaines de caractères, entiers...) soit des objets créés par les fonctions correspondant aux balises HTML

Ces fonctions se trouvent dans le module intégré `html`, qu'il faut importer au début du script. Le nom de la balise est en majuscules. Comme pour tous les modules Python, on peut 
- soit importer seulement le nom du module : `import html`, puis faire référence aux balises par `html.DIV`
- soit importer les noms dont on a besoin : `from html import A,B,DIV`, ou si on ne craint pas les conflits de nom : `from html import *`

La syntaxe pour créer un objet (par exemple un lien hypertexte) est :

><code>A(_content,[attributes]_)</code>

>_content_ est le noeud "fils" de l'objet ; _attributes_ est une suite de mots-clés correspondant aux attributs de la balise HTML. Ces attributs doivent être fournis avec la syntaxe Javascript, pas CSS : _backgroundColor_ et pas _background-color_


Exemple :

>    import html
>    link1 = html.A('Brython',href='http://www.brython.info')
>    link2 = html.A(html.B('Python'),href='http://www.python.org')

Pour l'attribut _style_, la valeur doit être un dictionnaire :

>    d = html.DIV('Brython',style={'height':100,'width':200})

Pour éviter les conflits avec des mots-clés de Python, des attributs comme "class" ou "id" doivent être écrits avec une majuscule :

>    d = html.DIV('Brython',Id="zone",Class="container")

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

Les instances des classes HTML ont des attributs de même nom que les objets DOM correspondants. On peut donc par exemple récupérer l'option sélectionnée par l'attribut _selectedIndex_ de l'objet SELECT. Mais Brython ajoute quelques "sucres syntaxiques" pour rendre la manipulation plus conforme aux habitudes des codeurs Python

- pour la recherche d'objets par leur identifiant, ou par leur nom de balise, on utilise la syntaxe suivante :
 - `doc[obj_id]` renvoie l'objet d'après son identifiant, ou déclenche une exception `KeyError`
 - `doc[A]` renvoie une liste de tous les objets de type A (lien hypertexte) dans le document

- la méthode `get()` permet de rechercher des éléments de plusieurs façons :
 - `elt.get(name=N)` retourne une liste avec tous les éléments descendant de `elt` dont l'attribut `name` est égal à `N`
 - `elt.get(selector=S)` retourne une liste avec tous les élements descendant de `elt` dont le sélecteur CSS correspond à `S`

- le contenu d'un noeud DOM peut être lu ou modifié par les attributs _text_ ou _html_, correspondant respectivement aux attributs _innerText_ (ou _textContent_) et à _innerHTML_ des objets DOM

- la collection `options` associée à un objet SELECT a l'interface d'une liste Python :
 - accès à une option par son index : `option = elt.options[index]`
 - insertion d'une option à la position _index_ : `elt.options.insert(index,option)`
 - insertion d'une option en fin de liste : `elt.options.append(option)`
 - suppression d'une option : `del elt.options[index]`

- on peut itérer sur les enfants d'un élément par la syntaxe classique Python : 
>    for child in dom_object:
>       (...)

## Chaîne de requête

`doc` possède une fonction `query()`, appelée sans argument, qui renvoie le contenu de la chaine de requête _(query string)_ sous la forme d'un objet dont l'interface est la suivante :

- <code>doc.query()[<i>cle</i>]</code> : renvoie la valeur associée à _`cle`_. Si une clé a plus d'une valeur (ce qui peut se produire avec une balise SELECT avec l'attribut MULTIPLE, ou pour des balises `<INPUT type="checkbox">`), renvoie une liste de valeurs. Déclenche `KeyError` s'il n'y a pas de valeur pour cette clé

- <code>doc.query().getfirst(<i>cle[,defaut]</i>)</code> : renvoie la première valeur pour _`cle`_. Si aucune valeur n'est associée à la clé, renvoie _`defaut`_ s'il est fourni, sinon renvoie `None`

- <code>doc.query().getlist(<i>cle</i>)</code> : renvoie la liste des valeurs associées à la _`cle`_ (la liste vide s'il n'y a pas de valeur pour cette clé)

- <code>doc.query().getvalue(<i>cle[,defaut]</i>)</code> : comme `doc.query()[key]`, mais renvoie _`defaut`_ ou `None` s'il n'y a pas de valeur pour la clé



Evénements
----------

Pour attacher une fonction à un événement, on utilise la syntaxe 

>    element.onclick = callback

La fonction _callback_ doit prendre un seul argument, qui est une instance de la classe _DOMEvent_. En plus des attributs DOM (qui peuvent avoir des noms différents selon les navigateurs), cet objet possède notamment les attributs suivants :
<p><table border=1>
<tr><th>
Type d'événement
</th><th>
Attributs
</th></tr>
<tr><td>
clic ou déplacement de la souris
</td><td>
_x,y_ : position de la souris par rapport au bord supérieur gauche de la fenêtre
</td></tr>
<tr><td>
glisser-déposer (HTML5)
</td><td>
_data_ : donnée associée au déplacement
</td></tr>
</table>

Exemple :
<table>
<tr>
<td>
    <script type='text/python'>
    def mouse_move(ev):
        doc["trace"].value = '%s %s' %(ev.x,ev.y)
    
    doc["zone"].onmousemove = mouse_move
    </script>
    
    <input id="trace" value="">
    <br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
    passer la souris ici</textarea>

</td>
<td>
<script type='text/python'>
def mouse_move(ev):
    doc["trace"].value = '%s %s' %(ev.x,ev.y)

doc["zone"].onmousemove = mouse_move
</script>

<input id="trace" value="">
<br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
passer la souris ici</textarea>
</pre>
</td>
</tr>
</table>
