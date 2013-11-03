from dialog import *
from progressbar import *
from slider import *

def add_stylesheet():
    _link=doc.createElement('link')
    _link.rel='stylesheet'
    _link.setAttribute('href', '/src/Lib/ui/css/smoothness/jquery-ui-1.10.3.custom.min.css')

    doc.get(tag='head')[0].appendChild(_link)
