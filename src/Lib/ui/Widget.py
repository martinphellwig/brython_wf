import random
from browser import doc as document  # :( document doesn't work

def getMousePosition(e):
    if e is None:
       e=win.event

    if e.pageX or e.pageY:
       return {'x': e.pageX, 'y': e.pageY}

    if e.clientX or e.clientY:
       _posx=e.clientX + doc.body.scrollLeft + doc.documentElement.scrollLeft;
       _posy=e.clientY + doc.body.scrollTop + doc.documentElement.scrollTop;
       return {'x': _posx, 'y': _posy}
      
    return {'x': 0, 'y': 0}

class Widget:
  def __init__(self, element, type, id=None):
      self._element=element

      if id is None:
         self._element.id='%s_%s' % (type, int(100000*random.random()))
      else:
         self._element.id=id

  def get_id(self):
      return self._element.id

  def attach(self, element_id):
      """ append this DOM component to DOM element element_id"""
      #document[element_id] <= self._element   #this doesn't work :(
      #doc is actually the global 'doc' not the one we imported from browser :(
      doc[element_id] <= self._element

  def show(self):
      self._element.display='block'

  def hide(self):
      self._element.display='none'

class DraggableWidget(Widget):
  def __init__(self, element, type, id=None):
      Widget.__init__(self, element, type, id)

      def drag(e):
          self._element.style.top='%spx' % (e.clientY - self._deltaY)
          self._element.style.left='%spx' % (e.clientX - self._deltaX)

      def mouseDown(e):
          self._element.style.position='absolute'
          self._deltaX=e.clientX - self._element.offsetLeft
          self._deltaY=e.clientY - self._element.offsetTop
          doc.bind('mousemove', drag)

      def mouseUp(e):
          doc.unbind('mousemove')

      self._element.bind('mousedown', mouseDown)
      self._element.bind('mouseup', mouseUp)
