module local_storage
--------------------

Le stockage local défini par HTML5 permet de stocker des données en les indexant par une chaine de caractères

Le module `local_storage` définit un objet `storage` qui est utilisé comme un dictionnaire Python classique

### Exemple

>    from local_storage import storage
>    storage['foo']='bar'
>    log(storage['foo'])
>    del storage['foo']
>    log(storage['foo']) # déclenche KeyError
