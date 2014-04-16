"""
This custom minify was first part of make_dist
"""

def javascript(source, fname):
    "This attempts to remove whitespace and comments where possible."
    target=''
    pos = 0
    while pos<len(source):
        if source[pos] in ['"',"'"]:
            end = source.find(source[pos],pos+1)
            if end==-1:
                line = source[:pos].count('\n')
                raise SyntaxError('string not closed in %s line %s : %s' %(fname,line,source[pos:pos+20]))
            target += source[pos:end+1]
            pos = end+1
        elif source[pos]=='\r':
            pos += 1
        elif source[pos]==' ':
            if target and target[-1] in '({=[)}];\n':
                pos += 1
                continue
            target += ' '
            while pos<len(source) and source[pos]==' ':
                pos+=1
        elif source[pos] in '\r\n':
            target += source[pos]
            while pos<len(source) and source[pos] in '\r\n ':
                pos+=1
        elif source[pos:pos+2]=='//':
            end = source.find('\n',pos)
            if end==-1:
                break
            pos = end
        elif source[pos:pos+2]=='/*':
            end = source.find('*/',pos)
            if end==-1:
                break
            pos = end+2
        elif source[pos] in '={[(' and target and target[-1]==' ':
            target = target[:-1]+source[pos]
            pos += 1
        elif source[pos]==';' and pos<len(source)-1 and source[pos+1] in '\r\n':
            pos +=1
        else:
            target += source[pos]
            pos += 1

    while '\n\n' in target:
       target = target.replace('\n\n','\n')

    return target
