// websocket
$module = (function($B){

    var __builtins__ = $B.builtins
    
    $WebSocketDict = {
        __class__ : $type,
        __name__:'WebSocket'
    }
    
    $WebSocketDict.bind = function(self,event,callback){
        self.$ws['on'+event] = callback
    }
    
    $WebSocketDict.send = function(self,data){
        self.$ws.send(data)
    }
        
    $WebSocketDict.close = function(self){
        self.$ws.close()
    }
    
    $WebSocketDict.__mro__ = [$WebSocketDict,__builtins__.object.$dict]
    
    function websocket(host){
        var $socket = new WebSocket(host);
        var res = {
            __class__:$WebSocketDict,
            $ws : $socket
        }
        res.$websocket = $socket
        return res
    }
    websocket.__class__ = $factory
    websocket.$dict = $WebSocketDict
    
    return {websocket:websocket}

})(__BRYTHON__)