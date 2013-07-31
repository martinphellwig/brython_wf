## Web Sockets

Web sockets são uma forma de gerir a comunicação bi direcional entre cliente e servidor. Eles têm sido especificados em HTML5

Se sim, a comunicação com o servidor é estabelecida utilizando a função integrada `websocket` :

<code>websocket(_host_)</code>

onde _host_ é a localização do servidor que suporta o protocolo WebSocket

Se seu navegador não suporta WebSocket, lança `NotImplementedError`

Esta chamada retorna uma instância da classe `WebSocket`. Para descrever a comunicação, funções de resposta (callback) precisam ser definidas como atributos da instância :

- `on_open` : definida como uma função sem argumentos, chamada quando a conexão com o servidor é estabelecida
- `on_error` : definida como uma função sem argumentos, chamada se um erro ocorrer durante a comunicação
- `on_message` : definida como uma função com um argumento, uma instância de `DOMEvent`. Esta instância tem um atributo `data` que contém a mensagem enviada pelo servidor
- `on_close` : definida como uma função sem argumentos, chamada quando a conexão é fechada

Instâncias de `WebSocket` suportam os seguintes métodos :

- <code>send(_data_)</code> : envia a cadeia de caracteres _data_ para o servidor
- `close()` : fecha a conexão


Exemplo :
<table>
<tr>
<td id="py_source">
    def on_open():
        # Web Socket está conectado, enviar dados usando send()
        data = doc["data"].value
        if data:
            ws.send(data)
            alert("Messagem foi enviada")
    
    def on_message(evt):
        # mensagem recebida do servidor
        alert("Messagem recebida : %s" %evt.data)
    
    def on_close(evt):
        # websocket foi fechado
        alert("Conexão foi fechada")
    
    ws = None
    def _test():
        if not __BRYTHON__.has_websocket:
            alert("WebSocket não é suportado por seu navegador")
            return
        global ws
        # abrir um socket
        ws = websocket("wss://echo.websocket.org")
        # vincular funções a eventos de web socket
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
<p><button onclick="close_connection()">Fechar conexão</button>
</td>
</tr>
</table>
