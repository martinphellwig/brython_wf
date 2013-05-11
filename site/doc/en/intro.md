Brython's goal is to replace Javascript with Python, as the scripting language for web browsers.

A simple example :

<table>
<tr>
<td>

    <html>
    <head>
    <script src="/brython.js"></script>
    </head>
    <body onload="brython()">
    <script type="text/python">
    def echo():
        alert(doc["zone"].value)
    </script>
    <input id="zone"><button onclick="echo()">click !</button>
    </body>
    </html>

</td>
<td>

Try it!

<script type="text/python">
def echo():
    alert(doc["zone"].value)
</script>

<input id="zone"><button onclick="echo()">click !</button>

</td>
</tr>
</table>

In order for the Python script to be processed, it is necessary to include _brython.js_ and to run the `brython()` function upon page load (using the _onload_ attribute of the `<BODY>` tag). While in the development phase, it is possible to pass an argument to the `brython()` function: 1 to have the error messages displayed to the web browser console, 2 to also get the Javascript code displayed along with the error

If the Python program is large, another option is to write it in a separate file, and to load it using the _src_ attribute of the _script_ tag :

    <html>
    <head>
    <script src="/brython.js"></script>
    </head>
    <body onload="brython()">
    <script type="text/python" src="test.py"></script>
    <input id="zone"><button onclick="echo()">clic !</button>
    </body>
    </html>


Please note that in this case the Python script will be loaded through an Ajax call : it must be in the same domain as the HTML page

In the above two examples of code, when we click on the button, the onclick event calls and run the `echo()` function, which was defined in the Python script. This function gets the value of the INPUT element, through its id (_zone_). This is accomplished by the syntax `doc["zone"]` : `doc` is a keyword in Brython, which behaves just like a dictionary whose keys are the ids of the elements of the DOM. Hence, in our example, `doc["zone"]` is an object that maps to the INPUT element ; the _value_ property holds, interestingly enough, the value of the object

In Brython, the output can be accomplished in various ways, including with the `alert()` built-in function which shows a popup window with the text passed as an argument