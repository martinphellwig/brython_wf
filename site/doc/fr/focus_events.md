
Focus events
============

<script type="text/python">
from browser import doc, alert
</script>
Les événement focus sont :

<table cellpadding=3 border=1>
<tr>
<td>*blur*</td>
<td>un élément a perdu le focus
</td>
</tr>

<tr>
<td>*focus*</td><td>un élément a reçu le focus</td>
</tr>

</table>

#### Exemple

Cliquer sur le champ de saisie ci-dessous pour qu'il reçoive le focus, puis cliquer ailleurs dans la page pour que le champ de saisie perde le focus

<p><input id="entry"></input>&nbsp;<span id="traceFocus">&nbsp;</span>

#### Code

<div id="codeFocus">
    def getFocus(ev):
        doc["traceFocus"].text = '%s reçoit le focus' %ev.target.id
        
    def loseFocus(ev):
        doc["traceFocus"].text = '%s perd le focus' %ev.target.id

    doc['entry'].bind('blur', loseFocus)
    doc['entry'].bind('focus', getFocus)
</div>

<script type="text/python">
exec(doc["codeFocus"].text)
</script>


