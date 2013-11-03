import BaseUI

class dialog(BaseUI.BaseUI):
  def __init__(self, id=None, document=doc):
      self._div_shell=document.createElement("DIV")
      BaseUI.BaseUI.__init__(self, self._div_shell, 'dialog', id,
                             draggable=True)


      self._div_shell.setAttribute('class', "ui-dialog ui-widget ui-widget-content ui-corner-all ui-front ui-draggable ui-resizable")
      self._div_shell.setAttribute('style',"position: absolute; height: auto; width: 300px; top: 98px; left: 140.5px; display: block;")
      self._div_shell.role="dialog"

      _div_titlebar=document.createElement("DIV")
      _div_titlebar.id="titlebar"
      _div_titlebar.setAttribute('class', "ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix")

      self._div_shell.appendChild(_div_titlebar)

      self._div_title=document.createElement("span")
      self._div_title.id="title"
      self._div_title.setAttribute('class',"ui-dialog-title")
        
      _div_titlebar.appendChild(self._div_title)

      #<button class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close" role="button" aria-disabled="false" title="close">
      self._title_button=document.createElement("button")
      self._title_button.id="title"
      self._title_button.setAttribute('class', "ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ui-dialog-titlebar-close")
      self._title_button.title="close"
      self._title_button.role="button"  

      def dialog_close(e):
          _obj=JSObject(e.target.elt.parentElement.parentElement)
          _obj.style.display='none'

      self._title_button.addEventListener('click', dialog_close, False)

      _span=document.createElement("span")
      _span.setAttribute("class", "ui-button-icon-primary ui-icon ui-icon-closethick")
      self._title_button.appendChild(_span)

      _span=document.createElement("span")
      _span.setAttribute("class", "ui-button-text")
      _span.set_text('close')
      self._title_button.appendChild(_span)

      _div_titlebar.appendChild(self._title_button)
      

      #<div id="dialog" class="ui-dialog-content ui-widget-content" style="width: auto; min-height: 105px; max-height: none; height: auto;">
      #<p>This is the default dialog which is useful for displaying information. The dialog window can be moved, resized and closed with the 'x' icon.</p>
      #</div>

      self._div_dialog=document.createElement("div")
      self._div_dialog.setAttribute('class',"ui-dialog-content ui-widget-content") 
      self._div_dialog.setAttribute('style',"width: auto; min-height: 105px; max-height: none; height: auto;")

      self._div_shell.appendChild(self._div_dialog)

      for _i in ['n', 'e', 's', 'w', 'se', 'sw', 'ne', 'nw']:
          _div=document.createElement("div")
          if _i == 'se':
             _div.setAttribute('class', "ui-resizable-handle ui-resizable-%s ui-icon ui-icon-gripsmall-diagonal-%s" % (_i, _i))
          else:
             _div.setAttribute('class',"ui-resizable-handle ui-resizable-%s" % _i)
          _div.setAttribute('style',"z-index: 90;")

          self._div_shell.appendChild(_div)

      document.get(tag='body')[0].appendChild(self._div_shell)

  def set_title(self, title):
      self._div_title.set_text(title)

  def set_body(self, body):
      self._div_dialog.set_html(body)


