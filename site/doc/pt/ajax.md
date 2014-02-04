módulo **browser.ajax**
-----------------------

O módulo `ajax` permite executar requisições Ajax. Expõe a função `ajax()`

`ajax()`
> retorna um objeto `ajax`

Ele tem os seguintes métodos e atributos:

`bind(`_evt,function_`)`
> vincula a função _function_ ao evento _evt_. Os eventos correspondem aos diferentes estados da requisição :

- "uninitialized" : não inicializado
- "loading" : conexão estabelecida
- "loaded": pedido recebido
- "interactive": resposta em andamento
- "complete" : acabado

> A função _`function`_ toma um único argumento, o objeto `ajax`.

Isso é equivalente a: _req.on_evt = func_

`open(`_método, url, async_`)`
 > _método_ é o método HTTP usado para a requisição (normalmente GET ou POST), _url_ é a url a chamar, _async_ é o valor booleano que indica se a chamada é asíncrona ou não

`readyState` : um inteiro representando o estado da requisição (como na tabela abaixo)

<blockquote>
<table cellspacing=0 cellpadding=4 border=1>
<tr><th>
readyState
</th><th>
request state
</th></tr>
<tr><td align="center">0</td><td>"uninitialized"</td></tr>
<tr><td align="center">1</td><td align="center">"loading"</td></tr>
<tr><td align="center">2</td><td align="center">"loaded"</td></tr>
<tr><td align="center">3</td><td align="center">"interactive"</td></tr>
<tr><td align="center">4</td><td align="center">"complete"</td></tr>
</table>
</blockquote>

`set_header(`_nome, valor_`)`
> estabelece o _valor_ do _nome_ do cabeçalho

`set_timeout(`_duração, função_`)`
> se a consulta não retornar uma resposta durante a _duração_ em segundos, a consulta será cancelada e a _função_ será chamada. Esta função não pode ter argumentos

`send()`
> envia (inicia) a requisição

`status`
> um inteiro representando o status HTTP da requisição

`text`
> a resposta do servidor como uma cadeia de caracteres

`xml`
> a resposta do servidor como um objeto DOM



### Exemplo

Supomos que há um DIV com id _result_ na página HTML

>    from browser import doc,ajax
>
>    def on_complete(req):
>        if req.status==200 or req.status==0:
>            doc["result"].html = req.text
>        else:
>            doc["result"].html = "error "+req.text
>    
>    req = ajax.ajax()
>    req.bind('complete',on_complete)
>    req.set_timeout(timeout,err_msg)
>    req.open('POST',url,True)
>    req.set_header('content-type','application/x-www-form-urlencoded')
>    req.send(data)
