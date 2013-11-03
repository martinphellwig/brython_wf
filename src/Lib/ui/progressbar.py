import BaseUI

class progressbar(BaseUI.BaseUI):
  def __init__(self, id=None, document=doc, label=False):
      self._div_shell=document.createElement("DIV")
      BaseUI.BaseUI.__init__(self, self._div_shell, 'progressbar', id)

      self._div_shell.setAttribute('class', "ui-progressbar ui-widget ui-widget-content ui-corner-all")
      self._div_shell.role="progressbar"

      self._show_label=label
      if label:
         self._label=document.createElement("DIV")
         self._label.setAttribute('class', 'progress-label')
         #self._label.style.position='relative'
         self._div_shell.appendChild(self._label)

      self._bar=document.createElement("DIV")
      self._bar.setAttribute('class', "ui-progressbar-value ui-widget-header ui-corner-left")
      self._bar.style.width="0px"
      self._div_shell.appendChild(self._bar)

  def set_progress(self, percent):
      self._bar.style.width='%s%%' % percent
      if self._show_label:
         self._label.text='%s%%' % percent
