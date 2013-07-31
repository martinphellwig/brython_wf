## Web Sockets

Web sockets are a way to handle bi directional communication between client and server. They have been specified in HTML5

If so, the communication with the server is established using the built-in function `websocket` :

<code>websocket(_host_)</code>

where _host_ is the location of a server that supports the WebSocket protocol

If your browser doesn't support WebSocket, a `NotImplementedError` will be raised

This call returns an instance of the `WebSocket` class. To describe the communication process, callback functions must be defined as attributes of the instance :

- `on_open` : set to a function with no argument, called once the connection with the server is established
- `on_error` : set to a function with no argument, called if an error occurs during the communication
- `on_message` : set to a function with one argument, an instance of `DOMEvent`. This instance has an attribute `data` that holds the message sent by the server
- `on_close` : set to a function with no argument, called when the connection is closed

`WebSocket` instances support the following methods :

- <code>send(_data_)</code> : sends the string _data_ to the server
- `close()` : closes the connection


Example :
<table>
<tr>
<td id="py_source">
    def on_open():
        # Web Socket is connected, send data using send()
        data = doc["data"].value
        if data:
            ws.send(data)
            alert("Message is sent")
    
    def on_message(evt):
        # message received from server
        alert("Message received : %s" %evt.data)
    
    def on_close(evt):
        # websocket is closed
        alert("Connection is closed")
    
    ws = None
    def _test():
        if not __BRYTHON__.has_websocket:
            alert("WebSocket is not supported by your browser")
            return
        global ws
        # open a web socket
        ws = websocket("wss://echo.websocket.org")
        # attach functions to web sockets events
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

<input id="data"><button onclick="_test()">Send</button>
<p><button onclick="close_connection()">Close connection</button>
</td>
</tr>
</table>
