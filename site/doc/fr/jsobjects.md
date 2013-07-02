Utiliser des objets Javascript
------------------------------

Il faut gérer la période transitoire où Brython va cohabiter avec Javascript ;-)

### Arguments des fonctions de rappel

Le code HTML peut attacher des fonctions de rappel à des événement DOM et leur passer un certain nombre de paramètres. La fonction de rappel les recevra transformés en types gérés par Brython :

<table border='1'>
<tr><th>Type d'argument dans l'appel de fonction</th><th>Argument reçu par la fonction de rappel</th></tr>
<tr><td>Elément DOM</td><td>instance de `DOMNode`</td></tr>
<tr><td>Evénement DOM</td><td>instance de `DOMEvent`</td></tr>
<tr><td>Liste de DOM nodes</td><td>liste d'instances de `DOMNode`</td></tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>entier</td><td>instance de `int`</td></tr>
<tr><td>réel</td><td>instance de `float`</td></tr>
<tr><td>chaine</td><td>instance de `str`</td></tr>
<tr><td>tableau Javascript</td><td>instance de `list`</td></tr>
<tr><td>objet Javascript</td><td>instance de `JSObject`</td></tr>
</table>

Par exemple, si l'événement clic sur un bouton déclenche l'exécution de la fonction _foo()_ :

    <button onclick="foo(this,33,{'x':99})">Click</button>

cette fonction aura comme signature

    def foo(elt,valeur,obj):

où _elt_ sera l'instance de `DOMNode` pour l'élément bouton, _valeur_ sera l'entier 33 et _obj_ sera une instance de la classe intégrée `JSObject`

Les instances de `JSObject` sont utilisées comme des objets Python ordinaires ; ici, la valeur de l'attribut "x" est `obj.x`. Pour les convertir en dictionnaire Python, utilisez la fonction intégrée `dict()` : `dict(obj)['x']`

### Objets dans des programmes Javascript

Un document HTML peut utiliser des scripts ou des librairies Javascript, et des scripts ou des librairies Python. Brython ne peut pas exploiter directement les objets Javascript : par exemple les attributs d'un objet sont récupérés par la méthode _\_\_getattr\_\__ de l'objet, qui n'existe pas pour les objets Javascript

Pour les utiliser dans un script Python, il faut les transformer explicitement par la fonction intégrée `JSObject()`

Par exemple :

    <script type="text/javascript">
    circle = {surface:function(r){return 3.14*r*r}}
    </script>
    <script type="text/python">
    doc['result'].value = JSObject(circle).surface(10)
    </script>


Voici un exemple plus complet qui montre comment utiliser la populaire librairie jQuery :

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
      def change_couleur(element):
          _divs=doc.get(tag="div")
          for _div in _divs:
              if _div.style.color != "blue":
                 _div.style.color = "blue"
              else:
                 _div.style.color = "red"
    
      _jQuery=JSObject($("body"))
      _jQuery.click(change_couleur)
    
    </script>
    
    <body onload="brython()">
      <div>Cliquer ici</div>
      <div>pour parcourir</div>
      <div>ces divs.</div>
    <script>
    </script>
     
    </body>
    </html>
    
