module time
-----------

Implements a part of the methods in the module `time` of Python standard distribution

Three methods are added to allow differed or repetitive execution of functions :

- <code>set\_timeout(*function,ms*)</code> : runs the *function* after *ms* milliseconds. *function* takes no argument

- <code>set\_interval(*fonction,ms*)</code> lauched repeated execution of the *function* every *ms* milliseconds. This function returns an object usable in the following function

- <code>clear_interval(*timer*)</code> : stops the repeated execution of the function defined by <code>set\_interval()</code>

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
            doc['start'].text = 'Hold'
        elif timer == 'hold': # restart
            # restart timer
            counter = time.time()-float(doc['timer'].text)
            timer = time.set_interval(show,10)
            doc['start'].text = 'Hold'
        else: # hold
            time.clear_interval(timer)
            timer = 'hold'
            doc['start'].text = 'Restart'
    
    def stop_timer():
        global timer
        time.clear_interval(timer)
        timer = None
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