import BaseUI

class slider(BaseUI.BaseUI):
  def __init__(self, id=None, document=doc, label=False):
      self._div_shell=document.createElement("DIV")
      BaseUI.BaseUI.__init__(self, self._div_shell, 'slider', id)


      self._div_shell.setAttribute('class', "ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all")

      self._handle=document.createElement("a")
      self._handle.setAttribute('class', "ui-slider-handle ui-state-default ui-corner-all")
      self._handle.setAttribute('href', '#')
      self._handle.style.left='0px'
      self._value=0

      def drag(e):
          print("%s" % (e.clientX)) # - deltaX))
          #self._element.style.top='%spx' % (e.clientY - self._deltaY)
          if e.clientX >= deltaX:
             e.target.style.left='%spx' % e.clientX #(e.clientX - deltaX)

      def mouseDown(e):
          global deltaX
          #e.target.style.position='relative'
          #e.target.get_parent().width
          deltaX=e.target.get_parent().offsetLeft
          #self._deltaY=e.clientY - self._element.offsetTop
          e.target.addEventListener('mousemove', drag, true)

          _class=e.target.getAttribute('class')
          e.target.setAttribute('class', _class.replace('ui-state-hover', ''))

      def mouseUp(e):
          e.target.removeEventListener('mousemove', drag, true)

      self._handle.addEventListener('mousedown', mouseDown)
      self._handle.addEventListener('mouseup', mouseUp)

      def mouseover(e):
          _class=e.target.getAttribute('class')
          e.target.setAttribute('class', '%s %s' % (_class, 'ui-state-hover'))

      def mouseout(e):
          _class=e.target.getAttribute('class')
          e.target.setAttribute('class', _class.replace('ui-state-hover', ''))

      self._handle.addEventListener('mouseover', mouseover)
      self._handle.addEventListener('mouseout', mouseout)

      self._div_shell.appendChild(self._handle)

  def get_value(self):
      return self._value

  def set_value(self, value):
      self._value=value
      self._handle.style.left='%spx' % value
