from browser import doc,markdown,html

def show(path,zone,page=0):
    src = open(path).read()
    title = ''
    while src.startswith('@'):
        line_end = src.find('\n')
        key,value = src[:line_end].split(' ',1)
        if key=='@title':
            title = value
        src = src[line_end+1:]
    print('title',title)
    zone.html = ''
    pages = src.split('../..\n')
    body = html.DIV()
    body.html = markdown.mark(pages[page])[0]

    header = html.DIV()
    previous = html.BUTTON('<',disabled=page==0)
    previous.bind('click',lambda ev:show(path,zone,page-1))
    header <= previous
    _next = html.BUTTON('>',disabled=page==len(pages)-1)
    _next.bind('click',lambda ev:show(path,zone,page+1))
    header <= _next

    footer = html.DIV(Id="footer")
    if title:
        footer <= html.DIV(title,Class='title')
        
    zone <= header+body+footer
    