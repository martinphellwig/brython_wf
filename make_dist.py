# script to compact all Brython scripts in a single one
import tokenize
import re
import datetime
import os

try:
  import slimit 
  minify=slimit.minify
except ImportError:
  minify=None

def custom_minify(src):
    _res=''
    pos = 0
    while pos<len(src):
        if src[pos] in ['"',"'"]:
            end = src.find(src[pos],pos+1)
            if end==-1:
                line = src[:pos].count('\n')
                raise SyntaxError('string not closed in %s line %s : %s' %(fname,line,src[pos:pos+20]))
            _res += src[pos:end+1]
            pos = end+1
        elif src[pos]=='\r':
            pos += 1
        elif src[pos]==' ':
            if _res and _res[-1] in '({=[)}];\n':
                pos += 1
                continue
            _res += ' '
            while pos<len(src) and src[pos]==' ':
                pos+=1
        elif src[pos] in '\r\n':
            _res += src[pos]
            while pos<len(src) and src[pos] in '\r\n ':
                pos+=1
        elif src[pos:pos+2]=='//':
            end = src.find('\n',pos)
            if end==-1:
                break
            pos = end
        elif src[pos:pos+2]=='/*':
            end = src.find('*/',pos)
            if end==-1:
                break
            pos = end+2
        elif src[pos] in '={[(' and _res and _res[-1]==' ':
            _res = _res[:-1]+src[pos]
            pos += 1
        elif src[pos]==';' and pos<len(src)-1 and src[pos+1] in '\r\n':
            pos +=1
        else:
            _res += src[pos]
            pos += 1

    while '\n\n' in _res:
       _res = _res.replace('\n\n','\n')

    return _res

now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

sources = ['brython_builtins','py_utils',
    'py_classes','py_list','py_string','py_import',
    'py2js',
    'py_ajax','py_dom']

abs_path = lambda path:os.path.join(os.getcwd(),'src',path)

# update version number in module sys
bltins_src = open(abs_path('brython_builtins.js')).read()

bltins_src = re.sub('version_info = \[1,1,".*?"\]',
    'version_info = [1,1,"%s"]' %now,bltins_src)
out = open(abs_path('brython_builtins.js'),'w')
out.write(bltins_src)
out.close()

loader_src = open(abs_path('py_loader.js')).read()

loader_src = re.sub('version_info = \[1,1,".*?"\]',
    'version_info = [1,1,"%s"]' %now,loader_src)
out = open(abs_path('py_loader.js'),'w')
out.write(loader_src)
out.close()

res = '// brython.js www.brython.info\n'
res += '// version 1.1.%s\n' %now
res += '// version compiled from commented, indented source files at https://bitbucket.org/olemis/brython/src\n'
src_size = 0
for fname in sources:
    src = open(abs_path(fname)+'.js').read()+'\n'
    src_size += len(src)
    try:
      res+=minify(src)
    except:
      res+=custom_minify(src)

res = res.replace('context','C')

out = open(abs_path('brython.js'),'w')
out.write(res)
out.close()

try:
    out = open('../dist/brython_%s.js' %now,'w')
    out.write(res)
    out.close()
except IOError:
    pass

print('size : originals %s compact %s gain %.2f' %(src_size,len(res),100*(src_size-len(res))/src_size))

# zip files
import os
import tarfile
import zipfile

dest_dir = os.path.join(os.getcwd(),'dist')
if not os.path.exists(dest_dir):
    os.mkdir(dest_dir)
name = 'Brython_site_mirror-%s' %now
dest_path = os.path.join(dest_dir,name)
dist = tarfile.open(dest_path+'.gz',mode='w:gz')

def is_valid(filename):
    if filename.startswith('.'):
        return False
    for ext in ['bat','log','gz']:
        if filename.lower().endswith('.%s' %ext):
            return False
    return True

for path in os.listdir(os.getcwd()):
    if not is_valid(path):
        continue
    abs_path = os.path.join(os.getcwd(),path)
    if os.path.isdir(abs_path) and path=="dist":
        continue
    print('add',path)
    dist.add(os.path.join(os.getcwd(),path),
        arcname=os.path.join(name,path))

dist.close()

# minimum package
name = 'Brython-%s' %now
dest_path = os.path.join(dest_dir,name)
dist1 = tarfile.open(dest_path+'.gz',mode='w:gz')
dist2 = tarfile.open(dest_path+'.bz2',mode='w:bz2')
dist3 = zipfile.ZipFile(dest_path+'.zip',mode='w',compression=zipfile.ZIP_DEFLATED)

def is_valid(filename):
    if filename.startswith('.'):
        return False
    if not filename.lower().endswith('.js'):
        return False
    return True

for arc,wfunc in (dist1,dist1.add),(dist2,dist2.add),(dist3,dist3.write):

    for path in 'README.txt','LICENCE.txt':
        wfunc(os.path.join(os.getcwd(),path),
                arcname=os.path.join(name,path))

    for folder,path in [('site','brython.png'),('site','test.html')]:
        wfunc(os.path.join(os.getcwd(),folder,path),
                arcname=os.path.join(name,path))

    wfunc(os.path.join(os.getcwd(),'src','brython.js'),
            arcname=os.path.join(name,'brython.js'))
    
    folders = ['libs','Lib']
    for folder in folders:
        for path in os.listdir(os.path.join(os.getcwd(),'src',folder)):
            if os.path.splitext(path)[1] not in ['.js','.py']:
                continue
            #abs_path = os.path.join(os.getcwd(),'src',folder,path)
            print('add',path)
            wfunc(os.path.join(os.getcwd(),'src',folder,path),
                arcname=os.path.join(name,folder,path))

    arc.close()
