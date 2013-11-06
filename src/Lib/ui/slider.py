import BaseUI
from brython import doc, html
#import math

class slider(BaseUI.BaseUI):
  def __init__(self, id=None, document=doc, label=False):
      self._div_shell=html.DIV(Class="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all")

      BaseUI.BaseUI.__init__(self, self._div_shell, 'slider', id)

      self._handle=html.A(Class="ui-slider-handle ui-state-default ui-corner-all",
                          'href'='#', style={'left': '0px'})
      self._value=0

      def startSlide(e):
          global startMouseX, lastElementLeft, isMouseDown, sliderWidth, handleWidth
          isMouseDown=True
          sliderWidth=e.target.elt.parentElement.offsetWidth
          handleWidth=e.target.elt.offsetWidth
          
          print('sliderWidth:%s' % sliderWidth)
          print('handleWidth:%s' % handleWidth)
          pos = BaseUI.getMousePosition(e)
          startMouseX=pos['x']

          lastElementLeft = int(e.target.elt.offsetLeft) - int(e.target.elt.parentElement.offsetLeft)
          print(e.target.elt.offsetLeft)
          print(e.target.elt.parentElement.offsetLeft)
          lastElementLeft=max(0, lastElementLeft)
          print('lastElementLeft:%s' % lastElementLeft)

      def updatePosition(e):
          print("updatePosition")
          pos = BaseUI.getMousePosition(e)
          print(pos['x'])
          print(startMouseX)
          #print(lastElementLeft, pos['x'], startMouseX)
          _newPos = lastElementLeft + pos['x'] - startMouseX
          
          _upperBound = sliderWidth - handleWidth
          _newPos = max(0, _newPos)
          _newPos = min(_newPos, _upperBound)
          print('newPos:%s' % _newPos)
          
          e.target.elt.style.left = '%spx' % _newPos

      def moving(e):
          if isMouseDown:
             updatePosition(e)

      def dropCallback(e):
          isMouseDown=False

      isMouseDown=False
      self._handle.bind('mousemove', moving)
      self._handle.bind('mouseup', dropCallback)
      self._handle.bind('mousedown', startSlide)

      def mouseover(e):
          _class=e.target.getAttribute('class')
          e.target.setAttribute('class', '%s %s' % (_class, 'ui-state-hover'))

      def mouseout(e):
          _class=e.target.getAttribute('class')
          e.target.setAttribute('class', _class.replace('ui-state-hover', ''))

      self._handle.bind('mouseover', mouseover)
      self._handle.bind('mouseout', mouseout)

      self._div_shell <= self._handle

  def get_value(self):
      return self._value

  def set_value(self, value):
      self._value=value
      self._handle.style.left='%spx' % value
