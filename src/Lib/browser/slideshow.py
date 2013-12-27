from browser import doc,markdown,html

def show(path,zone,page=0):
    src = open(path).read()
    zone.html = ''
    pages = src.split('../..\n')
    body = html.DIV()
    body.html = markdown.mark(pages[page])[0]
    header = html.DIV()
    previous = html.BUTTON('<',disabled=page==0)
    previous.bind('click',lambda ev:show(path,zone,page-1))
    header <= previous
    next = html.BUTTON('>',disabled=page==len(pages)-1)
    next.bind('click',lambda ev:show(path,zone,page+1))
    header <= next
        
    zone <= header+body
    