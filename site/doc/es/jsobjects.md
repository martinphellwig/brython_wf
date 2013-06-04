Usando objetos Javascript
-------------------------

Tenemos que manejar el periodo de transici&oacute;n en el que Brython va a coexistir con Javascript ;-)

Un documento HTML puede usar librer&iacute;as o scripts Javascript, adem&aacute;s de librer&iacute;as y scripts Python. Brython no puede hacer uso de forma directa de los objetos Javascript : por ejemplo, la b&uacute;squeda de atributos se hace mediante el m&eacute;todo  _\_\_getattr()\_\__, que no existe para objetos Javascript

Para poder ser usados en un script Python, deben ser transformados expl&iacute;citamente por la funci&oacute;n integrada _JSObject()_

Por ejemplo :

>    <script type="text/javascript">
>    circle = {surface:function(r){return 3.14*r*r}}
>    </script>
>    <script type="text/python">
>    doc['result'].value = JSObject(circle).surface(10)
>    </script>

En la siguiente porci&oacute;n de c&oacute;digo tenemos un ejemplo m&aacute;s completo de c&oacute;mo podr&iacute;as usar la popular librer&iacute;a jQuery :

    <html>
    <head>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js">
    </script>
    <script src="../../src/brython.js"></script>
    </head>
    
    <script type="text/python">
      def toggle_color(element):
          _divs=doc.get(tag="div")
          for _div in _divs:
              if _div.style.color != "blue":
                 _div.style.color = "blue"
              else:
                 _div.style.color = "red"
    
      _jQuery=JSObject($("body"))
      _jQuery.click(toggle_color)
    
    </script>
    
    <body onload="brython()">
      <div>Click here</div>
      <div>to iterate through</div>
      <div>these divs.</div>
    <script>
    </script>
     
    </body>
    </html>