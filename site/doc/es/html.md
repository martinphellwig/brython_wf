módulo **browser.html**
-----------------------

Este módulo permite acceder a las etiquetas HTML. El nombre de la etiqueta se escribe en mayúsculas. 

The classes defined are :

- Etiquetas HTML4 : `A, ABBR, ACRONYM, ADDRESS, APPLET, B, BDO, BIG, BLOCKQUOTE, BUTTON, CAPTION, CENTER, CITE, CODE, DEL, DFN, DIR, DIV, DL,EM, FIELDSET, FONT, FORM, FRAMESET,H1, H2, H3, H4, H5, H6,I, IFRAME, INS, KBD, LABEL, LEGEND,MAP, MENU, NOFRAMES, NOSCRIPT, OBJECT,OL, OPTGROUP, PRE, Q, S, SAMP,SCRIPT, SELECT, SMALL, SPAN, STRIKE,STRONG, STYLE, SUB, SUP, TABLE,TEXTAREA, TITLE, TT, U, UL, VAR, BODY, COLGROUP, DD, DT, HEAD, HTML, LI, P, TBODY, OPTION, TD, TFOOT, TH, THEAD, TR,AREA, BASE, BASEFONT, BR, COL, FRAME, HR, IMG, INPUT, ISINDEX, LINK, META, PARAM`
- Etiquetas HTML5 : `ARTICLE, ASIDE, AUDIO, BDI, CANVAS, COMMAND, DATALIST, DETAILS, DIALOG, EMBED, FIGCAPTION, FIGURE, FOOTER, HEADER, KEYGEN, MARK, METER, NAV, OUTPUT, PROGRESS, RP, RT, RUBY, SECTION, SOURCE, SUMMARY,TIME,TRACK,VIDEO,WBR`

La sintaxis para crear un objeto (eg un hiperenlace) es :

<code>A(*[content,[attributes]]*)</code>

- _content_ es el nodo hijo del objeto ; puede ser un objeto Python como un string, un número, una lista, etc, o una instancia de otra clase del módulo `html`
- _attributes_ es una secuencia de palabras clave (keywords) correspondientes a los atributos de la etiqueta HTML. Estos atributos deben ser introducidos con sintaxis Javascript, no CSS: _backgroundColor_ en lugar de _background-color_

Ejemplo :

>    from browser import html
>    link1 = html.A('Brython', href='http://www.brython.info')
>    link2 = html.A(html.B('Python'), href='http://www.python.org')

Para el atributo _style_, el valor debe ser un diccionario :

>    d = html.DIV('Brython', style={'height':100, 'width':200})

Para evitar conflictos con las palabras clave de Python, atributos como _class_ o _id_ se deben escribir con la primera letra en mayúscula :

>    d = html.DIV('Brython',Id="zone", Class="container")

También se puede crear un objeto sin argumentos y añadirlos a posteriori:

- Para añadir un nodo hijo hay que usar el operador <=
- Para añadir atributos se usa la sintaxis clásica de Python : `object.attribute = value`

Ejemplo :

>    link = A()
>    link <= B('connexion')
>    link.href = 'http://example.com'

También se pueden crear múltiples elementos al mismo nivel usando el signo más (+) :

>    row = TR(TH('LastName') + TH('FirstName'))

Aquí se puede ver como crear una caja de selección a partir de una lista (mediante la combinación de los operadores descritos y sintaxis Python) :

>    items = ['one', 'two', 'three']
>    sel = SELECT()
>    for i, elt in enumerate(items):
>        sel <= OPTION(elt, value = i)
>    doc <= sel

Es importante resaltar que la creación de una instancia de una clase conlleva la creación HTML a partir de un único objeto DOM. Si asignamos la instancia a una variable, no podrá ser usada en varios sitios. Por ejemplo, con este codigo :

>    link = A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= P() + 'I repeat: the site is ' + link

El link solo se mostrará en la segunda línea. Una solución sería clonar el objeto original :

>    link = A('Python', href='http://www.python.org')
>    doc <= 'Official Python Website: ' + link
>    doc <= P() + 'I repeat: the site is ' + link.clone()

Como regla general, los atributos de las instancias de clases HTML tienen el mismo nombre que los objetos DOM correspondientes. Por ejemplo, podemos obtener la opción seleccionada por el atributo _selectedIndex_ del objeto SELECT. Brython añade algunas cosas que permiten que la manipulación sea un poco más Pythónica