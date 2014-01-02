Usando objetos Javascript
-------------------------

Tenemos que manejar el periodo de transici&oacute;n en el que Brython va a coexistir con Javascript ;-)

### Llamando funciones Brython desde Javascript

Un uso  frecuente es el uso de código en línea dentro de una etiqueta HTML :

    <button onclick="echo()">

Para hacer que una función Brython sea usable en este contexto, debe sear expuesto de forma explícita mediante el uso de la función <code>expose(_func_)</code> presente en el módulo **javascript**. La forma más simple de uso es mediante un decorador :

    from javascript import expose
    
    @expose
    def echo():
        ...

### Argumentos de funciones de respuesta (callback functions)

El código HTML puede contener funciones de respuesta a eventos del DOM y pasarle un número de parámetros. La función de respuesta los recibirá convertidos a tipos que Brython es capaz de gestionar :

<table border='1'>
<tr><th>Tipo de argumento en la función de llamada</th><th>Argumento recibido por la función de respuesta</th></tr>
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

Por ejemplo, si el evento 'pulsar un botón' desencadena la ejecución de la función foo :

    <button onclick="foo(this,33,{'x':99})">Click</button>

esta función tendrá la firma

    def foo(elt,value,obj):

donde _elt_ será instancia `DOMNode` para el elemento botón, _value_ será el entero 33 y _obj_ será una instancia de la clase integrada `JSObject`

Instancias de `JSObject` se usan como objetos Python ordinarios ; aqu&iacute;, el valor del atributo "x" es `obj.x`. Para convertirlos a un diccionario Python, se puede usar la funci&oacute;n integrada `dict()` : `dict(obj)['x']`

### Objetos en programas Javascript

Un documento HTML puede usar librer&iacute;as o scripts Javascript, adem&aacute;s de librer&iacute;as y scripts Python. Brython no puede hacer uso de forma directa de los objetos Javascript : por ejemplo, la b&uacute;squeda de atributos usa el atributo  _\_\_class\_\__, que no existe para objetos Javascript

Para poder ser usados en un script Python, deben ser transformados expl&iacute;citamente por la funci&oacute;n integrada _JSObject()_

Por ejemplo :

    <script type="text/javascript">
    circle = {surface:function(r){return 3.14*r*r}}
    </script>

    <script type="text/python">
    doc['result'].value = JSObject(circle).surface(10)
    </script>

### Usando constructores Javascript

Si una función Javascript es un objecto constructor, puede ser llamado en código Javascript mediante la palabra clave `new`, se podría usar en Brython transformando esa palabra clave en la función integrada `JSConstructor()`

<code>JSConstructor(_constr_)</code> devuelve una función que cuando se la invoca con argumentos devuelve un objeto Python que corresponde al objeto Javascript creado mediante el constructor _constr_

Por ejemplo :

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
    rectangle = JSConstructor(Rectangle)
    alert(rectangle(10,10,30,30).surface())
    </script>

### jQuery example
    
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
