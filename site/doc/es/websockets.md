## Web Sockets

Los Web sockets son una manera de manejar comunicación bidireccional entre el cliente y el servidor. Han sido especificados en HTML5

Si están soportados, la comunicación con el servidor se establece usando la función integrada en Brython llamada `websocket` :

<code>websocket(_host_)</code>

donde _host_ es la localización de un servidor que soporta el protocolo WebSocket

Si tu nevagador non soporta WebSocket, se obtendr&aacute; un `NotImplementedError`

Esta llamada devuelve una instancia de la clase `WebSocket`. Para describir el proceso de comunicación, se deben definir funciones de respuesta (callbacks) como atributos de la instancia :

- `on_open` : función sin argumento, establece la conexión con el servidor una vez que se la llama
- `on_error` : función sin argumento, será llamada si ocurre un error durante la comunicación
- `on_message` : función con un argumento, una instancia del `DOMEvent`. Esta instancia posee el atributo `data` que recibe el mensaje enviado por el servidor
- `on_close` : función sin argumento, será llamada cuando se cierra la conexión

Instancias a `WebSocket` soportan los siguientes métodos :

- <code>send(_data_)</code> : envía el string _data_ al servidor
- `close()` : cierra la conexión


Ejemplo :
<table>
<tr>
<td id="py_source">
    def on_open():
        # Web Socket esta conectado, enviar datos usando send()
        data = doc["data"].value
        if data:
            ws.send(data)
            alert("El mensaje ha sido enviado")
    
    def on_message(evt):
        # mensaje recibido desde el servidor
        alert("Mensaje recibido : %s" %evt.data)
    
    def on_close(evt):
        # websocket se cierra
        alert("Se ha cerrado la conexión")
    
    ws = None
    def _test():
        if not __BRYTHON__.has_websocket:
            alert("WebSocket no está soportado en tu navegador")
            return
        global ws
        # abre un web socket
        ws = websocket("wss://echo.websocket.org")
        # añade funciones a eventos de web sockets
        ws.on_open = on_open
        ws.on_message = on_message
        ws.on_close= on_close
    
    def close_connection():
        ws.close()
    
</td>
<td valign="top">
<script type='text/python'>
exec(doc['py_source'].text)
</script>

<input id="data"><button onclick="_test()">Enviar</button>
<p><button onclick="close_connection()">Cerrar conexión</button>
</td>
</tr>
</table>
