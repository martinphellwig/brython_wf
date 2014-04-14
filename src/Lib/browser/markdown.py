import browser.html
import _jsre as re

class URL:
    def __init__(self,src):
        elts = src.split(maxsplit=1)
        self.href = elts[0]
        self.alt = ''
        if len(elts)==2:
            alt = elts[1]
            if alt[0]=='"' and alt[-1]=='"':self.alt=alt[1:-1]
            elif alt[0]=="'" and alt[-1]=="'":self.alt=alt[1:-1]
            elif alt[0]=="(" and alt[-1]==")":self.alt=alt[1:-1]
        
class CodeBlock:
    def __init__(self,line):
        self.lines = [line]
    
    def to_html(self):
        if self.lines[0].startswith("`"):
            self.lines.pop(0)
        res = escape('\n'.join(self.lines))
        res = unmark(res)
        res = '<pre class="marked">%s</pre>\n' %res
        return res,[]

class HtmlBlock:

    def __init__(self, src):
        self.src = src
    
    def to_html(self):
        return self.src
        
class Marked:
    def __init__(self, line=''):
        self.line = line
        self.children = []

    def to_html(self):
        return apply_markdown(self.line)
        
# get references
refs = {}
ref_pattern = r"^\[(.*)\]:\s+(.*)"

def mark(src):

    global refs
    refs = {}
    # split source in sections
    # sections can be :
    # - a block-level HTML element (markdown syntax will not be processed)
    # - a script
    # - a span-level HTML tag (markdown syntax will be processed)
    # - a code block
    
    # normalise line feeds
    src = src.replace('\r\n','\n')
    
    # lines followed by dashes
    src = re.sub(r'(.*?)\n=+\n', '\n# \\1\n', src)
    src = re.sub(r'(.*?)\n-+\n', '\n## \\1\n', src) 

    lines = src.split('\n')+['']
    
    i = bq = 0
    ul = ol = 0
    
    while i<len(lines):

        # enclose lines starting by > in a blockquote
        if lines[i].startswith('>'):
            nb = 1
            while nb<len(lines[i]) and lines[i][nb]=='>':
                nb += 1
            lines[i] = lines[i][nb:]
            if nb>bq:
                lines.insert(i,'<blockquote>'*(nb-bq))
                i += 1
                bq = nb
            elif nb<bq:
                lines.insert(i,'</blockquote>'*(bq-nb))
                i += 1
                bq = nb
        elif bq>0:
            lines.insert(i,'</blockquote>'*bq)
            i += 1
            bq = 0

        # unordered lists
        if lines[i].strip() and lines[i].lstrip()[0] in '-+*' \
            and len(lines[i].lstrip())>1 \
            and lines[i].lstrip()[1]==' ' \
            and (i==0 or ul or not lines[i-1].strip()):
            # line indentation indicates nesting level
            nb = 1+len(lines[i])-len(lines[i].lstrip())
            lines[i] = '<li>'+lines[i][nb:]
            if nb>ul:
                lines.insert(i,'<ul>'*(nb-ul))
                i += 1
            elif nb<ul:
                lines.insert(i,'</ul>'*(ul-nb))
                i += 1
            ul = nb
        elif ul:
            lines.insert(i,'</ul>'*ul)
            i += 1
            ul = 0

        # ordered lists
        mo = re.search(r'^(\d+\.)',lines[i])
        if mo:
            if not ol:
                lines.insert(i,'<ol>')
                i += 1
            lines[i] = '<li>'+lines[i][len(mo.groups()[0]):]
            ol = 1
        elif ol:
            lines.insert(i,'</ol>')
            i += 1
            ol = 0
        
        i += 1
    
    sections = []
    scripts = []
    htmls = []
    section = Marked()

    i = 0
    while i<len(lines):
        line = lines[i]
        if line.strip() and line.startswith('    '):
            if isinstance(section,Marked) and section.line:
                sections.append(section)
            section = CodeBlock(line[4:])
            j = i+1
            while j<len(lines) and lines[j].strip() \
                and lines[j].startswith('    '):
                    section.lines.append(lines[j][4:])
                    j += 1
            sections.append(section)
            section = Marked()
            i = j   
            continue

        elif line.lower().startswith('<script'):
            if isinstance(section,Marked) and section.line:
                sections.append(section)
                section = Marked()
            j = i+1
            while j<len(lines):
                if lines[j].lower().startswith('</script>'):
                    scripts.append('\n'.join(lines[i+1:j]))
                    for k in range(i,j+1):
                        lines[k] = ''
                    break
                j += 1
            i = j
            continue

        # atext header
        elif line.startswith('#'):
            level = 1
            line = lines[i]
            while level<len(line) and line[level]=='#' and level<=6:
                level += 1
            if not line[level+1:].strip():
                if level==1:
                    i += 1
                    continue
                else:
                    lines[i] = '<H%s>%s</H%s>\n' %(level-1,'#',level-1)
            else:
                lines[i] = '<H%s>%s</H%s>\n' %(level,line[level+1:],level)

        else:
            mo = re.search(ref_pattern,line)
            if mo is not None:
                if isinstance(section,Marked) and section.line:
                    sections.append(section)
                    section = Marked()
                key = mo.groups()[0]
                value = URL(mo.groups()[1])
                refs[key.lower()] = value
            else:
                if line.strip():
                    if section.line:
                        section.line += ' '
                    section.line += line
                else:
                    sections.append(section)
                    section = Marked()
            i += 1

    if isinstance(section,Marked) and section.line:
        sections.append(section)

    res = ''
    for section in sections:
        mk,_scripts = section.to_html()
        res += mk
        scripts += _scripts
    return res,scripts

def escape(czone):
    czone = czone.replace('&','&amp;')
    czone = czone.replace('<','&lt;')
    czone = czone.replace('>','&gt;')
    return czone

def s_escape(mo):
    # used in re.sub
    czone = mo.string[mo.start():mo.end()]
    return escape(czone)

def unmark(code_zone):
    # convert _ to &#95; inside inline code
    code_zone = code_zone.replace('_','&#95;')
    return code_zone

def s_unmark(mo):
    # convert _ to &#95; inside inline code
    code_zone = mo.string[mo.start():mo.end()]
    code_zone = code_zone.replace('_','&#95;')
    return code_zone

def apply_markdown(src):

    scripts = []

    # replace \` by &#96;
    src = src.replace(r'\\\`','&#96;')

    # escape "<", ">", "&" and "_" in inline code
    code_pattern = r'\`(.*?)\`'
    i = 0
    while i<len(src):
        if src[i]=='`':
            j = i+1
            while j<len(src) and src[j]!='`':
                j += 1
            if j!=len(src):
                czone = unmark(escape(src[i+1:j]))
                src = src[:i]+'`'+czone+src[j:]
                i = j
        if src[i]=='[':
            start_a = i+1
            while True:
                end_a = src.find(']',i)
                if end_a == -1:
                    break
                if src[end_a-1]=='\\':
                    i = end_a+1
                else:
                    break
            if end_a>-1 and src[start_a:end_a].find('\n')==-1:
                link = src[start_a:end_a]
                rest = src[end_a+1:].lstrip()
                if rest and rest[0]=='(':
                    j = 0
                    while True:
                        end_href = rest.find(')',j)
                        if end_href == -1:
                            break
                        if rest[end_href-1]=='\\':
                            j = end_href+1
                        else:
                            break
                    if end_href>-1 and rest[:end_href].find('\n')==-1:
                        tag = '<a href="'+rest[1:end_href]+'">'+link+'</a>'
                        src = src[:start_a-1]+tag+rest[end_href+1:]
                        i = start_a+len(tag)
                elif rest and rest[0]=='[':
                    j = 0
                    while True:
                        end_key = rest.find(']',j)
                        if end_key == -1:
                            break
                        if rest[end_key-1]=='\\':
                            j = end_key+1
                        else:
                            break
                    if end_key>-1 and rest[:end_key].find('\n')==-1:
                        if not key:
                            key = link
                        if key.lower() not in refs:
                            raise KeyError('unknown reference %s' %key)
                        url = refs[key.lower()]
                        tag = '<a href="'+url+'">'+link+'</a>'
                        src = src[:start_a-1]+tag+rest[end_key+1:]
                        i = start_a+len(tag)
        
        i += 1


    # emphasis

    # replace \* by &#42;
    src = src.replace(r'\\\*','&#42;')
    # replace \_ by &#95;
    src = src.replace(r'\\\_','&#95;')
    # _ and * surrounded by spaces are not markup
    src = src.replace(r' _ ',' &#95; ')
    src = src.replace(r' \\* ',' &#42; ')

    strong_patterns = [('STRONG',r'\*\*(.*?)\*\*'),('B',r'__(.*?)__')]
    for tag,strong_pattern in strong_patterns:
        src = re.sub(strong_pattern,r'<%s>\1</%s>' %(tag,tag),src)

    em_patterns = [('EM',r'\*(.*?)\*'),('I',r'\_(.*?)\_')]
    for tag,em_pattern in em_patterns:
        src = re.sub(em_pattern,r'<%s>\1</%s>' %(tag,tag),src)

    # replace \` by &#96;
    src = src.replace(r'\\\`','&#96;')

    code_pattern = r'\`(.*?)\`'
    src = re.sub(code_pattern,r'<code>\1</code>',src)
    
    src = '<p>'+src+'</p>'

    return src,scripts
