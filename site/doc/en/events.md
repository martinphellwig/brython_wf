Events
==========

<script type="text/python">
from browser import doc, alert
</script>

Introduction
------------

Suppose we have in a page a element of type button, like this one : <button>a button</button>

If you click on it, nothing will happen, because no instruction was given on how to react to a click. For that, the action to take is defined by this syntax :

>    btn.bind('click', show)

The first argument of `bind` is the type of event the button must handle ; the second is a function that takes a single argument, an instance of the class `DOMEvent`. For instance :

>    def show(ev):
>        print('ok !')

(remember that to see the results of `print` the browser console must be open)

Instances of `DOMEvent` have a number of attributes that depend on the event type. In the case of a click, and more generally for events related to the mouse, the attributes include

- `target` : the element the event was dispatched on
- `x, y` : position of the mouse relatively to the upper left corner of the window

For instance, to print the button text and the mouse position :

>    def show(ev):
>        print(ev.target.text, ev.x, ev.y)

Interface
---------
For events management, the elements of a page have the following methods :

<code>elt.bind(_evt\_name, handler_)</code>

> associates function _handler_ to the event named _evt\_name_

<code>elt.unbind(_evt\_name[, handler_])</code>

> removes the association of function _handler_ to the event named _evt\_name_. If _handler_ is omitted, removes all the associations for the event

`DOMEvent` objects
------------------
(information by Mozilla Contributors, found at [https://developer.mozilla.org/en-US/docs/Web/API/event](https://developer.mozilla.org/en-US/docs/Web/API/event))

Whatever the event type, instances of class `DOMEvent` have the following attributes

<table border=1 cellpadding=5>

<tr>
<td>
`bubbles`
> boolean, indicates whether the given event bubbles up through the DOM or not
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
> boolean, indicates whether the event is cancelable or not
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
> instance of `DOMNode` ; identifies the current target for the event, as the event traverses the DOM. It always refers to the element the event handler has been attached to as opposed to event.target which identifies the element on which the event occurred.
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
> boolean indicating whether or not event.preventDefault() was called on the event
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
> integer, indicates which phase of the [event flow](http://www.w3.org/TR/DOM-Level-3-Events/#event-flow) is currently being evaluated
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
> `DOMNode` instance ; the object the event was dispatched on. It is different than `event.currentTarget` when the event handler is called in bubbling or capturing phase of the event
</td>
<td>
<button id="_target">test</button>
<script type="text/python">
doc['_target'].bind('click',lambda ev:alert('target : %s ' %ev.target))
</script>
</td>
</tr>

<tr><td>`timeStamp`
> integer, the time (in milliseconds since Jan. 1st, 1970 at 0h) at which the event was created
</td>
<td>
<button id="_timeStamp">test</button>
<script type="text/python">
doc['_timeStamp'].bind('click',lambda ev:alert('timeStamp : %s ' %ev.timeStamp))
</script>
</td>
</tr>

<tr><td>`type`
> string, contains the event type
</td>
<td>
<button id="_type">test</button>
<script type="text/python">
doc['_type'].bind('click',lambda ev:alert('type : %s ' %ev.type))
</script>
</td>
</tr>

</table>

and the following methods

`preventDefault()`
> prevents the execution of the action associated by default to the event

> **Example**

> When a checkbox is clicked on, the default action is to show or hide a tick inside the checkbox : 

>> checkbox (default behaviour) <input type="checkbox">

> To disable this behaviour on the checkbox : 

<blockquote>
<div id="disable_cbox">
    def _cancel(ev):
        ev.preventDefault()
    
    doc["disabled_cbox"].bind('click',_cancel)
</div>
</blockquote>

>> result :

>> disabled checkbox <input type="checkbox" id="disabled_cbox">

<script type="text/python">
exec(doc["disable_cbox"].text)
</script>

`stopPropagation()`
> prevents further propagation of the current event

> **Example**

> In the coloured zone below

<div id="yellow" style="background-color:yellow;width:200px;padding:20px;margin-left:100px;">outer<p>
<div id="blue" style="background-color:blue;color:white;padding:20px;">inner, normal propagation</div>
<div id="green" style="background-color:green;color:white;padding:20px;">inner, propagation stopped</div>
</div>

> the 3 elements (the outer yellow frame and the inner blue and green frames) handle the click event

<blockquote>
<div id="zzz_source">
    from browser import doc, alert
    
    def show(ev):
        alert('click on %s' %ev.currentTarget.id)
    
    def show_stop(ev):
        alert('clic on %s' %ev.currentTarget.id)
        ev.stopPropagation()
    
    doc["yellow"].bind('click',show)
    doc["blue"].bind('click',show)
    doc["green"].bind('click',show_stop)
</div>
</blockquote>

<div id="zzz"></div>

> Clicking on the yellow zone triggers the call of function `show()`, which prints the message "click on yellow"

> A click on the blue zone triggers the alert message "click on blue". Then the event propagates to the parent, the yellow frame. Since this frame also handles the event "click", the browser calls the associated action, the same function `show()`, and shows the message "click on yellow" (notice that the attribute `currentTarget` is updated when the event propagates)

> Clicking on the green zone cause the message "click on green" to pop up. This event is handled by the function `show_stop()`, which ends in

>>    ev.stopPropagation()

> So the event does not propagate to the upper level and the execution exits without an alert box "click on yellow"


<script type="text/python">
eval(doc["zzz_source"].text)
</script>

