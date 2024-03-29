Utiliser des objets Javascript
------------------------------

Il faut gérer la période transitoire où Brython va cohabiter avec Javascript ;-)

### Accès aux objets Brython depuis Javascript

Brython n'expose par défaut que deux noms dans l'espace de noms global de Javascript :

> `brython()` : la fonction exécutée au lancement de la page web

> `__BRYTHON__` : un objet utilisé en interne par Brython pour stocker les objets nécessaires à l'exécution des scripts

Par défaut, un programme Javascript ne donc peut pas accéder aux objets Brython. Par exemple, si on veut utiliser une fonction `echo()` définie dans un script Brython pour réagir à un événement sur un élément de la page, au lieu de la syntaxe

>    <button onclick="echo()">

qui ne fonctionne pas puisque le nom _echo_ n'est pas accessible depuis Javascript, il faut plutôt affecter un id à l'élément :

>    <button id="echo">

et définir le lien entre cet élément et un événement _click_ par :

>    doc['echo'].bind('click',echo)

Une autre possibilité est de forcer l'inscription de _echo_ dans l'espace de noms Javascript en le définissant comme attribut de l'objet `window` du module **browser** :

>    from browser import window
>    window.echo = echo

Cette méthode n'est pas recommandée, parce qu'elle introduit un risque de conflit avec des noms définis dans un programme ou une librairie Javascript utilisée dans la page

### Utilisation d'objets Javascript dans un script Brython

Un document HTML peut utiliser des scripts ou des librairies Javascript, et des scripts ou des librairies Python. Brython ne peut pas exploiter directement les objets Javascript : par exemple la recherche des attributs d'un objet utilise l'attribut _\_\_class\_\__ de l'objet, qui n'existe pas pour les objets Javascript

Pour les utiliser dans un script Python, il faut les transformer explicitement par la fonction `JSObject()` définie dans le module **javascript**

Par exemple :

>    <script type="text/javascript">
>    circle = {surface:function(r){return 3.14*r*r}}
>    </script>
>    <script type="text/python">
>    from browser import doc
>    from javascript import JSObject
>    doc['result'].value = JSObject(circle).surface(10)
>    </script>


### Utilisation de constructeurs Javascript dans un script Brython

Si une fonction Javascript est un constructeur d'objets, qu'on peut appeler dans du code Javascript avec le mot-clé `new`, on peut l'utiliser avec Brython en la transformant par la fonction `JSConstructor()` du module **javascript**

<code>JSConstructor(_constr_)</code> renvoie une fonction qui, quand on lui passe des arguments, retourne un objet Python correspondant à l'objet Javascript constuit par le constructeur *constr*

Par exemple :

    <script type="text/javascript">
    function Rectangle(x0,y0,x1,y1){
        this.x0 = x0
        this.y0 = y0
        this.x1 = x1
        this.y1 = y1
        this.surface = function(){return (x1-x0)*(y1-y0)}
    }
    </script>
    
    <script type="text/python">
    from browser import alert
    from javascript import JSConstructor
    rectangle = JSConstructor(Rectangle)
    alert(rectangle(10,10,30,30).surface())
    </script>

### Exemple d'interface avec jQuery

Voici un exemple plus complet qui montre comment utiliser la populaire librairie jQuery :

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
        from browser import doc
        from javascript import JSObject
        
        def change_color(ev):
          _divs=doc.get(selector='div')
          for _div in _divs:
              if _div.style.color != "blue":
                 _div.style.color = "blue"
              else:
                 _div.style.color = "red"
        
        # créer un alias pour "$" de jQuery (causerait une SyntaxError en Python)
        jq = jQuery.noConflict(true)
        _jQuery=JSObject(jq("body"))
        _jQuery.click(change_color)    
    </script>
    
    <body onload="brython()">

      <div>Cliquer ici</div>
      <div>pour parcourir</div>
      <div>ces divs.</div>
     
    </body>
    </html>
    

