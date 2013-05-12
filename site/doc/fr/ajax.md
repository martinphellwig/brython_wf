Ajax
----

La fonction intégrée `ajax()` renvoie un objet qui permet d'exécuter des requêtes Ajax. Il possède les méthodes suivantes

- <code>open(_methode,url,async_)</code> : _methode_ est la méthode HTTP utilisée pour la requête (habituellement GET ou POST), _url_ est l'url appelée, _async_ est un booléen qui indique si l'appel est asynchrone (le script qui a effectué la requpete continue de s'exécuter sans attendre la réponse à cette requête) ou non (l'exécution du script s'arrête en attendant la réponse)
- <code>set\_header(_nom,valeur_)</code> : affecte la valeur _valeur_ à l'entête _nom_
- <code>set\_timeout(_duree,fonction_)</code> : si la requête n'a pas renvoyé de réponse dans les _duree_ secondes, annule la requête et exécute la _fonction_. Cette fonction ne prend pas d'argument
- `send()` : lance la requête

Pour interagir avec le serveur, il faut définir les attributs suivants, correspondant à chaque état de l'attribut _readyState_ de l'objet Ajax :
<p><table cellspacing=0 cellpadding=0 border=1>
<tr><th>
readyState
</th><th>
attribut
</th></tr>
<tr><td>0</td><td>`on_uninitialized`</td></tr>
<tr><td>1</td><td>`on_loading`</td></tr>
<tr><td>2</td><td>`on_loaded`</td></tr>
<tr><td>3</td><td>`on_interactive`</td></tr>
<tr><td>4</td><td>`on_complete`</td></tr>
</table>

L'attribut doit prendre pour valeur une fonction à un seul argument, qui est l'objet `ajax`. Cet objet possède les attributs suivants :

- `status` : un entier représentant le statut HTTP de la requête
- `text` : la réponse du serveur sous forme de chaine de caractères (correspond à _responseText_ en Javascript)
- `xml` : la réponse du serveur sous forme d'objet DOM (correspond à _responseXML_ en Javascript)

### Exemple

On suppose qu'il y a un DIV avec l'id "result" dans la page HTML

>    def on_complete(req):
>        if req.status==200 or req.status==0:
>            doc["result"].html = req.text
>        else:
>            doc["result"].html = "error "+req.text
>    req = ajax()
>    req.on_complete = on_complete
>    req.set_timeout(timeout,err_msg)
>    req.open('POST',url,True)
>    req.set_header('content-type','application/x-www-form-urlencoded')
>    req.send(data)
