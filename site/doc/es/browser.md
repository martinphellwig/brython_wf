El paquete **browser** agrupa los nombres y módulos que son específicos de Brython

**browser**.`doc`
> es un objeto que representa el documento HTML mostrado en la ventana del navegador. La interfaz de este objeto está descrita en la sección "Interfaz del navegador"

**browser**.`win`
> es un objeto que representa la ventana del navegador

**browser**.`alert(`_mensaje_`)`
> una función que muestra el _mensaje_ en una ventana emergente (pop-up window). Devuelve `None`

**browser**.`confirm(`_mensaje_`)`
> una función que muestra el _message_ en una ventana mostrando, además, dos botones (ok/cancel). Devuelve `True` si se pulsa 'ok', `False` si se pulsa 'cancel'

**browser**.`prompt(`_mensaje[,default]_`)`
> una función que muestra el _mensaje_ en una ventana y un campo de entrada. Devuelve el valor que se ha introducido en el campo de entrada ; si no se ha introducido ningún valor devuelve el valor _default_ en caso de que haya sido definida y devuelve una cadena vacia en caso de que no haya sido definida
