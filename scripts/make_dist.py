# script to compact all Brython scripts in a single one
import os
import sys
import re
import datetime
import tarfile
import zipfile
import make_VFS
import custom_minify

# path of parent directory
pdir = os.path.dirname(os.getcwd())
   
# version info
version = [3,3,0,"alpha",0]
implementation = [2, 1, 0, 'rc', 2]
sources = ['brython_builtins','version_info','py2js','py_object','py_type',
    'py_utils','py_builtin_functions','js_objects','stdlib_paths','py_import',
    'py_float','py_int','py_complex','py_dict','py_list','py_string','py_set',
    'py_dom']
   
   
abs_path = lambda path:os.path.join(os.path.dirname(os.getcwd()),'src',path)
now = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')

def update_version_number(abs_path, now, implementation, version):    
    # update version number
    out = open(abs_path('version_info.js'),'w')
    #implementation[2] = now
    out.write('__BRYTHON__.implementation = %s\n' % implementation)
    out.write('__BRYTHON__.version_info = %s\n' %str(version))
    # builtin module names = list of scripts in src/libs
    out.write('__BRYTHON__.builtin_module_names = ["posix",')
    out.write(',\n    '.join(['"%s"' %fname.split('.')[0]
         for fname in os.listdir(abs_path('libs'))]))
    # add Python scripts in Lib that start with _ and are not found in CPython Lib
    #using sys.executable to find stdlib dir doesn't work under linux..
    stdlib_path = os.path.dirname(os.__file__)
    #stdlib_path = os.path.join(os.path.dirname(sys.executable),'Lib')
    stdlib_mods = [f for f in os.listdir(stdlib_path) if f.startswith('_')]
    # Pierre, I think we need the os.listdir on the line below or 
    # brython_modes = []
    brython_mods = [f for f in os.listdir(abs_path('Lib'))
        if f.startswith('_') and f!='__pycache__']
    brython_py_builtins = [os.path.splitext(x)[0] for x in brython_mods if not x in stdlib_mods]
    out.write(',\n    '+',\n    '.join(['"%s"' %f for f in brython_py_builtins]))
    out.write(']\n')
    out.close()
    
update_version_number(abs_path, now, implementation, version)


def create_stdlib_paths():
    # Create file stdlib_paths.js : static mapping between module names and paths
    # in the standard library
    
    libfolder = os.path.join(os.path.dirname(os.getcwd()),'src')
    out = open(os.path.join(libfolder,'stdlib_paths.js'),'w')
    out.write(';(function(){\n')
    out.write('    var stdlib = [\n')
    
    jspath = os.path.join(libfolder,'libs')
    for dirpath, dirnames, filenames in os.walk(jspath):
        for filename in filenames:
            mod_name = os.path.splitext(filename)[0]
            mod_path = '/'.join(os.path.join(dirpath,mod_name)[len(libfolder):].split(os.sep))
            out.write('        ["%s","js"],\n' %mod_name)
    
    pypath = os.path.join(libfolder,'Lib')
    for dirpath, dirnames, filenames in os.walk(pypath):
        for filename in filenames:
            mod_name, ext = os.path.splitext(filename)
            if ext != '.py':
                continue
            path = dirpath[len(pypath)+len(os.sep):].split(os.sep)+[mod_name]
            if not path[0]:
                path = path[1:]
            mod_name = '.'.join(path).lstrip('.')
            if filename=='__init__.py':
                mod_name = '.'.join(path[:-1]).lstrip('.')
            mod_path = 'Lib/'+'/'.join(path)
            if filename=='__init__.py':
                out.write('        ["%s","py",true],\n' %mod_name)
            else:
                out.write('        ["%s","py"],\n' %mod_name)
    
    out.write("""    ]
        __BRYTHON__.stdlib = {}
        for(var i=0;i<stdlib.length;i++){
            var mod = stdlib[i]
            __BRYTHON__.stdlib[mod[0]]=mod.slice(1)
        }
    })()
    """)
    out.close()
    
    print('static stdlib mapping ok')

create_stdlib_paths()


def create_py_loader(version, sources):
    # build brython.js from base Javascript files
    
    loader_src = open(abs_path('py_loader.js')).read()
    
    loader_src = re.sub('version_info = \[1,2,".*?"\,"alpha",0]',
        'version_info = %s' % version, loader_src)
    out = open(abs_path('py_loader.js'),'w')
    out.write(loader_src)
    out.close()

create_py_loader(version, sources)

def create_brython(version, implementation, sources, abs_path):
    res = '// brython.js www.brython.info\n'
    res += '// version %s\n' % version
    res += '// implementation %s\n' % implementation
    res += '// version compiled from commented, indented source files '
    res += 'at https://bitbucket.org/olemis/brython/src\n'
    src_size = 0
    for fname in sources:
        src = open(abs_path(fname)+'.js').read()+'\n'
        src_size += len(src)
        res+= custom_minify.javascript(src, fname)
    
    res = res.replace('context','C')
    
    out = open(abs_path('brython.js'),'w')
    out.write(res)
    out.close()
    
    print('size : originals %s compact %s gain %.2f' %(src_size,len(res),100*(src_size-len(res))/src_size))

create_brython(version, implementation, sources, abs_path)

def is_valid(filename):
    if filename.startswith('.'):
        return False
    for ext in ['bat','log','gz','pyc']:
        if filename.lower().endswith('.%s' %ext):
            return False
    return True

def create_archives():
    # version name
    vname = '.'.join(str(x) for x in implementation[:3])
    if implementation[3]=='rc':
        vname += 'rc%s' %implementation[4]
    
    # zip files
    
    dest_dir = os.path.join(pdir,'dist')
    if not os.path.exists(dest_dir):
        os.mkdir(dest_dir)
    name = 'Brython%s_site_mirror-%s' %(vname,now)
    dest_path = os.path.join(dest_dir,name)
    
    
    dist_gz = tarfile.open(dest_path+'.gz',mode='w:gz')
    
    for path in os.listdir(pdir):
        if not is_valid(path):
            continue
        abs_path = os.path.join(pdir,path)
        if os.path.isdir(abs_path) and path=="dist":
            continue
        print('add',path)
        dist_gz.add(os.path.join(pdir,path),
            arcname=os.path.join(name,path))
    
    dist_gz.close()
    
    dist_zip = zipfile.ZipFile(dest_path+'.zip',mode='w',compression=zipfile.ZIP_DEFLATED)
    
    for dirpath,dirnames,filenames in os.walk(pdir):
        print(dirpath)
        for path in filenames:
            if not is_valid(path):
                continue
            abs_path = os.path.join(pdir,dirpath,path)
            #print('add',path)
            dist_zip.write(os.path.join(dirpath,path),
                arcname=os.path.join(name,dirpath[len(pdir)+1:],path))
        if 'dist' in dirnames:
            dirnames.remove('dist')
        if '.hg' in dirnames:
            dirnames.remove('.hg')
        for dirname in dirnames:
            if dirname == 'dist':
                continue
    
    dist_zip.close()

    print('end of mirror')
    
    # minimum package
    name = 'Brython%s-%s' %(vname,now)
    dest_path = os.path.join(dest_dir,name)
    dist1 = tarfile.open(dest_path+'.gz',mode='w:gz')
    dist2 = tarfile.open(dest_path+'.bz2',mode='w:bz2')
    dist3 = zipfile.ZipFile(dest_path+'.zip',mode='w',compression=zipfile.ZIP_DEFLATED)

    for arc,wfunc in (dist1,dist1.add),(dist2,dist2.add),(dist3,dist3.write):
    
        for path in 'README.txt','LICENCE.txt':
            wfunc(os.path.join(pdir,path),
                    arcname=os.path.join(name,path))
    
        wfunc(os.path.join(pdir,'src','brython.js'),
                arcname=os.path.join(name,'brython.js'))
        
        base = os.path.join(pdir,'src')
        folders = ['libs','Lib']
        for folder in folders:
            for dirpath,dirnames,filenames in os.walk(os.path.join(base,folder)):
                for path in filenames:
                    if os.path.splitext(path)[1] not in ['.js','.py']:
                        continue
                    #abs_path = os.path.join(os.getcwd(),'src',folder,path)
                    print('add',path,dirpath[len(base):])
                    wfunc(os.path.join(dirpath,path),
                        arcname=os.path.join(name,dirpath[len(base)+1:],path))
    
        arc.close()

create_archives()

sys.path.append("scripts")


def create_py_vfs(pdir):
    make_VFS.process(os.path.join(pdir,'src','py_VFS.js'))
    
    # make distribution with core + libraries
    out = open(os.path.join(pdir,'src','brython_dist.js'),'w')
    out.write(open(os.path.join(pdir,'src','brython.js')).read())
    out.write(open(os.path.join(pdir,'src','py_VFS.js')).read())
    out.close()

create_py_vfs(pdir)


def create_change_log(pdir, implementation):
    # changelog file
    try:
        _in = open(os.path.join(pdir,'dist','changelog.txt')).read()
        out = open(os.path.join(pdir,'dist','changelog_%s.txt' %now),'w')
        first = 'Changes in Brython version %s.%s-%s' %(implementation[0],implementation[1],now)
        out.write('%s\n' %first)
        out.write('%s\n\n' %('='*len(first)))
        out.write(_in)
        out.close()
    except:
        print("Warning - no changelog file")

create_change_log(pdir, implementation)