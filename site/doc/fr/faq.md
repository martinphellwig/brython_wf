Questions fréquemment posées
----------------------------

__Q__ : _quelle est la performance de Brython par rapport à Javascript, ou par rapport à d'autres solutions qui permettent d'utiliser Python dans le navigateur ?_

__R__ : par rapport à Javascript, le rapport est naturellement très différent d'un programme à l'autre, mais on peut estimer qu'il est de l'ordre de 3 à 5 fois moins rapide. Une console Javascript est fournie dans la distribution ou [sur le site Brython](http://brython.info/tests/js_console.html), vous pouvez l'utiliser pour mesurer le temps d'exécution d'un script Javascript par rapport à son équivalent en Python dans l'éditeur (en décochant la case "debug").

La différence tient à deux facteurs :

- le temps de traduction de Python en Javascript, réalisé à la volée dans le navigateur. Pour donner une idée, le module datetime (2130 lignes de code Python) est parsé et converti en code Javascript en 0,5 seconde sur un PC de puissance moyenne.
- le code Javascript généré par Brython doit être conforme aux spécifications de Python, notamment au caractère dynamique de la recherche d'attributs, ce qui dans certains cas conduit à du code Javascript non optimisé.

Par rapport à d'autres solutions de traduction de Python en Javascript, certaines [comparaisons fantaisistes](http://pyppet.blogspot.fr/2013/11/brython-vs-pythonjs.html) font état d'un rapport de 1 à 7500 en défaveur de Brython : les conditions de mesure ne sont pas indiquées, mais il est évident qu'on ne compare pas des solutions équivalentes ; dans les mêmes conditions (exécution d'un script dans un navigateur web) on voit mal comment aller plus vite que du Javascript natif...

Un autre facteur est la couverture de la syntaxe Python supportée par la solution. Celles qui ne prennent en charge qu'un petit sous-ensemble de Python peuvent produire du code plus rapide ; Brython vise une couverture de 100% de la syntaxe Python, y compris des rapports d'erreurs similaires à ceux de CPython, même si cela conduit à un code Javascript plus lent.

Je n'ai pas trouvé de comparaison objective entre les différentes solutions dont [une liste](http://stromberg.dnsalias.org/~strombrg/pybrowser/python-browser.html) est tenue à jour par Dan Stromberg. Rien n'indique que le code Javascript généré par les solutions écrites en Python sont plus ou moins rapides que celui généré par Brython. Et le cycle de développement avec des solutions écrites en Python (pyjamas, pyjs) est forcément plus long que celui de Brython.

__Q__ : _il y a des erreurs 404 dans la console du navigateur quand j'exécute des scripts Brython, pourquoi ?_

__R__ : c'est lié à la façon dont Brython gère les imports. Quand un script veut importer le module X, Brython recherche un fichier ou un paquetage dans différents répertoires : la bibliothèque standard (répertoire libs pour les modules en javascript, Lib pour les modules en Python), le répertoire Lib/site-packages, le répertoire de la page courante. Pour cela, il effectue des appels Ajax vers les url correspondantes ; si le fichier n'est pas trouvé, l'erreur 404 apparait dans la console, mais elle est capturée par Brython qui poursuit la recherche jusqu'à trouver le module, ou déclencher une `ImportError` si tous les chemins ont été essayés.
