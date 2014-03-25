Frequently asked questions
--------------------------

__Q__ : _what is the performance of Brython compared to Javascript, or to other solutions that allow using Python in the browser ?_

__R__ : compared to Javascript, the ratio is naturally very different from one program to another, but it is somewhere between 3 to 5 times slower. A Javascript console is provided in the distribution or on [the Brython site](http://brython.info/tests/js_console.html), it can be used to measure the execution time of a Javascript program compared to its equivalent in Python in the editor (unchecking the "debug" box)

The diffence is due to two factors :
- the time to translate Python into Javascript, on the fly in the browser. To give an idea, the module datetime (2130 lines of Python code) is parsed and converted to Javascript in 0,5 second on an ordinary PC
- le code Javascript généré par Brython doit être conforme aux spécifications de Python, notamment au caractère dynamique de la recherche d'attributs, ce qui dans conduit à du code Javascript non optimisé

Par rapport à d'autres solutions de traduction de Python en Javascript, certaines [comparaisons fantaisistes](http://pyppet.blogspot.fr/2013/11/brython-vs-pythonjs.html) font état d'un rapport de 1 à 7500 en défaveur de Brython : les conditions de mesure ne sont pas indiquées, mais il est évident qu'on ne compare pas des solutions équivalentes ; dans les mêmes conditions (exécution d'un script dans un navigateur web) on voit mal comment aller plus vite que du Javascript natif...

Je n'ai pas trouvé de comparaison objective entre les différentes solutions dont [une liste](http://stromberg.dnsalias.org/~strombrg/pybrowser/python-browser.html) est tenue à jour par Dan Stromberg. Rien n'indique que le code Javascript généré par les solutions écrites en Python sont plus ou moins rapides que celui généré par Brython. Et le cycle de développement avec des solutions écrites en Python (pyjamas, pyjs) est forcément plus long que celui de Brython

__Q__ : _il y a des erreurs 404 dans la console du navigateur quand j'exécute des scripts Brython, pourquoi ?_

__R__ : c'est lié à la façon dont Brython gère les imports. Quand un script veut importer le module X, Brython recherche un fichier ou un paquetage dans différents répertoires : la bibliothèque standard (répertoire libs pour les modules en javascript, Lib pour les modules en Python), le répertoire Lib/site-packages, le répertoire de la page courante. Pour cela, il effectue des appels Ajax vers les url correspondantes ; si le fichier n'est pas trouvé, l'erreur 404 apparait dans la console, mais elle est capturée par Brython qui poursuit la recherche jusqu'à trouver le module, ou déclencher une `ImportError` si tous les chemins ont été essayés
