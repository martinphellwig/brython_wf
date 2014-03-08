Keyboard events
===============

<script type="text/python">
from browser import doc, alert
</script>

Keyboard events are

<table cellpadding=3 border=1>
<tr>
<td>*input*</td>
<td>triggered when the value of an &lt;input&gt; or &lt;textarea&gt; element is modified, or the content of a `contenteditable` element is modified
</td>
</tr>

<tr>
<td>*keydown*</td><td>fired when any key on the keyboard is pressed down</td>
</tr>

<tr><td>*keypress*</td><td>a key is pressed down and that key normally produces a character value. For instance, when entering Ctrl+C, the event *keypress* is only fired when the key C is pressed down, whereas *keydown* is fired as soon as the Ctrl key is pressed</td></tr>

<tr><td>*keyup*</td><td>a key is released</td></tr>

</table>

`DOMEvent` object attributes
----------------------------

For keyboard events, the `DOMEvent` instance has the following attributes

<table border=1 cellpadding=5>

<tr>
<td>
`altKey`
> `True` if the Alt (or Option, on Mac) key was active when the key event was generated

> This attribute is not set for the *input* event

> It is usually used with *keypress*, to be able to test if Alt+&lt;key&gt; was entered, or just &lt;key&gt;
</td>
<td>
#### Example

Enter text in the field below, with or without pressing the Alt key
<p><input id="altKey" value=""></input>&nbsp;<span id="traceAltKey">&nbsp;</span>

#### Code

<div id="codeAltKey">
    def altKey(ev):
        doc["traceAltKey"].text = 'altKey : %s ' %ev.altKey
        
    # the entry field has the id "altKey"
    doc['altKey'].bind('keypress', altKey)
</div>
</td>
</tr>

<td>
`charCode`
> The Unicode reference number of the key

> This attribute is used only by the *keypress* event

> It is set to a different value if the Shift key is pressed or not
</td>
<td>
#### Example

Enter text in the entry below. Note that the character can be read by `ch(ev.charCode)`

<input id="charCode" value=""></input>&nbsp;<span id="traceCharCode">&nbsp;</span>

#### Code

<div id="codeCharCode">
    trace = doc["traceCharCode"]
    def charCode(ev):
        char = chr(ev.charCode)
        trace.text = 'charCode : %s, ' %ev.charCode
        trace.text += 'character : %s' %char
    
    doc['charCode'].bind('keypress', charCode)
</div>
</td>

<tr>
<td>
`ctrlKey`
> `True` if the Control key was active when the key event was generated

> This attribute is not set for the *input* event

> It is usually used with *keypress*, to be able to test if Ctrl+&lt;key&gt; was entered, or just &lt;key&gt;</td>
<td>
#### Example

Enter text in the field below, with or without pressing the Ctrl key

<input id="ctrlKey" value=""></input>
&nbsp;<span id="traceCtrlKey">&nbsp;</span>

#### Code

<div id="codeCtrlKey">
    trace = doc["traceCtrlKey"]
    
    def ctrlKey(ev):
        trace.text = 'ctrlKey : %s ' %ev.ctrlKey
        ev.preventDefault()
    
    doc['ctrlKey'].bind('keypress', ctrlKey)
</div>
Note that `ev.preventDefault()` is used to avoid the default behaviour of some keyboard shortcuts using the Ctrl key

</td>
</tr>

<tr>
<td>
`keyCode`
> A system and implementation dependent numerical code identifying the unmodified value of the pressed key

> The value doesn't change if the keys Alt, Ctrl or Shift are pressed

> Note that the result is not the same depending on the handled events *keydown*, *keyup* or *keypress*
</td>
<td>
#### Example

Enter text in the entry fields below. Note that the character can be read by `ch(ev.charCode)` with the *keypress* event

with *keydown* <input id="keyCodeKeydown" value=""></input>

<p>with *keypress* <input id="keyCodeKeypress" value=""></input>
&nbsp;<span id="traceKeyCode">&nbsp;</span>

<p>with *keyup* <input id="keyCodeKeyup" value=""></input>

#### Code

<div id="codeKeyCode">
    trace = doc["traceKeyCode"]
    
    def keyCode(ev):
        trace.text = 'event %s '%ev.type
        trace.text += ', keyCode : %s ' %ev.keyCode
        ev.stopPropagation()
    
    doc['keyCodeKeydown'].bind('keydown', keyCode)
    doc['keyCodeKeypress'].bind('keypress', keyCode)
    doc['keyCodeKeyup'].bind('keyup', keyCode)
</div>

</td>
</tr>

<tr>
<td>
`shiftKey`
> `True` if the Shift key was active when the key event was generated

> This attribute is not set for the *input* event

> It is usually used with *keypress*, to be able to test if Shift+&lt;key&gt; was entered, or just &lt;key&gt;</td>
</td>
<td>
#### Example

Enter text in the field below, with or without pressing the Shift key

<input id="shiftKey" value=""></input>
&nbsp;<span id="traceShiftKey">&nbsp;</span>

#### Code

<div id="codeShiftKey">
    trace = doc["traceShiftKey"]
    def shiftKey(ev):
        trace.text = 'shiftKey : %s ' %ev.shiftKey

    doc['shiftKey'].bind('keypress', shiftKey)
</div>
</td>
</tr>

<tr>
<td>
`which`
> A system and implementation dependent numeric code identifying the unmodified value of the pressed key

> Note that the result is not the same depending on the handled events *keydown*, *keyup* or *keypress*
</td>
<td>
#### Example

Enter text in the entry below. Note that the character can be read by `chr(ev.which)` for the *keypress* event


<table>
<tr>
<td>
with *keydown* <input id="whichKeydown"></input>

<p>with *keypress* <input id="whichKeypress"></input>

<p>with *keyup* <input id="whichKeyup"></input>

 </td>
 <td>
 <span id="traceWhich">&nbsp;</span>
 </td>
 </tr>
 <tr>
 <td colspan=2>
#### Code

 <div id="codeWhich">
    trace = doc["traceWhich"]

    def which(ev):
        trace.html = 'event : %s<br>' %ev.type
        trace.html += 'which : %s<br>' %ev.which
        if ev.type == 'keypress':
            trace.html += 'character : %s' %chr(ev.which)

    doc['whichKeydown'].bind('keydown', which)
    doc['whichKeypress'].bind('keypress', which)
    doc['whichKeyup'].bind('keyup', which)
 </div>
 </td>
 </tr>
 </table>
</td>
</tr>
</table>

<script type="text/python">
exec(doc["codeAltKey"].text)
exec(doc["codeCharCode"].text)
exec(doc["codeCtrlKey"].text)
exec(doc["codeKeyCode"].text)
exec(doc["codeShiftKey"].text)
exec(doc["codeWhich"].text)
</script>

