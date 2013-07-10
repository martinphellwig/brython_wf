Usando objetos Javascript
-------------------------

Tenemos que manejar el periodo de transici&oacute;n en el que Brython va a coexistir con Javascript ;-)

### Argumentos de funciones de respuesta (callback functions)

El c&oacute;digo HTML puede contener funciones de respuesta a eventos del DOM y pasarle un n&uacute;mero de par&aacute;metros. La funci&oacute;n de respuesta los recibir&aacute; convertidos a tipos que Brython es capaz de gestionar :

<table border='1'>
<tr><th>Tipo de argumento en la funci&oacute;n de llamada</th><th>Argumento recibido por la funci&oacute;n de respuesta</th></tr>
<tr><td>Elemento del DOM</td><td>Instancia `DOMNode`</td></tr>
<tr><td>Evento del DOM</td><td>Instancia `DOMEvent`</td></tr>
<tr><td>Lista de nodos del DOM</td><td>lista de instancias `DOMNode`</td></tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>integer</td><td>Instancia `int`</td></tr>
<tr><td>float</td><td>Instancia `float`</td></tr>
<tr><td>string</td><td>Instancia `str`</td></tr>
<tr><td>Array Javascript</td><td>Instancia `list`</td></tr>
<tr><td>Objeto Javascript</td><td>Instancia `JSObject`</td></tr>
</table>



Por ejemplo, si el evento 'pulsar un bot&oacute;n' desencadena la ejecuci&oacute;n de la funci&oacute;n foo :

    <button onclick="foo(this,33,{'x':99})">Click</button>

esta funci&oacute;n tendr&aacute; la firma

    def foo(elt,value,obj):

donde _elt_ ser&aacute; instancia `DOMNode` para el elemento bot&oacute;n, _value_ ser&aacute; el entero 33 y _obj_ ser&aacute; una instancia de la clase integrada `JSObject`

Instancias de `JSObject` se usan como objetos Python ordinarios ; aqu&iacute;, el valor del atributo "x" es `obj.x`. Para convertirlos a un diccionario Python, se puede usar la funci&oacute;n integrada `dict()` : `dict(obj)['x']`

### Objetos en programas Javascript

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
