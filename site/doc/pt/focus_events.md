Focus events
============

<script type="text/python">
from browser import doc, alert
</script>

Focus events are

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>an element has lost focus
</td>
</tr>

<tr>
<td>*focus*</td><td>an element has received focus</td>
</tr>

</table>

#### Example

Click in the entry field below to make it receive focus, then click somewhere outside the field to make it lose focus

<p><input id="entry"></input>&nbsp;<span id="traceFocus">&nbsp;</span>

#### Code

<div id="codeFocus">
    def getFocus(ev):
        doc["traceFocus"].text = '%s receives focus' %ev.target.id
        
    def loseFocus(ev):
        doc["traceFocus"].text = '%s loses focus' %ev.target.id

    doc['entry'].bind('blur', loseFocus)
    doc['entry'].bind('focus', getFocus)
</div>

<script type="text/python">
exec(doc["codeFocus"].text)
</script>

