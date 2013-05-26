## Handling of HTML documents

An HTML page is seen as a tree whose root node is represented by the tag `doc`. Subsequent nodes are either built-in Python objects (strings, integers ...) or objects created by the functions corresponding to their HTML tags

These functions stand in the built-in module `html` that must be imported. The tag name is in uppercase letters. As for all Python modules, you can 

- either only import the module name : `import html`, then reference the tags by `html.DIV`
- or import the names required in the programe : `from html import A,B,DIV`, or if there is no risk of naming conflicts : `from html import *`

The syntax to create an object (eg a hyperlink) is :
> `A(<i>[content,[attributes]]</i>)`

> _content_ is the child node of the the object ; _attributes_ is a sequence of keywords corresponding to the attributes of the HTML tag

These attributes must be provided as Javascript syntax, not CSS: _backgroundColor_ instead of _background-color_
</dl>
Example :

>    import html
>    link1 = html.A('Brython', href='http://www.brython.info')
>    link2 = html.A(html.B('Python'), href='http://www.python.org')

For the _style_ attribute, the value must be a dictionary :

>    d = html.DIV('Brython', style={'height':100, 'width':200})

To avoid conflicts with Python keywords, attributes such as _class_ or _id_ must be capitalized :

>    d = html.DIV('Brython',Id="zone",Class="container")

You can also create an object without argument, then build it up:

- to add a child node, use the <= operator
- to add attributes, use the classic Python syntax : `object.attribute = value`
Example :    
>    link = A()
>    link <= B('connexion')    link.href = 'http://example.com'

You can also create multiple elements at the same level by using the plus (+) sign :

>    row = TR(TH('LastName') + TH('FirstName'))

Here is how to create a selection box from a list (by combining these operators and Python syntax) :

>    items = ['one', 'two', 'three']
>    sel = SELECT()
>    for i, elt in enumerate(items):
>        sel <= OPTION(elt, value = i)
>    doc <= sel

It is important to note that the creation of an instance of a class involves creating HTML from a single DOM object. If we assign the instance to a variable, you can not use it in several places. For example, with this code :

>    link = A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= P( + 'I repeat: the site is ' + link

the link will only show in the second line. One solution is to clone the original object :

>    link = A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= P() + 'I repeat: the site is ' + link.clone()

As a rule of thumb, instances of classes HTML attributes have the same name as the corresponding DOM objects. It can for example retrieve the option selected by the `selectedIndex` attribute of the `SELECT` object. Brython adds a few things to make the manipulation a bit more Pythonic

- To search for objects by identifier or by their tag name, use the following syntax :

 - `doc[obj_id]`  returns the object from its identifier, or throws a `KeyError`
 - `doc[A]`  returns a list of all objects of type A (hyperlink) in the document
 - the `get()` method can be used to search for elements :

  - `elt.get(name=N)` returns a list of all the elements within _elt_ whose attribute `name` is equal to `N`
  - `elt.get(selector=S)` returns a list of all the elements within _elt_ that match the specified selector


- the content of a DOM node can be read or modified by the _text_ or _html_ attributes, corresponding to _innerText_ (or _textContent_) and _innerHTML_ respectively for DOM objects

- The `options` collection associated with a SELECT object has an interface of a Python list :

 - access to an option by its index : `option = elt.options[index]`
 - insertion of an option at the _index_ position : `elt.options.insert(index,option)`
 - insertion of an option at the end of the list : `elt.options.append(option)`
 - deleting an option : `del elt.options[index]`

- it is possible to iterate the object's children using the typical Python syntax : 

>    for child in dom_object:
>       (...)

## Query string

`doc` supports the function `query()`, called with no argument, that returns the content of the query string as an object with the following attributes and methods :

- <code>doc.query()[<i>key</i>]</code> : returns the value associated with _`key`_. If a key has more than one value (which might be the case for SELECT tags with the attribute MULTIPLE set, or for `<INPUT type="checkbox">` tags), returns a list of the values. Raises `KeyError` if there is no value for the key

- <code>doc.query().getfirst(<i>key[,default]</i>)</code> : returns the first value for _`key`_. If no value is associated with the key, returns _`default`_ if provided, else returns `None`

- <code>doc.query().getlist(<i>key</i>)</code> : returns the list of values associated with _`key`_ (the empty list if there is no value for the key)

- <code>doc.query().getvalue(<i>key[,default]</i>)</code> : same as `doc.query()[key]`, but returns _`default`_ or `None` if there is no value for the key


## Events

To attach a function to an event, we use the syntax 

<blockquote>`element.onclick = callback`</blockquote>

The _callback_ function will only take a single argument, an instance of the _DOMEvent_ class. Beyond the DOM attributes (the names can vary based on browsers), this object has in particular these attributes :

<table border=1>
<tr><th>Type of event</th><th>Attributes</th></tr>
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
    
    doc["zone"].onmousemove = mouse_move
    </script>
    
    <input id="trace" value="">
    <br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
    move the mouse over here</textarea>
</td>
<td>
<script type='text/python'>
def mouse_move(ev):
    doc["trace"].value = '%s %s' %(ev.x,ev.y)

doc["zone"].onmousemove = mouse_move
</script>

<input id="trace" value="">
<br><textarea id="zone" rows=7 columns=30 style="background-color:gray">
move the mouse over here</textarea>
</td>
</tr>
</table>