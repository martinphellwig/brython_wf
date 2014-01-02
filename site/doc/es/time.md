módulo **browser.timer**
------------------------

Implementa métodos que permiten la ejecución de funciones de forma repetida o diferida.

<code>set\_timeout(*funcion,ms*)</code>

> ejecuta la *funcion* después de *ms* milisegundos. *function* no toma ningún argumento

<code>clear\_timeout(*id*)</code>

> cancela la ejecución de la función definida en *set_timeout()* y como parámetro se usa el valor devuelto por *set_timeout()*

<code>set\_interval(*funcion,ms*)</code>

> ejecuta la *funcion* de forma repetida cada *ms* milisegundos. Esta función devuelve un objeto usable en la siguiente función

<code>clear_interval(*id*)</code>

> detiene la ejecución repetitiva de la función definida por <code>set\_interval()</code> y como parámetro se usa el valor devuelto por *set_interval()*

<code>request\_animation\_frame(*funcion*)</code>

> ejecuta la *funcion* de forma repetitiva dejando que el navegador se encargue de actualizar la ejecución. *function* no toma ningún argumento

<code>cancel\_animation\_frame(*id*)</code>

> cancela la ejecución de la función definida en *request_animation_frame()* y como parámetro se usa el valor devuelto por *request_animation_frame()*

<div id="py_source">
    import time
    from browser import timer
    
    _timer = None
    counter = 0
    
    def show():
        doc['timer'].text = '%.2f' %(time.time()-counter)
    
    def start_timer():
        global _timer,counter
        if _timer is None:
            counter = time.time()
            _timer = timer.set_interval(show,10)
            doc['start'].text = 'Hold'
        elif _timer == 'hold': # restart
            # restart timer
            counter = time.time()-float(doc['timer'].text)
            _timer = timer.set_interval(show,10)
            doc['start'].text = 'Hold'
        else: # hold
            timer.clear_interval(_timer)
            _timer = 'hold'
            doc['start'].text = 'Restart'
    
    def stop_timer():
        global _timer
        timer.clear_interval(_timer)
        _timer = None
        t = 0
        doc['timer'].text = '%.2f' %0
        doc['start'].text = 'Start'

</div>

<script type='text/python'>
exec(doc['py_source'].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="start" onclick="start_timer()">Start</button>
<br><button id="stop" onclick="stop_timer()">Stop</button>
</td>
<td>
<div id="timer" style="background-color:black;color:#0F0;padding:15px;font-family:courier;font-weight:bold;font-size:23px;">0.00</div>
</td>
</tr>
</table>