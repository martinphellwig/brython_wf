#! /usr/bin/env python
"""
Script to build the Brython Distribution
"""
# The Brython version (i.e. this project)
VERSION_BR = [2, 1, 0, 'rc', 2]

# The version of the targeted Python language
VERSION_PY = [3, 3, 0, "alpha", 0]

import os
import sys
import re
import datetime
import tarfile
import zipfile

import make_VFS
import custom_minify

# Anchor projects root folder two folders up relative from this file.
_ROOT_FOLDER = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# The 'Lib' and 'libs' folder are in the 'src' folder under the root folder.
_DIR_SRC = os.path.join(_ROOT_FOLDER, 'src')
_DIR_LIB = os.path.join(_DIR_SRC, 'Lib')
_DIR_LIBS = os.path.join(_DIR_SRC, 'libs')


def write_js_version_info(target_dir):
    """
    Write implementation version, language version and built-in module names.
    """
    print('# Writing version_info.js ... ', end='')
    file_name = 'version_info.js'
    content = [
        '__BRYTHON__.implementation = %s' % VERSION_BR,
        '__BRYTHON__.version_info = %s' % VERSION_PY,
        '__BRYTHON__.builtin_module_names = ']

    # Collecting all modules
    modules = ['posix']

    # builtin module names, i.e. list of scripts in libs
    for module in os.listdir(path=_DIR_LIBS):
        module = module.split('.')[0]
        modules.append(module)

    # Add all modules in Lib folder that start with an underscore and do not
    # exists in sys.builtin_module_names or are a '__pycache__'
    for module in os.listdir(path=_DIR_LIB):
        module = module.split('.')[0]
        if module.startswith('_') and module.lower() != '__pycache__':
            if module not in sys.builtin_module_names:
                modules.append(module)

    modules.sort()
    content.append('[')
    for module in modules:
        content.append('"' + module + '",')
    content.append(']')

    content = '\n'.join(content)

    # Writing the actual file
    file_path = os.path.join(target_dir, file_name)
    with open(file_path, 'w') as file_write:
        file_write.write(content)

    print('done')


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




def create_py_loader(version, sources, abs_path):
    # build brython.js from base Javascript files
    
    loader_src = open(abs_path('py_loader.js')).read()
    
    loader_src = re.sub('version_info = \[1,2,".*?"\,"alpha",0]',
        'version_info = %s' % version, loader_src)
    out = open(abs_path('py_loader.js'),'w')
    out.write(loader_src)
    out.close()



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

def is_valid(filename):
    if filename.startswith('.'):
        return False
    for ext in ['bat','log','gz','pyc']:
        if filename.lower().endswith('.%s' %ext):
            return False
    return True

def create_archives(implementation, pdir, now):
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


def create_py_vfs(pdir):
    make_VFS.process(os.path.join(pdir,'src','py_VFS.js'))
    
    # make distribution with core + libraries
    out = open(os.path.join(pdir,'src','brython_dist.js'),'w')
    out.write(open(os.path.join(pdir,'src','brython.js')).read())
    out.write(open(os.path.join(pdir,'src','py_VFS.js')).read())
    out.close()



def create_change_log(pdir, implementation, now):
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


def main():
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

    
    write_js_version_info(abs_path(''))
#     create_stdlib_paths()
#     create_py_loader(version, sources, abs_path)
#     create_brython(version, implementation, sources, abs_path)
#     create_archives(implementation, pdir, now)
#     sys.path.append("scripts")
#     create_py_vfs(pdir)
#     create_change_log(pdir, implementation, now)
    
if __name__ == '__main__':
    main()