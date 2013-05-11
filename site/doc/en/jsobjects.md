Using Javascript objects
------------------------

We have to handle the transition period when Brython is going to coexist with Javascript ;-)

An HTML document can use Javascript scripts or libraries, and Python scripts or libraries. Brython can't use Javascript objects directly : for instance attribute lookup is done by the method _\_\_getattr\_\__, which doesn't exist for Javascript objects

To be able to use them in a Python script, they must be explicitely transformed by the built-in function _JSObject_

For instance :

>    <script type="text/javascript">
>    circle = {surface:function(r){return 3.14*r*r}}
>    </script>
>    <script type="text/python">
>    doc['result'].value = JSObject(circle).surface(10)
>    </script>

