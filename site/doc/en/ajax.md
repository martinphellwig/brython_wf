Ajax
----

The `ajax()` built-in function returns an object similar to XMLHttpRequest in 
Javascript, but its interface is slightly different. It has the following methods

- `open(_method, url, async_)` : _method_ is the HTTP method used for the 
  request (usually GET or POST), _url_ is the url to call, _async_ is a boolean 
  that indicates whether the call is asynchronous or not
- `set\_header(_name, value_)` : sets the _value_ of the header _name_
- `set\_timeout(_duration, function_)` : if the query did not return response 
  within _duration_ in seconds, it will cancel the query and execute the 
  _function_. This function cannot have arguments
- `send()` : send (starts) the request

To interact with the server, you must set the following attributes corresponding to each state of the _readyState_ attribute of the Ajax object :
<p><table><tr><th>readyState</th><th>attribute</th></tr>
<tr><td>0</td><td>`on_uninitialized`</td></tr>
<tr><td>1</td><td>`on_loading`</td></tr>
<tr><td>2</td><td>`on_loaded`</td></tr>
<tr><td>3</td><td>`on_interactive`</td></tr>
<tr><td>4</td><td>`on_complete`</td></tr>
</table>

The attribute has to be a function which will take a single argument: the `ajax` object. This object has the following attributes :

- `status` : an integer representing the HTTP status of the request
- `text` : the server response as a string of characters (this would be _responseText_ in Javascript)
- `xml` : the server response as a DOM object (this would be _responseXML_ in Javascript)


### Example
We suppose there is a DIV with id _result_ in the HTML page

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
