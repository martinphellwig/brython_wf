$module = {
    JSObject:__BRYTHON__.JSObject,
    JSConstructor:__BRYTHON__.JSConstructor,
    console: __BRYTHON__.JSObject(window.console),
    expose:function(func){
        console.log('expose '+(typeof func)+' from module '+func.__module__+' current mod '+__module__)
        if(typeof func!=='function'){
            throw TypeError("only functions can be exposed")
        }
        if(func.__module__!=='__main__'){
            throw TypeError("only functions in the main module can be exposed")
        }
        window[func.__name__]=func
        return func
    }
}
