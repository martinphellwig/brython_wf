## Web Sockets

Les Web sockets sont un moyen de gérer une communication bidirectionnelle entre le client et le serveur

Elle ont été spécifiée dans le cadre de HTML5. Pour vérifier si votre navigateur les prend en charge, utilisez le booléen intégré `__BRYTHON__.has_websocket`

Si c'est le cas, la communication avec le serveur est établie en se servant de la fonction intégrée `websocket` :

<code>websocket(_hote_)</code>

où _hote_ est l'adresse d'un serveur qui supporte le protocole WebSocket

Cet appel renvoie une instance de la classe `WebSocket`. Pour décrire le processus de communication, il faut définir des fonctions de rappel en tant qu'attributs de l'instance :

- `on_open` : fonction sans argument, appelée une fois que la connection avec le serveur est établie
- `on_error` : fonction sans argument, appelée si une erreur se produit pendant la communication
- `on_message` : fonction qui prend un argument, une instance de `DOMEvent`. Cette instance possède un atttibut `data` qui contient le message envoyé par le serveur
- `on_close` : fonction sans argument, appelée quand la connection est close

Les instances de `WebSocket` possèdent les deux méthodes suivantes :

- <code>send(_data_)</code> : envoie la chaine _data_ au serveur
- `close()` : ferme la connection

Exemple :
<table>
<tr>
<td id="py_source">
    def on_open():
        # Web Socket est connecté, envoie les données par send()
        data = doc["data"].value
        if data:
            ws.send(data)
            alert("Le message est envoyé")
    
    def on_message(evt):
        # message reçu du serveur
        alert("Message reçu : %s" %evt.data)
    
    def on_close(evt):
        # la websocket est fermée
        alert("La connection est fermée")
    
    ws = None
    def _test():
        if not __BRYTHON__.has_websocket:
            alert("WebSocket n'est pas pris en charge par votre navigateur")
            return
        global ws
        # open a web socket
        ws = websocket("wss://echo.websocket.org")
        # attache des fonctions aux événements web sockets
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

<input id="data"><button onclick="_test()">Envoyer</button>
<p><button onclick="close_connection()">Fermer la connection</button>
</td>
</tr>
</table>
