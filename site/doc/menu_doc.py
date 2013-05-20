from html import *

# upper menu

trans_menu = {
    'menu_console':{'en':'Console','es':'Consola','fr':'Console'},
    'menu_gallery':{'en':'Gallery','es':'Galería','fr':'Galerie'},
    'menu_doc':{'en':'Documentation','es':'Documentación','fr':'Documentation'},
    'menu_download':{'en':'Download','es':'Descargas','fr':'Téléchargement'},
    'menu_dev':{'en':'Development','es':'Desarollo','fr':'Développement'},
    'menu_groups':{'en':'Groups','es':'Grupos','fr':'Groupes'}
}

links = {'home':'../../index.html',
    'console':'../../tests/console.html',
    'gallery':'../../gallery/gallery_%s.html',
    'doc':'index.html',
    'download':'https://bitbucket.org/olemis/brython/downloads',
    'dev':'https://bitbucket.org/olemis/brython/src',
    'groups':'../../groups.html'
}

_banner = doc['banner_row']

for key in ['home','console','gallery','doc','download','dev','groups']:
    href = links[key]
    if key in ['gallery']:
        href = href %language
    if key not in ['download','dev']:
        # add lang to href
        href += '?lang=%s' %language
    if key == 'home':
        link = A(IMG(src="../../brython_white.png",Class="logo"),href=href)
        cell = TD(link,Class="logo")
    else:
        link = A(trans_menu['menu_%s'%key][language],href=href,Class="banner")
        cell = TD(link)
    if key in ['download','dev']:
        link.target = "_blank"        
    _banner <= cell
