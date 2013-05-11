Local storage
-------------

The local storage defined by HTML5 can be accessed with the module 
`local_storage`. The object `storage` defined in this module is used as a 
typical Python dictionary

### Example

>    from local_storage import storage
>    storage['foo']='bar'
>    log(storage['foo'])
>    del storage['foo']
>    log(storage['foo']) # raises KeyError
