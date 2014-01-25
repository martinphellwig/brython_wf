from browser.pydom import get
import urllib.request

def populate_example(num, url):
    _fp, _url, _headers=urllib.request.urlopen(url)
    _data=_fp.read()

    get('#source%d' % num).text(_data)

    #set all pre's background (assuming they all contain source code)
    get('pre').css("background-color", "#EBECE4")
