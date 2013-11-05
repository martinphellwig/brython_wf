module time
-----------

Implémente une partie des méthodes du module `time` de la distribution standard CPython

Trois méthodes sont ajoutées pour permettre l'exécution différée ou répétitive de fonctions :

- <code>set\_timeout(*fonction,ms*)</code> : exécute la *fonction* après *ms* millisecondes. *fonction* ne prend aucun argument

- <code>set\_interval(*fonction,ms*)</code> lance l'exécution répétée de la *fonction* toutes les *ms* millisecondes. Cette fonction renvoie un objet utilisable dans la fonction suivante

- <code>clear_interval(*timer*)</code> : termine l'exécution répétée définie par <code>set\_interval()</code>

Example
=======

<div id="py_source">
    import time
    
    timer = None
    counter = 0
    
    def show():
        doc['timer'].text = '%.2f' %(time.time()-counter)
    
    def start_timer():
        global timer,counter
        if timer is None:
            counter = time.time()
            timer = time.set_interval(show,10)
            doc['start'].text = 'Pause'
        elif timer == 'hold': # restart
            # restart timer
            counter = time.time()-float(doc['timer'].text)
            timer = time.set_interval(show,10)
            doc['start'].text = 'Départ'
        else: # hold
            time.clear_interval(timer)
            timer = 'hold'
            doc['start'].text = 'Redémarrer'
    
    def stop_timer():
        global timer
        time.clear_interval(timer)
        timer = None
        t = 0
        doc['timer'].text = '%.2f' %0
        doc['start'].text = 'Départ'

</div>

<script type='text/python'>
exec(doc['py_source'].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="start" onclick="start_timer()">Départ</button>
<br><button id="stop" onclick="stop_timer()">Arrêt</button>
</td>
<td>
<div id="timer" style="background-color:black;color:#0F0;padding:15px;font-family:courier;font-weight:bold;font-size:23px;">0.00</div>
</td>
</tr>
</table>