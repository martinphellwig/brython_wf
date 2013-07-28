Ajax
----

A função integrada `ajax()` retorna um objeto similar ao
XMLHttlRequest em Javascript, mas sua interface é ligeiramente
diferente. Ela tem os seguintes métodos

- `open(_método, url, async_)` : _método_ é o método HTTP usado para a  
  requisição (normalmente GET ou POST), _url_ é a url a chamar, _async_ é o  
  valor booleano que indica se a chamada é asíncrona ou não  
- `set\_header(_nome, valor_)` : estabelece o _valor_ do _nome_ do cabeçalho  
- `set\_timeout(_duração, função_)` : se a consulta não retornar uma resposta  
  durante a _duração_ em segundos, a consulta será cancelada e a _função_ será  
  chamada. Esta função não pode ter argumentos  
- `send()` : envia (inicia) a requisição  

Para interagir com o servidor, você deve usar os seguintes atributos correspondentes a cada estado do atributo _readyState_ do objeto Ajax :  
<p><table><tr><th>readyState</th><th>attribute</th></tr>
<tr><td>0</td><td>`on_uninitialized`</td></tr>
<tr><td>1</td><td>`on_loading`</td></tr>
<tr><td>2</td><td>`on_loaded`</td></tr>
<tr><td>3</td><td>`on_interactive`</td></tr>
<tr><td>4</td><td>`on_complete`</td></tr>
</table>

O atributo deve ser uma função com um único argumento: o objeto `ajax`. Este objeto tem os seguintes atributos : 

- `status` : um inteiro que representa o estado HTTP da requisição  
- `text` : a resposta do servidor como uma sequência de caracteres (que seria _responseText_ em Javascript)  
- `xml` : a resposta do servidor como um objeto DOM (que seria _responseXML_ em Javascript)


### Exemplo  
Supomos que há um DIV com id _result_ na página HTML

>    def on_complete(req):
>        if req.status==200 or req.status==0:
>            doc["result"].html = req.text
>        else:
>            doc["result"].html = "error "+req.text
>    
>    req = ajax()
>    req.on_complete = on_complete
>    req.set_timeout(timeout,err_msg)
>    req.open('POST',url,True)
>    req.set_header('content-type','application/x-www-form-urlencoded')
>    req.send(data)
