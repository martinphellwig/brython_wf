Evénements
==========

<script type="text/python">
from browser import doc, alert
</script>

Introduction
------------

Supposons que nous ayons dans la page un élément de type bouton, comme celui-ci : <button>un bouton</button>

Si vous cliquez dessus, il ne se passera rien, parce que nous ne lui avons pas dit comment réagir à un clic. Pour cela, il faut définir une fonction qui sera appelée quand on clique, en utilisant la syntaxe :

>    btn.bind('click', montre)

Le premier argument de `bind` est le type d'événement auquel le bouton doit réagir ; le deuxième est une fonction qui prend un seul argument, une instance de la classe `DOMEvent`. Par exemple :

>    def montre(ev):
>        print('ouah !')

(rappelez-vous que pour voir les résultats de `print` il faut ouvrir la console du navigateur)

Les instances de `DOMEvent` possèdent un certain nombre d'attribut qui varient selon le type d'événement. Dans le cas d'un clic, et plus généralement des événements relatifs à la souris, les attributs sont notamment

- `target` : l'élément sur lequel l'événement s'est produit
- `x, y` : position de la souris par rapport au bord supérieur gauche de la fenêtre

Par exemple, si on veut afficher le texte affiché sur le bouton, et la position de la souris :

>    def montre(ev):
>        print(ev.target.text, ev.x, ev.y)

Interface
---------
Pour la gestion des événements, les éléments d'une page possèdent les méthodes suivantes :

<code>elt.bind(_nom\_evt, gest_)</code>

> associe la fonction _gest_ à l'événement de nom _nom\_evt_

<code>elt.unbind(_nom\_evt[, gest_])</code>

> défait l'association de la fonction _gest_ à l'événement de nom _nom\_evt_. Si _gest_ n'est pas fourni, défait toutes les associations de l'événement

Objets `DOMEvent`
-----------------
Quel que soit le type d'événement géré, les instances de la classe `DOMEvent` possèdent les propriétés suivantes

<table border=1 cellpadding=5>

<tr>
<td>
`bubbles`
> un booléen qui indique si l'élément se propage aux parents de l'élément sur lequel l'événement s'est produit
</td>
<td>
<button id="_bubbles">test</button>
<script type="text/python">
doc['_bubbles'].bind('click',lambda ev:alert('bubbles : %s ' %ev.bubbles))
</script>
</td>
</tr>

<tr>
<td>
`cancelable`
> un booléen qui indique si on peut annuler l'événement
</td>
<td>
<button id="_cancelable">test</button>
<script type="text/python">
doc['_cancelable'].bind('click',lambda ev:alert('cancelable : %s ' %ev.cancelable))
</script>
</td>
</tr>

<tr>
<td>
`currentTarget`
> l'élément sur lequel on est en train de traiter l'événement (instance de `DOMNode`)
</td>
<td>
<button id="_currentTarget">test</button>
<script type="text/python">
doc['_currentTarget'].bind('click',lambda ev:alert('currentTarget : %s ' %ev.currentTarget))
</script>
</td>
</tr>

<tr>
<td>
`defaultPrevented`
> booléen qui indique si on a appelé la méthode `preventDefault()` sur l'élément
</td>
<td>
<button id="_defaultPrevented">test</button>
<script type="text/python">
doc['_defaultPrevented'].bind('click',lambda ev:alert('defaultPrevented : %s ' %ev.defaultPrevented))
</script>
</td>
</tr>

<tr>
<td>
`eventPhase`
> indique quelle [phase du flux d'événement](http://www.w3.org/TR/DOM-Level-3-Events/#event-flow) est en cours de traitement
</td>
<td>
<button id="_eventPhase">test</button>
<script type="text/python">
doc['_eventPhase'].bind('click',lambda ev:alert('eventPhase : %s ' %ev.eventPhase))
</script>
</td>
</tr>

<tr>
<td>
`target`
> l'élément sur lequel l'événement s'est produit (instance de `DOMNode`)
</td>
<td>
<button id="_target">test</button>
<script type="text/python">
doc['_target'].bind('click',lambda ev:alert('target : %s ' %ev.target))
</script>
</td>
</tr>

<tr><td>`timeStamp`
> la date/heure à laquelle l'événement s'est produit (en millisecondes depuis le 1/1/1970 à 0h)
</td>
<td>
<button id="_timeStamp">test</button>
<script type="text/python">
doc['_timeStamp'].bind('click',lambda ev:alert('timeStamp : %s ' %ev.timeStamp))
</script>
</td>
</tr>

<tr><td>`type`
> le type d'événement    
</td>
<td>
<button id="_type">test</button>
<script type="text/python">
doc['_type'].bind('click',lambda ev:alert('type : %s ' %ev.type))
</script>
</td>
</tr>

</table>

et les méthodes suivantes

`preventDefault()`
> empêche l'exécution de l'action par défaut associée à l'événement

> **Exemple**

> Quand on clique sur une case à cocher, l'action par défaut est de marquer ou d'effacer un trait à l'intérieur de la case : 

>> case à cocher (comportement par défaut) <input type="checkbox">

> Pour désactiver ce comportement sur la case : 

>>    def annule(ev):
>>        ev.preventDefault()
>>    
>>    doc["disabled_cbox"].bind('click',annule)

>> résultat :

>> case à cocher désactivée <input type="checkbox" id="disabled_cbox">

<script type="text/python">
def annule(ev):
    ev.preventDefault()

doc["disabled_cbox"].bind('click',annule)
</script>

`stopPropagation()`
> arrête la propagation de la gestion de l'événement aux éléments parents de celui en cours de traitement

> **Exemple**

> Dans la zone colorée ci-dessous

<div id="jaune" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">extérieur<p>
<div id="bleu" style="background-color:blue;color:white;padding:20px;">intérieur, propagation normale</div>
<div id="vert" style="background-color:green;color:white;padding:20px;">intérieur, propagation arrêtée</div>
</div>

> les 3 éléments (le cadre extérieur jaune et les cadres intérieurs bleu et vert) gèrent l'événement clic

<blockquote>
<div id="zzz_source">
    from browser import doc, alert
    
    def show(ev):
        alert('clic sur %s' %ev.currentTarget.id)
    
    def show_stop(ev):
        alert('clic sur %s' %ev.currentTarget.id)
        ev.stopPropagation()
    
    doc["jaune"].bind('click',show)
    doc["bleu"].bind('click',show)
    doc["vert"].bind('click',show_stop)
</div>
</blockquote>

<div id="zzz"></div>

> Un clic sur la zone jaune provoque l'appel de la fonction `show()`, donc l'affichage du message "clic sur jaune"

> Un clic sur la zone bleue provoque d'abord l'affichage du message "clic sur bleu". Puis l'événement se propage au parent, la zone jaune : comme cette zone gère aussi l'événement clic, le navigateur appelle la même fonction `show()` et affiche le message "clic sur jaune" (remarquez que l'attribut `currentTarget` est modifié quand l'événement se propage)

> Quand on clique sur la zone verte, le message "clic sur vert" s'affiche. Cet événement est géré par la fonction `show_stop()`, qui se termine par

>>    ev.stopPropagation()

> L'événement ne se propage donc pas au niveau supérieur et le traitement s'arrête sans afficher "clic sur jaune"


<script type="text/python">
eval(doc["zzz_source"].text)
</script>

