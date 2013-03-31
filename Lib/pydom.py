
class Selector:
  def __init__(self, selector):
      if (isinstance(selector, str)):
         if selector.startswith("."):
            self._selector=selector[1:]
            self._selector_type="classname"
         elif selector.startswith("#"):
            self._selector=selector[1:]
            self._selector_type="tag"
         else:  #assume this is an id
            self._selector=selector
            self._selector_type="id"
      else:  #this is a function
         self._selector_type="selector"
         self._function=selector
         self.get=self._function_get

  def _function_get(self):
      def recurse(node):
          _list=[]
          if self._function(node):
             _list.append(node)

          for _node in node.childNodes:
              _list+=recurse(_node)

          return _list

      _matched_nodes=recurse(doc)
      return NodeCollection(_matched_nodes)

  def get(self):
      _matched_nodes=[]
      
      if self._selector_type=="id":
         _matched_nodes=doc.get(id=self._selector)
      elif self._selector_type=="classname":
         _matched_nodes=doc.get(classname=self._selector)
      elif self._selector_type=="tag":
         _matched_nodes=doc.get(tag=self._selector)
      elif self._selector_type=="selector":
         _matched_nodes=doc.get(selector=self._selector)

      return NodeCollection(_matched_nodes)

class NodeCollection:
  def __init__(self, nodes):
      self._nodes=nodes

  def __len__(self):
      return len(self._nodes)

  def __item__(self, i):
      return self._nodes[i]

  def next(self):
      for _node in self._nodes:
          yield _node

  def addClass(self, classname):
      for _node in self._nodes:
          _node.addClass(classname)
