module time
-----------

Implémente une partie des méthodes du module `time` de la distribution standard CPython

Trois méthodes sont ajoutées pour permettre l'exécution différée ou répétitive de fonctions :

- <code>set\_timeout(*fonction,ms*)</code> : exécute la *function* après *ms* millisecondes. *fonction* ne prend aucun argument

- <code>set\_interval(*fonction,ms*)</code> lance l'exécution répétée de la *fonction* toutes les *ms* millisecondes. Cette fonction renvoie un objet utilisable dans la fonction suivante

- <code>clear_interval(*timer*)</code> : termine l'exécution répétée définie par <code>set\_interval()</code>
