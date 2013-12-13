$module = {
    modules : {'__get__':function(){return dict(JSObject(__BRYTHON__.imported))},
        '__set__':0 // data descriptor, to force use of __get__
    },
    path_hooks : {'__get__':function(){return list(JSObject(__BRYTHON__.path_hooks))},
        '__set__':0 // data descriptor, to force use of __get__
    }
}
