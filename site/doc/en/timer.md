module **browser.timer**
------------------------

Implements methods to allow differed or repetitive execution of functions :

`set_timeout(`_function,ms_`)`
> runs the *function* after *ms* milliseconds. *function* takes no argument. Returns an object usable in the following function

> It is a wrapper of the `setTimeout` function in javascript. Official docs can be found [here](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-settimeout).

> In this simple example, the color of the text in the black box will change after 3 seconds.

<div style="padding-left:50px;">
<div id="st-example" style="background-color:#dddddd;">
    from browser import doc, timer
    
    def change_color():
        doc['st-text'].style.color = "blue"
    
    def press_button(ev):
        timer.set_timeout(change_color, 3000)

    doc['st-button'].bind('click', press_button)
</div>

<script type="text/python">
exec(doc["st-example"].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="st-button">Press</button>
</td>
<td>
<div id="st-text" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">This color will change after 3s</div>
</td>
</tr>
</table>
</div>

`clear_timeout(`_timer_`)`
> cancels the execution of the function defined by `set_timeout()`. It receives an argument, the `id` value returned by the `set_timeout()` call. 

> It is a wrapper of the `cancelTimeout` function in javascript. Official docs can be found [here](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-cleartimeout).

> Let's see the previous example. Now you have the possibility to stop the execution of the action before the 3 seconds that delays in the execution.

<div style="padding-left:50px;">
<div id="ct-example" style="background-color:#dddddd;">
    from browser import doc, timer
    
    idtimer = 1
    
    def change_color():
        doc['ct-text'].style.color = "blue"
    
    def press_button(ev):
        global idtimer
        idtimer = timer.set_timeout(change_color, 3000)
        
    def stop_button(ev):
        global idtimer
        timer.clear_timeout(idtimer)

    doc['ct-start'].bind('click', press_button)
    doc['ct-stop'].bind('click', stop_button)
    
</div>

<script type="text/python">
exec(doc["ct-example"].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="ct-start">Press</button>
<br>
<button id="ct-stop">Stop</button>
</td>
<td>
<div id="ct-text" style="background-color:black;color:#ffffff;padding:10px;font-family:courier;font-weight:bold;font-size:14px;">This color will change after 3s</div>
</td>
</tr>
</table>
</div>

`set_interval(`_fonction,ms_`)`
> launches repeated execution of the *function* every *ms* milliseconds. This function returns an object usable in the following function

> It is a wrapper of the `setInterval` function in javascript. Official docs can be found [here](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-setinterval).

> When possible, you should avoid the use of this function and use request_animation_frame (see below) as an alternative. 

`clear_interval(`_timer_`)`
> stops the repeated execution of the function defined by `set_interval()`

> It is a wrapper of the `clearInterval` function in javascript. Official docs can be found [here](http://www.w3.org/TR/2011/WD-html5-20110525/timers.html#dom-windowtimers-clearinterval).

> Here you could see an example where it is used `set_interval` and `cancel_interval`:

<div style="padding-left:50px;">
<div id="py-source" style="background-color:#dddddd;">
    import time
    from browser import timer
    
    _timer = None
    counter = 0
    
    def show():
        doc['_timer'].text = '%.2f' %(time.time()-counter)
    
    def start_timer(ev):
        global _timer,counter
        if _timer is None:
            counter = time.time()
            _timer = timer.set_interval(show,10)
            doc['start'].text = 'Hold'
        elif _timer == 'hold': # restart
            # restart timer
            counter = time.time()-float(doc['_timer'].text)
            _timer = timer.set_interval(show,10)
            doc['start'].text = 'Hold'
        else: # hold
            timer.clear_interval(_timer)
            _timer = 'hold'
            doc['start'].text = 'Restart'
    
    def stop_timer(ev):
        global _timer
        timer.clear_interval(_timer)
        _timer = None
        t = 0
        doc['_timer'].text = '%.2f' %0
        doc['start'].text = 'Start'

    doc['start'].bind('click', start_timer)
    doc['stop'].bind('click', stop_timer)
</div>

<script type='text/python'>
exec(doc['py-source'].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button id="start">Start</button>
<br><button id="stop">Stop</button>
</td>
<td>
<div id="_timer" style="background-color:black;color:#0F0;padding:15px;font-family:courier;font-weight:bold;font-size:23px;">0.00</div>
</td>
</tr>
</table>
</div>

`request_animation_frame(*function*)`
> runs the *function* repeatedly letting the browser be in charge to update the browser. *function* uses a fake argument

> It is a wrapper of the `requestAnimationFrame` function in javascript. Official docs can be found [here](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-requestanimationframe). 

`cancel_animation_frame(*id*)`
> cancels the  repeated execution of the function defined by *request_animation_frame()* and uses the value returned by *request_animation_frame()* as *id*

> It is a wrapper of the `cancelAnimationFrame` function in javascript. Official docs can be found [here](http://www.w3.org/TR/animation-timing/#dom-windowanimationtiming-cancelanimationframe).

> Here you could see an example where it is used `request_animation_frame` and `cancel_animation_frame`:

<div style="padding-left:50px;">
<div id="raf-example" style="background-color:#dddddd;">
    from browser.timer import request_animation_frame as raf
    from browser.timer import cancel_animation_frame as caf
    from browser import doc, win
    from time import time
    from browser.html import CANVAS, BUTTON
    import math

    ctx = doc['raf-canvas'].getContext( '2d' ) 

    toggle = True

    def draw():
        t = time() * 3
        x = math.sin(t) * 96 + 128
        y = math.cos(t * 0.9) * 96 + 128
        global toggle
        if toggle:
            toggle = False
        else:
            toggle = True
        ctx.fillStyle = 'rgb(200,200,20)' if toggle else 'rgb(20,20,200)'
        ctx.beginPath()
        ctx.arc( x, y, 6, 0, math.pi * 2, True)
        ctx.closePath()
        ctx.fill()

    def animate(i):
        global id
        id = raf(animate)
        draw()

    def stop(i):
        print(id)
        caf(id)

    win.animate = animate
    win.stop = stop
</div>

<script type='text/python'>
exec(doc['raf-example'].text)
</script>

<table cellpadding=10>
<tr>
<td style="width:100px;">
<button type="button" onclick="animate(0)">Animate</button>
<br>
<button type="button" onclick="stop(0)">Stop</button>
</td>
<td>
<canvas id="raf-canvas" width=256 height=256></canvas>
</td>
</tr>
</table>
</div>