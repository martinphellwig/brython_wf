// websocket


function Websocket(){}
Websocket.__class__ = $type
Websocket.__str__ = function(){return "<class 'Websocket'>"}

function $WebSocketClass(host){
	if(!window.WebSocket) {
        alert('WebSocket are not supported!');
    } 
	else {
        var $socket = new WebSocket(host);
        $socket.onopen = function() { 
        	var req = this.$websocket
        	if('on_open' in req){req.on_open()}
        }
        $socket.onclose = function(close) { 
        	var req = this.$websocket
        	if('on_close' in req){req.on_close(JSObject(close))}
        }
        $socket.onerror = function() { 
        	var req = this.$websocket
        	if('on_error' in req){req.on_error()}
        }
        $socket.onmessage = function(message){
        	var req = this.$websocket
        	if('on_message' in req){req.on_message(JSObject(message))}        	
        }
    }	

    $socket.$websocket = this

    this.__class__ = Websocket

    this.__getattr__ = function(attr){return $getattr(this,attr)}
    
    this.__setattr__ = function(attr,value){setattr(this,attr,value)}

    this.__str__ = function(){return "<object 'Websocket'>"}
    
    this.send = function(data){
    	$socket.send(data)
    }
    
    this.close = function(){
    	$socket.close()
    }
    
}

function websocket(host){
    return new $WebSocketClass(host)
}
