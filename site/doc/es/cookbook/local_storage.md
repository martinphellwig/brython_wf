Problema
--------

Almacenar objetos localmente usando Local Storage en HTML5


Solución
--------

Brython proporciona un módulo `local_storage` que permite almacenar cadenas de valores asociadas a cadenas clave.


    from local_storage import storage
    storage['brython_test'] = doc['zone'].value
    
<input id="zone" value="Local Storage">
<button onclick="show_locstor(0)">Almacenar valor</button>

    alert(storage['brython_test'])

<button onclick="mostrar_locstor(1)">Mostrar el valor almacenado</button>


<script type="text/python3">
def mostrar_locstor(num):
    src = doc.get(selector="pre.marked")[num].text
    exec(src)
</script>

Si un objeto Python puede ser serializado mediante el módulo `json`, podrías almacenar la versión serializada, y más tarde obtener el objeto original :

    from local_storage import storage
    import json
    
    a = {'foo':1,1515:'Marignan'}
    
    storage["brython_test"] = json.dumps(a)
    
    b = json.loads(storage['brython_test'])
    alert(b['foo'])
    alert(b['1515'])

<button onclick="mostrar_locstor(2)">Test it</button>

Hay que tener precaución ya que el módulo `json` convierte las claves del diccionario a cadenas, debido a ello es por lo que hemos usado `b['1515']` en lugar de `b[1515]`
