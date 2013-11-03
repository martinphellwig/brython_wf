$module = {
    __getattr__ : function(attr){return this[attr]},
    //ajax: function() { return ajax()},
    alert: function(message){window.alert(message)},
    confirm: function(message){return JSObject(window.confirm(message))},
    document: JSObject(document),
    prompt: function(message, default_value){return JSObject(window.prompt(message, default_value))},
    //websocket: function(host) { return websocket(host)},
    window: JSObject(window)
}
$module.__class__ = $module // defined in $py_utils
$module.__str__ = function(){return "<module 'brython'>"}


