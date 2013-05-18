Ajax
----

La funci&oacute;n integrada `ajax()` devuelve un objeto similar a XMLHttpRequest en Javascript, pero su interfaz es ligeramente diferente. Posee los siguientes m&eacute;todos

- <code>open(_method, url, async_)</code> : _method_ es el m&eacute;todo HTTP usado para la petici&oacute;n (normalmente GET o POST), _url_ es la url a llamar, _async_ es el booleano que indica si la llamada es as&iacute;ncrona o no
- <code>set\_header(_name, value_)</code> : establece el _valor_ del _nombre_ del cabecero
- <code>set\_timeout(_duration, function_)</code> : si la petici&oacute;n no devuelve una respuesta durante la _duraci&oacute;n_ en segundos, cancelar&aacute; la petici&oacute;n y ejecutar&aacute; la _funci&oacute;n_. Esta funci&oacute;n no puede tener argumentos
- `send()` : env&iacute;a (inicia) la petici&oacute;n

Para interactuar con el servidor debes poner los siguientes atributos, correspondientes a cada estado del atributo _readyState_ del objeto Ajax :

<table><tr><th>readyState</th><th>atributo</th></tr>
<tr><td>0</td><td>`on_uninitialized`</td></tr>
<tr><td>1</td><td>`on_loading`</td></tr>
<tr><td>2</td><td>`on_loaded`</td></tr>
<tr><td>3</td><td>`on_interactive`</td></tr>
<tr><td>4</td><td>`on_complete`</td></tr>
</table>

El atributo debe ser una funci&oacute;n que tomar&aacute; un &uacute;nico argumento: el objeto `ajax`. Este objeto posee los siguientes atributos :

- `status` : un entero que representa el estado HTTP de la petici&oacute;n
- `text` : la respuesta del servidor como una cadena de caracteres (corresponder&iacute;a a _responseText_ en Javascript)
- `xml` : la respuesta del servidor como un objeto DOM (corresponder&iacute;a a _responseXML_ en Javascript)

### Ejemplo

Supondremos que existe un DIV con id _result_ en la p&aacute;gina HTML

    def on_complete(req):
        if req.status==200 or req.status==0:
            doc["result"].html = req.text
        else:
            doc["result"].html = "error "+req.text
    
    req = ajax()
    req.on_complete = on_complete
    req.set_timeout(timeout,err_msg)
    req.open('POST',url,True)
    req.set_header('content-type','application/x-www-form-urlencoded')
    req.send(data)
    