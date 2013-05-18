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
