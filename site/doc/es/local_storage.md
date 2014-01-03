Módulo browser.local_storage
----------------------------

Éste módulo hace uso del almacenamiento local definido en HTML5 : una forma de almacenar pares clave/valor en un fichero adjunto al mnavegador. Las claves y valores son cadenas

El módulo define un objeto, `storage`, que es un diccionario Python típico

### Ejemplo

>    from browser.local_storage import storage
>    storage['foo']='bar'
>    print(storage['foo'])
>    del storage['foo']
>    print(storage['foo']) # raises KeyError
