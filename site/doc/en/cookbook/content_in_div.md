Problem
-------

Make the browser display "Hello world !" in a DIV element


Solution
--------

<table width="100%">
<tr>
<td style="width:50%;">

    <html>
    <head>
    <script src="brython.js"></script>
    </head>
    <body onload="brython()">
    
    <script type="text/python">
    doc['zone'] <= "Additional content"
    </script>
    
    </body>
    </html>

<button onclick="fill_zone()">Test it</button>
</td>
<td id="zone" style="background-color:#FF7400;text-align:center;">Initial content<p>
</td>
</tr>
</table>

<script type="text/python3">
def fill_zone():
    doc["zone"] <= "Additional content"
</script>

`doc["zone"]` is the element in the web page with the id "zone" (here, the colored table cell)

