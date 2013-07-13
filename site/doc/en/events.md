## Events

The elements in the web page can react to events such as a mouse click, the mouse moving over it or leaving it, a key pressed or released, etc

### Binding callback functions to an event

To bind one or several function(s) to an event, use the syntax 

<blockquote>`element.bind(event,callback1[,callback2...])`</blockquote>

The _callback_ functions take a single argument, an instance of the _DOMEvent_ class. Beyond the DOM attributes (the names can vary based on browsers), this object has in particular these attributes :

<table border=1>
<tr><th>Type of event</th><th>Attributes</th></tr>
<tr><td>all events</td><td><tt>target</tt> : the DOM node the event was bound to</td></tr>
<tr><td>click or mouse movement</td><td><tt>x, y</tt> : mouse position in relation to the top left corner of the window</td></tr>
<tr><td>drag and drop (HTML5)</td><td><tt>data</tt> : data associated with the movement</td></tr>
</table>

Example :
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
    move the mouse over here</textarea>
</td>
<td>
<script type='text/python'>
def mouse_move(ev):
    doc["trace"].value = '%s %s' %(ev.x,ev.y)

doc["zone"].bind('mousemove',mouse_move)
</script>

<input id="trace" value="">
<br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
move the mouse over here</textarea>
</td>
</tr>
</table>

### Unbinding


`element.unbind(event,callback1[,callback2...])` removes the binding of the specified functions

`element.unbind(event)` removes all the bindings for the event


