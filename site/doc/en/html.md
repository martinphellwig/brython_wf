module html
-----------

This module exposes the HTML tags. The tag name is in uppercase letters. As for all Python modules, you can 

- either only import the module name : `import html`, then reference the tags by `html.DIV`
- or import the names required in the programe : `from html import A,B,DIV`, or if there is no risk of naming conflicts : `from html import *`

The syntax to create an object (eg a hyperlink) is :
><code>A(_[content,[attributes]]_)</code>

- _content_ is the child node of the the object ; it can be a Python object such as a string, a number, a list etc., or an instance of another class in the `html` module
- _attributes_ is a sequence of keywords corresponding to the attributes of the HTML tag. These attributes must be provided as Javascript syntax, not CSS: *backgroundColor* instead of *background-color*
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
>    link <= B('connexion')
>    link.href = 'http://example.com'

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
>    doc <= P() + 'I repeat: the site is ' + link

the link will only show in the second line. One solution is to clone the original object :

>    link = A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= P() + 'I repeat: the site is ' + link.clone()

As a rule of thumb, instances of classes HTML attributes have the same name as the corresponding DOM objects. It can for example retrieve the option selected by the `selectedIndex` attribute of the `SELECT` object. Brython adds a few things to make the manipulation a bit more Pythonic



