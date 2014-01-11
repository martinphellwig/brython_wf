module **javascript**
---------------------

The module **javascript** allows interaction with the objects defined in Javascript programs and libraries present in the same page as the Brython program

It defines two classes :

**javascript**.`JSObject`
> class whose instances wrap Javascript objects

> <code>JSObject(_jsobj_)</code> returns an object *brobj* that wraps the Javascript object *jsobj*. Operations performed on the instance of `JSObject` impact the Javascript object by converting as accurately as possible Python types into Javascript types

> If *jsobj* is a function, the arguments passed to *brobj* are converted before being passed to *jsobj* in this way

> <table border='1'>
<tr><th>Argument in Brython function call</th><th>Argument passed to Javascript function</th></tr>
<tr><td>DOM element</td><td>`DOMNode` instance</td></tr>
<tr><td>DOM event</td><td>`DOMEvent` instance</td></tr>
<tr><td>DOM nodes list</td><td>list of `DOMNode` instances</td></tr>
<tr><td>`null, true, false`</td><td>`None, True, False`</td></tr>
<tr><td>integer</td><td>`int` instance</td></tr>
<tr><td>float</td><td>`float` instance</td></tr>
<tr><td>string</td><td>`str` instance</td></tr>
<tr><td>Javascript array</td><td>`list` instance</td></tr>
<tr><td>Javascript object</td><td>`JSObject` instance</td></tr>
</table>

> The result is converted to a Brython object using the reverse operations

**browser**.`JSConstructor`
> class whose instances represent Javascript constructors, ie functions used with the Javascript keyword `new`

> <code>JSConstructor(_jsconstr_)</code> returns a Brython object. This object is callable ; it returns an instance of `JSObject` representing the Javascript obtained by passing to the constructor *jsconstr* the arguments converted as indicated in the table above

Exemples
--------
Using `JSObject` with the Javascript library jQuery

>    from javascript import JSObject
>
>    def callback(*args):
>        ...
>
>    _jQuery=JSObject($("body"))
>    _jQuery.click(callback)

Using `JSConstructor` with the Javascript library three.js :

>    from javascript import JSConstructor
>    
>    cameraC = JSConstructor( THREE.PerspectiveCamera )
>    camera = cameraC( 75, 1, 1, 10000 )
