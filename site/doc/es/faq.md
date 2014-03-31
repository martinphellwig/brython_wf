Preguntas frecuentes
--------------------

__P__ : _¿Cómo es el rendimiento de Brython cuando se compara con Javascript u otras soluciones que permiten usar Python en el navegador?_

__R__ : Comparado a Javascript, el ratio puede ser muy diferente de un programa a otro pero en general se podría decir que es entre 3 y 5 veces más lento. Dispones de una consola Javascript en la propia distribución de Brython o en la [página oficial del proyecto](http://brython.info/tests/js_console.html), se puede usar para medir el tiempo de ejecución de un programa Javascript comparado a su equivalente en Python (deseleccionando el checkbox "debug")

La diferencia se debe a dos factores :
- el tiempo de traducir al vuelo en el navegador de Python  a Javascript. Para hacerse una idea, el módulo datetime (2130 líneas de código Python) se analiza sintácticamente y se traduce a Javascript en 0,5 segundos en un PC ordinario
- El código JavaScript generado por Brython debe cumplir con las especificaciones de Python, incluyendo la naturaleza dinámica de la búsqueda de atributos, lo que provoca que el código Javascript creado no esté optimizado

Comparado con otras soluciones que traducen Python a Javascript, algunas [comparaciones imaginativas](http://pyppet.blogspot.fr/2013/11/brython-vs-pythonjs.html) mencionan una proporción de 1 a 7500 frente a Brython : no se proporciona ninguna información pero es obvio que la comparación no está hecha en condiciones comparables ; en las mismas condiciones (corriendo un script en un navegador web) es complicado imaginar como se puede ser más rápido que Javascript nativo...

Otro factor es la cobertura de la sintaxis Python soportada por otras soluciones. Aquellas que solo soportan un pequeño subconjunto de Python pueden producir código que ejecuta más rápido ; Brython aspira a cubrir el 100% de la sintaxis Python, incluyendo un informe de errores similar al de CPython, incluso si esto provoca tener un código Javascript más lento

No se han encontrado comparaciones serias entre las soluciones que se pueden encontrar en [esta lista](http://stromberg.dnsalias.org/~strombrg/pybrowser/python-browser.html) mantenida por Dan Stromberg. Nada prueba que el código Javascript generado por soluciones escritas en Python sean más rápidas que las generadas mediante Brython. Y el ciclo de desarrollo con soluciones escritas en Python como Pyjamas / pyjs es, obviamente, más largo que con Brython

__P__ : _Veo muchos errores 404 en la consola del navegador cuando se ejecutan scripts Brython, ¿A qué es debido?_

__R__ : Esto es debido a la forma en que Brython implementa el mecanismo "import" para importar librerías. Cuando un script tiene que importar el módulo X, Brython busca un fichero o un paquete en diferentes carpetas : la librería estándar (carpeta libs para los módulos Javascript, Lib para los módulos Python), la carpeta Lib/site-packages, la carpeta de la página actual. Para ello, las llamadas Ajax se envían a las distintas urls ; si el fichero no se encuentra en esa url, el mensaje de error 404 se muestra en la consola del navegador, pero Brython entiende y maneja el error y sigue buscando el módulo o lanza un `ImportError` si después de buscar en las diferentes carpetas no ha sido posible encontrar el módulo 
