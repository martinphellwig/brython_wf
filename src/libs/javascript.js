$module = {
    JSObject:__BRYTHON__.JSObject,
    JSConstructor:__BRYTHON__.JSConstructor,
    console: __BRYTHON__.JSObject(window.console),
    expose:function(func){window[func.__name__]=func;return func}
}
