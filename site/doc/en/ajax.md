module ajax
-----------

The `ajax` module exposes a function `ajax()` that returns an object able to run Ajax requests. It has the following methods :

- <code>bind(_evt,function_)</code> : attaches the _function_ to the event _evt_. The events match the different request states :
<blockquote>

<table cellspacing=0 cellpadding=0 border=1>
<tr><th>
request state
</th><th>
event
</th></tr>
<tr><td align="center">0</td><td>`uninitialized`</td></tr>
<tr><td align="center">1</td><td align="center">`loading`</td></tr>
<tr><td align="center">2</td><td align="center">`loaded`</td></tr>
<tr><td align="center">3</td><td align="center">`interactive`</td></tr>
<tr><td align="center">4</td><td align="center">`complete`</td></tr>
</table>

The _function_ takes a single argument, the `ajax` object. This object has the following attributes :

- `readyState` : an integer representing the request state (cf table above)
- `status` : an integer representing the HTTP status of the request
- `text` : the server response as a string of characters
- `xml` : the server response as a DOM object

</blockquote>

- <code>open(_method, url, async_)</code> : _method_ is the HTTP method used for the request (usually GET or POST), _url_ is the url to call, _async_ is a boolean that indicates whether the call is asynchronous or not
- <code>set\_header(_name, value_)</code> : sets the _value_ of the header _name_
- <code>set\_timeout(_duration, function_)</code> : if the query did not return response 
  within _duration_ in seconds, it will cancel the query and execute the 
  _function_. This function cannot have arguments
- `send()` : send (starts) the request


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
