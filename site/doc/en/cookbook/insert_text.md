Problem
-------
Insert text in a web page


Solution
--------

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    <script type="text/python">
    doc <= "This text is inserted by Brython"
    </script>
    This text is in the HTML source
    <p>
    </body>
    </html>

[Test it](cookbook/test_insert_text.html)
