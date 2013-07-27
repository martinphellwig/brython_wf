from html import *

# upper menu

trans_menu = {
    'menu_console':{'en':'Console','es':'Consola','fr':'Console', 'pt':'Console'},
    'menu_gallery':{'en':'Gallery','es':'Galería','fr':'Galerie', 'pt':'Galeria'},
    'menu_doc':{'en':'Documentation','es':'Documentación','fr':'Documentation', 'pt':'Documentação'},
    'menu_download':{'en':'Download','es':'Descargas','fr':'Téléchargement', 'pt':'Download'},
    'menu_dev':{'en':'Development','es':'Desarrollo','fr':'Développement', 'pt':'Desenvolvimento'},
    'menu_groups':{'en':'Groups','es':'Grupos','fr':'Groupes', 'pt':'Grupos'}
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

# The variable "language" is set in the calling page : "en" for 
# doc/en/index.html, etc
# It is used for the translation in the calling page
#
# "lang" is the language received in the query string, or None
# It is used to append a query string to menu links
lang = doc.query().getvalue('lang',None)

for key in ['home','console','gallery','doc','download','dev','groups']:
    href = links[key]
    if key in ['gallery']:
        if lang:href = href %lang
        else:href = href %language
    if lang and key not in ['download','dev']:
        # add lang to href
        href += '?lang=%s' %lang
    if key == 'home':
        link = A(IMG(src="../../brython_white.png",Class="logo"),href=href)
        cell = TD(link,Class="logo")
    else:
        link = A(trans_menu['menu_%s'%key][language],href=href,Class="banner")
        cell = TD(link)
    if key in ['download','dev']:
        link.target = "_blank"      
    _banner <= cell
