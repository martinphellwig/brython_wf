from browser.pydom import get
import urllib.request

def populate_example(num, url):
    _fp, _url, _headers=urllib.request.urlopen(url)
    _data=_fp.read()

    _=get('#source%d' % num)
    _.text(_data)
    _.css("background-color", "#EBECE4")
