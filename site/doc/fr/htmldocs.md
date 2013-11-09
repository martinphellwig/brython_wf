Interface avec le navigateur
----------------------------

Brython est fait pour programmer des applications web, donc des pages HTML avec lesquelles l'utilisateur peut interagir

### Création d'une page

Une page est constituée d'élements (textes, images, sons...) qu'on peut intégrer de deux façons différentes :

- écrire du code HTML avec des balises, par exemple

>    <html>
>    <body>
>    <b>Brython</b> est une implémentation de <a href="http://www.python.org">Python</a> 
>    pour les navigateurs web
>    </body>
>    </html>

- ou écrire du code Python, en utilisant le module intégré `html` (décrit dans la section Librairies)

>    <html>
>    <body>
>    <script type="text/python">
>    from html import A,B
>    doc <= B("Brython")+"est une implémentation de "
>    doc <= A("Python",href="http://www.python.org")+"pour les navigateurs web"
>    </script>
>    </body>
>    </html>


### Accès aux éléments de la page

Pour accéder à un élément, on peut utiliser plusieurs méthodes. La plus courante est de se servir de son identifiant, c'est-à-dire de son attribut _id_ : si on a une zone de saisie définie par

>    <input id="data">

on peut obtenir une référence à ce champ par 

>    data = doc["data"]

`doc` est un mot-clé intégré de Brython qui référence le document HTML. Il se comporte comme un dictionnaire dont les clés sont les identifiants des éléments de la page. Si aucun élément ne possède l'identifiant spécifié, le programme déclenche une exception `KeyError`

On peut aussi récupérer tous les éléments d'un certain type, par exemple tous les liens hypertexte (balise HTML `A`), en  utilisant la syntaxe

>    import html
>    links = doc[html.A]

Enfin, tous les éléments de la page possèdent une méthode `get()` qui permet de rechercher des éléments de plusieurs façons :
 - `elt.get(name=N)` retourne une liste avec tous les éléments descendant de `elt` dont l'attribut `name` est égal à `N`
 - `elt.get(selector=S)` retourne une liste avec tous les élements descendant de `elt` dont le sélecteur CSS correspond à `S`

### Attributs et méthodes des éléments

Les éléments de la page possèdent des attributs et des méthodes qui dépendent du type de l'objet ; on peut les trouver sur de nombreux sites Internet

Comme le nom des attributs peut être différent d'un navigateur à l'autre, Brython définit des attributs supplémentaires qui fonctionnent dans tous les cas :

- le texte contenu dans un élément peut être récupéré ou modifié par l'attribut _text_
- le code HTML  contenu dans un élément peut être récupéré ou modifié par l'attribut _html_

- on peut itérer sur les enfants d'un élément par la syntaxe classique Python : 
>    for child in element:
>        (...)

- pour détruire un élément, utiliser le mot-clé `del`
>    zone = doc['zone']
>    del zone

La collection `options` associée à un objet SELECT a l'interface d'une liste Python :
 - accès à une option par son index : `option = elt.options[index]`
 - insertion d'une option à la position _index_ : `elt.options.insert(index,option)`
 - insertion d'une option en fin de liste : `elt.options.append(option)`
 - suppression d'une option : `del elt.options[index]`


Evénements
----------

Pour attacher une fonction à un événement qui survient sur un élément, on utilise la syntaxe 

<code>element.bind(_event,callback_)</code>

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
    
    doc["zone"].bind('mousemove',mouse_move)
    </script>
    
    <input id="trace" value="">
    <br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
    passer la souris ici</textarea>

</td>
<td>
<script type='text/python'>
def mouse_move(ev):
    doc["trace"].value = '%s %s' %(ev.x,ev.y)

doc["zone"].bind('mousemove',mouse_move)
</script>

<input id="trace" value="">
<br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
passer la souris ici</textarea>
</pre>
</td>
</tr>
</table>


## Chaîne de requête

`doc` possède un attribut `query` qui renvoie la chaine de requête _(query string)_ sous la forme d'un objet dont l'interface est la suivante :

- <code>doc.query[<i>cle</i>]</code> : renvoie la valeur associée à _`cle`_. Si une clé a plus d'une valeur (ce qui peut se produire avec une balise SELECT avec l'attribut MULTIPLE, ou pour des balises `<INPUT type="checkbox">`), renvoie une liste de valeurs. Déclenche `KeyError` s'il n'y a pas de valeur pour cette clé

- <code>doc.query.getfirst(<i>cle[,defaut]</i>)</code> : renvoie la première valeur pour _`cle`_. Si aucune valeur n'est associée à la clé, renvoie _`defaut`_ s'il est fourni, sinon renvoie `None`

- <code>doc.query.getlist(<i>cle</i>)</code> : renvoie la liste des valeurs associées à la _`cle`_ (la liste vide s'il n'y a pas de valeur pour cette clé)

- <code>doc.query.getvalue(<i>cle[,defaut]</i>)</code> : comme `doc.query()[key]`, mais renvoie _`defaut`_ ou `None` s'il n'y a pas de valeur pour la clé


