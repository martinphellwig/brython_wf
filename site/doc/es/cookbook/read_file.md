Problema
--------

Leer el contenido de un fichero


Solución
--------

Usaremos la función integrada `ajax()` para cargar el contenido del fichero

<table width="100%">
<tr>
<td style="width:40%;padding-right:10px;">

    import time
    import html

    def on_complete(req):
        if req.status==200 or req.status==0:
            doc["zone"].value = req.text
        else:
            doc["zone"].value = "error "+req.text
    
    def go(url):
        req = ajax()
        req.on_complete = on_complete
        req.open('GET',url,True)
        req.send()

    go('cookbook/file.txt?foo=%s' %time.time())

<button onclick="get_file()">Test it</button>

</td>
<td style="background-color:#FF7400;text-align:center;">
<textarea id="zone" rows=10 cols=40>Contenido inicial</textarea>
</td>
</tr>
</table>

<script type="text/python3">
def get_file():
    src = doc.get(selector="pre.marked")[0].text
    exec(src)
</script>


Fíjate en la cadena de la consulta (query) con un valor aleatorio al final del nombre del fichero : es necesario para refrescar el resultado en el caso de que el fichero fuente haya sido modificado entre dos llamadas

El siguiente ejemplo añade un timeout para mostrar un mensaje en el caso de que, después de 4 segundos, no haya sido posible encontrar el fichero :

    import time

    def on_complete(req):
        if req.status==200 or req.status==0:
            doc["zone"].value = req.text
        else:
            doc["zone"].value = "error "+req.text
    
    def err_msg():
        doc["zone"].text = "no se ha obtenido respuesta del servidor después de %s segundos" %timeout
    
    timeout = 4
    
    def go(url):
        req = ajax()
        req.on_complete = on_complete
        req.set_timeout(timeout,err_msg)
        req.open('GET',url,True)
        req.send()

    go('cookbook/file.txt?foo=%s' %time.time())



