Utiliser des objets Javascript
------------------------------

Il faut gérer la période transitoire où Brython va cohabiter avec Javascript ;-)

Un document HTML peut utiliser des scripts ou des librairies Javascript, et des scripts ou des librairies Python. Brython ne peut pas exploiter directement les objets Javascript : par exemple les attributs d'un objet sont récupérés par la méthode _\_\_getattr\_\__ de l'objet, qui n'existe pas pour les objets Javascript

Pour les utiliser dans un script Python, il faut les transformer explicitement par la fonction intégrée _JSObject()_

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
    
