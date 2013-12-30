from browser import doc,markdown,html

def keydown(ev,path,zone,page):
    if ev.keyCode in [39,40]: # key right or down : next page
        show(path,zone,page+1)
        ev.preventDefault()    
    elif ev.keyCode in [37,38]: #key left or up: previous page
        show(path,zone,page-1)
        ev.preventDefault()    

def show(path,zone,page=0):
    src = open(path).read()
    title = ''
    page_num = False
    while src.startswith('@'):
        line_end = src.find('\n')
        key,value = src[:line_end].split(' ',1)
        if key=='@title':
            title = value
        elif key=='@pagenum':
            page_num = True
        src = src[line_end+1:]

    zone.html = ''
    pages = src.split('../..\n')
    if page<0:
        page = 0
    elif page >= len(pages):
        page = len(pages)-1
    doc.unbind('keydown')
    doc.bind('keydown',lambda ev:keydown(ev,path,zone,page))
    body = html.DIV()
    body.html = markdown.mark(pages[page])[0]

    footer = html.DIV(Id="footer")
    if title:
        footer <= html.DIV(title,Class='title')
    if page_num:
        footer <= html.SPAN('%s/%s' %(page+1,len(pages)))
    zone <= body+footer

