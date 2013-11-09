Creating a document
-------------------

Brython is made to program web applications, thus HTML pages that the user can interact with

A page is made of elements (texts, images, sounds...) that can be included in the page in two different ways :

- writing HTML code with tags, for instance

>    <html>
>    <body>
>    <b>Brython</b> is an implémentation of <a href="http://www.python.org">Python</a> 
>    for web browsers
>    </body>
>    </html>

- or writing Python code, using the built-in module `html` (described in the section Libraries)

>    <html>
>    <body>
>    <script type="text/python">
>    from html import A,B
>    doc <= B("Brython")+"is an implementation of "
>    doc <= A("Python",href="http://www.python.org")+" for web browsers"
>    </script>
>    </body>
>    </html>

