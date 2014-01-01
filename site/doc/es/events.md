## Eventos

Los elementos en la página web pueden reaccionar a eventos como el click del ratón, el movimiento del ratón sobre el elemento o cuando el ratón abandona el elemento, cuando se pulsa una tecla o cuando se deja de pulsar, etc

### Vinculando funciones de respuesta a un evento

`element.bind(`_event,callback1[,callback2...]_`)`
> Vincula una o varias funciones a un evento

> _event_ es una cadena que describe el evento a manejar : 'click', 'mouseover', 'mousedown', 'keydown', etc

> Las funciones de respuesta (o _callback_ functions) toman un único argumento, una instancia de la clase _DOMEvent_. 

`element.unbind(`_event[,callback1[,callback2...]]_`)`

>  elimina el vínculo entre el elemento y la función especificada. Si no se especifica una función de respuesta se eliminan todos los vínculos a _event_

### Objetos `DOMEvent`

Más allá de los atributos del DOM (los nombres pueden variar dependiendo del navegador), este objeto, *DOMEvent*, tendrá los siguientes atributos :

<table border=1>
<tr><th>Tipo de evento</th><th>Atributos</th></tr>
<tr><td>todos los eventos</td><td><tt>target</tt> : el nodo del DOM al cual se asocia el evento</td></tr>
<tr><td>click o movimiento del ratón</td><td><tt>x, y</tt> : posición del ratón en relación a la esquina superior izquierda de la ventana</td></tr>
<tr><td>"drag and drop" (HTML5)</td><td><tt>data</tt> : datos asociados con el movimiento</td></tr>
</table>

Ejemplo :
<table>
<tr>
<td>
    <script type='text/python'>
    from browser import doc
    def mouse_move(ev):
        doc["trace"].value = '%s %s' %(ev.x,ev.y)
    
    doc["zone"].bind('mousemove',mouse_move)
    </script>
    
    <input id="trace" value="">
    <br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
    Mueve el ratón por encima de esta área</textarea>
</td>
<td>
<script type='text/python'>
def mouse_move(ev):
    doc["trace"].value = '%s %s' %(ev.x,ev.y)

doc["zone"].bind('mousemove',mouse_move)
</script>

<input id="trace" value="">
<br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
Mueve el ratón por encima de esta área</textarea>
</td>
</tr>
</table>