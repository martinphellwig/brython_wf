;(function($B){

$B.$MakeArgs = function($fname,$args,$required,$defaults,$other_args,$other_kw,$after_star){
    // builds a namespace from the arguments provided in $args
    // in a function call like foo(x,y,z=1,*args,u,v,**kw) the parameters are
    // $required : ['x','y']
    // $defaults : {'z':int(1)}
    // $other_args = 'args'
    // $other_kw = 'kw'
    // $after_star = ['u','v']
    var i=null,$set_vars = [],$ns = {},$arg
    if($other_args != null){$ns[$other_args]=[]}
    if($other_kw != null){var $dict_keys=[];var $dict_values=[]}
    // create new list of arguments in case some are packed
    var upargs = []
    for(var i=0;i<$args.length;i++){
        $arg = $args[i]
        if($arg===undefined){console.log('arg '+i+' undef in '+$fname)}
        if($arg===null){upargs.push(null)}
        else if($arg.__class__===$B.$ptupleDict){
            for(var j=0;j<$arg.arg.length;j++){
                upargs.push($arg.arg[j])
            }
        }else if($arg.__class__===$B.$pdictDict){
            for(var j=0;j<$arg.arg.$keys.length;j++){
                upargs.push($B.$Kw($arg.arg.$keys[j],$arg.arg.$values[j]))
            }
        }else{
            upargs.push($arg)
        }
    }
    for(var $i=0;$i<upargs.length;$i++){
        var $arg=upargs[$i]
        var $PyVar=$B.$JS2Py($arg)
        if($arg && $arg.__class__===$B.$KwDict){ // keyword argument
            $PyVar = $arg.value
            if($set_vars.indexOf($arg.name)>-1){
                console.log($arg.name+' already set to '+$ns[$arg.name])
                throw $B.builtins.TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
            } else if($required.indexOf($arg.name)>-1){
                var ix = $required.indexOf($arg.name)
                eval('var '+$required[ix]+"=$PyVar")
                $ns[$required[ix]]=$PyVar
                $set_vars.push($required[ix])
            }else if($other_args!==null && $after_star!==undefined &&
                $after_star.indexOf($arg.name)>-1){
                    var ix = $after_star.indexOf($arg.name)
                    eval('var '+$after_star[ix]+"=$PyVar")
                    $ns[$after_star[ix]]=$PyVar
                    $set_vars.push($after_star[ix])
            } else if($defaults.indexOf($arg.name)>-1){
                $ns[$arg.name]=$PyVar
                $set_vars.push($arg.name)
            } else if($other_kw!=null){
                $dict_keys.push($arg.name)
                $dict_values.push($PyVar)
            } else {
                throw $B.builtins.TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
            }
            var pos_def = $defaults.indexOf($arg.name)
            if(pos_def!=-1){$defaults.splice(pos_def,1)}
        }else{ // positional arguments
            if($i<$required.length){
                eval('var '+$required[$i]+"=$PyVar")
                $ns[$required[$i]]=$PyVar
                $set_vars.push($required[$i])
            } else if($other_args!==null){
                eval('$ns["'+$other_args+'"].push($PyVar)')
            } else if($i<$required.length+$defaults.length) {
                var $var_name = $defaults[$i-$required.length]
                $ns[$var_name]=$PyVar
                $set_vars.push($var_name)
            } else {
                console.log(''+$B.line_info)
                msg = $fname+"() takes "+$required.length+' positional argument'
                msg += $required.length == 1 ? '' : 's'
                msg += ' but more were given'
                throw $B.builtins.TypeError(msg)
            }
        }
    }
    // throw error if not all required positional arguments have been set
    var missing = []
    for(var i=0;i<$required.length;i++){
        if($set_vars.indexOf($required[i])==-1){missing.push($required[i])}
    }
    if(missing.length==1){
        throw $B.builtins.TypeError($fname+" missing 1 positional argument: '"+missing[0]+"'")
    }else if(missing.length>1){
        var msg = $fname+" missing "+missing.length+" positional arguments: "
        for(var i=0;i<missing.length-1;i++){msg += "'"+missing[i]+"', "}
        msg += "and '"+missing.pop()+"'"
        throw $B.builtins.TypeError(msg)
    }
    if($other_kw!=null){
        $ns[$other_kw]=__BRYTHON__.builtins.dict()
        $ns[$other_kw].$keys = $dict_keys
        $ns[$other_kw].$values = $dict_values
    }
    if($other_args!=null){$ns[$other_args]=__BRYTHON__.builtins.tuple($ns[$other_args])}
    return $ns
}

$B.get_class = function(obj){
    // generally we get the attribute __class__ of an object by obj.__class__
    // but Javascript builtins used by Brython (functions, numbers, strings...)
    // don't have this attribute so we must return it
    if(obj==null){obj=$B.builtins.None}
    var klass = obj.__class__
    if(klass===undefined){
        if(typeof obj=='function'){return $B.$FunctionDict}
        else if(typeof obj=='number'){return $B.builtins.int.$dict}
        else if(typeof obj=='string'){return $B.builtins.str.$dict}
        else if(obj===true||obj===false){return $B.$BoolDict}
        else if(typeof obj=='object' && obj.constructor===Array){return $B.builtins.list.$dict}
    }
    return klass
}

$B.$mkdict = function(glob,loc){
    var res = {}
    for(var arg in glob){res[arg]=glob[arg]}
    for(var arg in loc){res[arg]=loc[arg]}
    return res
}

$B.$list_comp = function(){
    var $env = arguments[0]
    for(var $arg in $env){
        eval("var "+$arg+'=$env["'+$arg+'"]')
    }
    var $ix = Math.random().toString(36).substr(2,8)
    var $py = 'def func'+$ix+"():\n"
    $py += "    res=[]\n"
    var indent=4
    for(var $i=2;$i<arguments.length;$i++){
        for(var $j=0;$j<indent;$j++){$py += ' '}
        $py += arguments[$i]+':\n'
        indent += 4
    }
    for(var $j=0;$j<indent;$j++){$py += ' '}
    $py += 'res.append('+arguments[1]+')\n'
    $py += "    return res\n"
    $py += "res"+$ix+"=func"+$ix+"()"
    var $mod_name = 'lc'+$ix
    var $root = $B.py2js($py,$mod_name,$B.line_info)
    $root.caller = $B.line_info
    var $js = $root.to_js()
    $B.vars[$mod_name] = $env
    try{
    eval($js)
    }catch(err){throw $B.exception(err)}
    return eval("res"+$ix)
}

$B.$gen_expr = function(){ // generator expresssion
    var $env = arguments[0]
    for(var $arg in $env){
        try{
            if($arg.search(/\./)>-1){ // qualified name
                eval($arg+'=$env["'+$arg+'"]')
            }else{
                eval("var "+$arg+'=$env["'+$arg+'"]')
            }
        }catch(err){
            throw err
        }
    }
    var $ix = Math.random().toString(36).substr(2,8)
    var $res = 'res'+$ix
    var $py = $res+"=[]\n"
    var indent=0
    for(var $i=2;$i<arguments.length;$i++){
        for(var $j=0;$j<indent;$j++){$py += ' '}
        $py += arguments[$i]+':\n'
        indent += 4
    }
    for(var $j=0;$j<indent;$j++){$py += ' '}
    $py += $res+'.append('+arguments[1]+')'
    var $mod_name = 'ge'+$ix
    var $root = $B.py2js($py,$mod_name,$B.line_info)
    $root.caller = $B.line_info
    var $js = $root.to_js()
    $B.vars[$mod_name] = $env
    eval($js)
    var $res1 = eval($res)
    var $GenExprDict = {
        __class__:__BRYTHON__.$type,
        __name__:'generator',
        toString:function(){return '(generator)'}
    }
    $GenExprDict.__mro__ = [$GenExprDict,__BRYTHON__.builtins.object.$dict]
    $GenExprDict.__iter__ = function(self){return __BRYTHON__.builtins.list.$dict.__iter__(self.value)}
    $GenExprDict.__str__ = function(self){
        if(self===undefined){return "<class 'generator'>"}
        return '<generator object <genexpr>>'
    }
    $GenExprDict.$factory = $GenExprDict
    var $res2 = {value:$res1,__class__:$GenExprDict}
    //$res1.__repr__ = function(){return "<generator object <genexpr>>"}
    //$res1.__str__ = $res1.__repr__
    $res2.toString = function(){return 'ge object'}
    return $res2
}

$B.$dict_comp = function(){ // dictionary comprehension
    var $env = arguments[0]
    for(var $arg in $env){
        eval("var "+$arg+'=$env["'+$arg+'"]')
    }
    var $ix = Math.random().toString(36).substr(2,8)
    var $res = 'res'+$ix
    var $py = $res+"={}\n"
    var indent=0
    for(var $i=2;$i<arguments.length;$i++){
        for(var $j=0;$j<indent;$j++){$py += ' '}
        $py += arguments[$i]+':\n'
        indent += 4
    }
    for(var $j=0;$j<indent;$j++){$py += ' '}
    $py += $res+'.update({'+arguments[1]+'})'
    var $mod_name = 'dc'+$ix
    var $root = $B.py2js($py,$mod_name,$B.line_info)
    $root.caller = $B.line_info
    var $js = $root.to_js()
    $B.vars[$mod_name] = $env
    eval($js)
    return eval($res)
}

$B.$generator = function(func){
    // a cheap and buggy implementation of generators
    // actually executes the function and stores the result of
    // successive yields in a list
    // calls to stdout.write() are captured and indexed by the iteration
    // counter

    var $GeneratorDict = {__class__:__BRYTHON__.$type,
        __name__:'generator'
    }
    $GeneratorDict.__iter__ = function(self){return self}
    $GeneratorDict.__next__ = function(self){
        self.$iter++
        if(self.$iter<self.func.$iter.length){
            if(self.output[self.$iter]!==undefined){
                for(var i=0;i<self.output[self.$iter].length;i++){
                    $B.stdout.write(self.output[self.$iter][i])
                }
            }
            return self.func.$iter[self.$iter]
        }
        else{throw $B.builtins.StopIteration("")}
    }
    $GeneratorDict.__mro__ = [$GeneratorDict,__BRYTHON__.builtins.object.$dict]

    var res = function(){
        func.$iter = []
        
        // cheat ! capture all standard output
        var save_stdout = $B.stdout
        var output = {}
        $B.stdout = $B.JSObject({
            write : function(data){
                var loop_num = func.$iter.length
                if(output[loop_num]===undefined){
                    output[loop_num]=[data]
                }else{
                    output[loop_num].push(data)
                }
            }
        })
        func.apply(this,arguments)
        $B.stdout = save_stdout
    
        var obj = {
            __class__ : $GeneratorDict,
            func:func,
            output:output,
            $iter:-1
        }
        return obj
    }
    res.__repr__ = function(){return "<function "+func.__name__+">"}
    return res
}
$B.$generator.__repr__ = function(){return "<class 'generator'>"}
$B.$generator.__str__ = function(){return "<class 'generator'>"}
$B.$generator.__class__ = __BRYTHON__.$type

$B.set_data  = function(node){
    var ctx_js = node.context.to_js()
    if(ctx_js){ // empty for "global x"
        node.data = ctx_js
        for(var i=0;i<node.children.length;i++){
            $B.set_data(node.children[i])
        }
    }
}

$B.gen_src = function(node, indent){
    var res = node.data
    indent = indent || 0
    if(node.children.length){res += '{'}
    for(var i=0;i<node.children.length;i++){
        res += '\n'
        for(var j=0;j<indent;j++){res += ' '}
        res += $B.gen_src(node.children[i],indent+4)
    }
    if(node.children.length){
        res += '\n'
        for(var j=0;j<indent;j++){res += ' '}
        res += '}'
    }
    return res
}

$B.make_node = function(node){
    var ctx_js = node.context.to_js()
    var is_cond = false, is_except = false
    if(node.is_catch){is_except=true}
    if(node.context.type=='node'){
        var ctx = node.context.tree[0]
        console.log('ctx '+ctx+' type '+ctx.type)
        var ctype = ctx.type
        if((ctype=='condition' && ['if','elif'].indexOf(ctx.token)>-1) ||
            ctype=='except' ||
            (ctype=='single_kw' && ctx.token=='else')){
            is_cond = true
        }
        if(ctype=='except'){is_except=true}
    }else{
        console.log('node '+node+' to js '+ctx_js)
    }
    if(ctx_js){ // empty for "global x"
        var new_node = new $B.genNode(ctx_js)
        new_node.is_cond = is_cond
        new_node.is_except = is_except
        // keep track in the original node
        node.ref = new_node
        for(var i=0;i<node.children.length;i++){
            new_node.addChild($B.make_node(node.children[i]))
        }
    }
    return new_node
}

$B.genNode = function(data, parent){
    _indent = 4
    this.data = data
    this.parent = parent
    this.children = []
    this.has_child = false
    if(parent===undefined){
        this.nodes = {}
        this.num = 0
    }

    this.addChild = function(child){
        this.children.push(child)
        this.has_child = true
        child.parent = this
        child.rank = this.children.length-1
    }

    this.clone = function(){
        var res = new $B.genNode(this.data)
        res.has_child = this.has_child
        return res
    }

    this.clone_tree = function(exit_node){
        var res = new $B.genNode(this.data)
        if(this===exit_node){console.log('exit node, parent is cond '+this.parent.is_cond)}
        if(this===exit_node && this.parent.is_cond){
            // If we have to clone the exit node and its parent was
            // a condition, replace code by 'void(0)'
            res = new $B.genNode('void(0)')
        }
        res.has_child = this.has_child
        for(var i=0;i<this.children.length;i++){
            res.addChild(this.children[i].clone_tree(exit_node))
        }
        return res
    }
    
    this.indent_src = function(indent){
        var res = ''
        for(var i=0;i<indent*_indent;i++){res+=' '}
        return res
    }

    this.src = function(indent){
        indent = indent || 0
        res = this.indent_src(indent)+this.data
        if(this.has_child){res += '{'}
        res += '\n'
        for(var i=0;i<this.children.length;i++){
            res += this.children[i].src(indent+1)
        }
        if(this.has_child){res+='\n'+this.indent_src(indent)+'}\n'}
        return res
    }
    
    this.toString = function(){return '<Node '+this.data+'>'}
    
}

$B.$BRgenerator = function(func, def_id){

    var def_ctx = __BRYTHON__.modules[def_id]
    var func_name = def_ctx.name
    var node = def_ctx.parent.node
    var module = node.module
    
    // identify the node with "try"
    var try_node = node.children[1].children[0]
    
    var newnode = $B.make_node(node)
    
    var newtrynode = try_node.ref
    newtrynode.addChild(new $B.genNode('throw StopIteration("")'))
    
    var __builtins__ = __BRYTHON__.builtins
    for(var $py_builtin in __builtins__){
        eval("var "+$py_builtin+"=__builtins__[$py_builtin]")
    }
    
    var src = newnode.src()+'\n)()'
    eval(src)
    var _next = eval('$'+func_name)
    
    var $BRGeneratorDict = {__class__:__BRYTHON__.$type,
        __name__:'BRgenerator'
    }
    $BRGeneratorDict.__init__ = function(self){
        // save arguments of function call
    }
    $BRGeneratorDict.__iter__ = function(self){return self}
    $BRGeneratorDict.__next__ = function(self){

        console.log('_next\n'+self._next)

        var res = self._next.apply(null, self.args)
        console.log('res '+res)
        if(res===undefined){
            // The function may have ordinary "return" lines, in this case
            // the iteration stops
            throw StopIteration('')
        }
        
        var yielded_value=res[0], rank=res[1]
        // get node where yield was thrown
        var exit_node = def_ctx.yields[rank].parent.node.ref
        
        // create root node of new function
        var root = new $B.genNode(def_ctx.to_js())
        root.addChild(newnode.children[0].clone())
        fnode = newnode.children[1].clone()
        root.addChild(fnode)
        tnode = newnode.children[1].children[0].clone()
        fnode.addChild(tnode)
        
        // add code to restore global variables
        var js = 'var $globals = __BRYTHON__.vars["'+module+'"]'
        tnode.addChild(new $B.genNode(js))
        js = 'for(var $var in $globals){eval("var "+$var+"=$globals[$var]")}'
        tnode.addChild(new $B.genNode(js))

        // add code to restore local variables
        var js = 'var $locals = __BRYTHON__.vars["'+def_id+'"]'
        tnode.addChild(new $B.genNode(js))
        js = 'for(var $var in $locals){eval("var "+$var+"=$locals[$var]")}'
        tnode.addChild(new $B.genNode(js))
        
        var pnode = exit_node.parent

        // add the rest of the block after exit_node
        for(var i=exit_node.rank+1;i<pnode.children.length;i++){
            // add a clone of child : if we appended the child itself,
            // it would change the original function tree
            tnode.addChild(pnode.children[i].clone_tree(exit_node))
        }
        
        // Then add all parents of exit node recursively, only keeping
        // the part that starts at exit node
        while(pnode!==newtrynode){
            var rank = pnode.rank
            while(pnode.parent.children[rank].is_except){rank--}
            for(var i=rank;i<pnode.parent.children.length;i++){
                var child = pnode.parent.children[i]
                tnode.addChild(pnode.parent.children[i].clone_tree(exit_node))
            }
            pnode = pnode.parent
        }
        
        for(var i=1;i<newnode.children[1].children.length;i++){
            fnode.addChild(newnode.children[1].children[i].clone_tree())
        }

        // Set self._next to the code of the function for next iteration
        var next_src = root.src()+'\n)()'
        
        console.log('ready to run next_src\n'+next_src)
        
        try{eval(next_src);console.log('next src done')}
        catch(err){console.log('next src error '+err)}
        
        self._next = eval('$'+func_name)
        
        console.log('return yielded value '+yielded_value)

        // Return the yielded value
        return yielded_value
    }
    $BRGeneratorDict.__mro__ = [$BRGeneratorDict,__BRYTHON__.builtins.object.$dict]

    var res = function(){
        var args = []
        for(var i=0;i<arguments.length;i++){args.push(arguments[i])}

        var obj = {
            __class__ : $BRGeneratorDict,
            args:args,
            func:func,
            _next:_next
        }
        return obj
    }
    res.__repr__ = function(){return "<function "+func.__name__+">"}
    return res
}
$B.$BRgenerator.__repr__ = function(){return "<class 'BRgenerator'>"}
$B.$BRgenerator.__str__ = function(){return "<class 'BRgenerator'>"}
$B.$BRgenerator.__class__ = __BRYTHON__.$type


$B.$ternary = function(env,cond,expr1,expr2){
    // env is the environment to run the ternary expression
    // built-in names must be available to evaluate the expression
    for(var $py_builtin in __BRYTHON__.builtins){eval("var "+$py_builtin+"=__BRYTHON__.builtins[$py_builtin]")}

    for(var attr in env){eval('var '+attr+'=env["'+attr+'"]')}
    var res = 'if (bool('+cond+')){\n'
    res += '    var $res = '+unescape(expr1)+'\n}else{\n'
    res += '    var $res = '+unescape(expr2)+'\n}'
    eval(res)
    return $res
}

$B.$lambda = function($mod,$globals,$locals,$args,$body){
    for(var $attr in $globals){eval('var '+$attr+'=$globals["'+$attr+'"]')}
    for(var $attr in $locals){eval('var '+$attr+'=$locals["'+$attr+'"]')}
    var $res = 'lambda_'+Math.random().toString(36).substr(2,8)
    var $py = 'def '+$res+'('+$args+'):\n'
    $py += '    return '+$body
    var $js = $B.py2js($py,'lambda').to_js()
    eval($js)
    var $res = eval($res)
    $res.__module__ = $mod
    $res.__name__ = '<lambda>'
    return $res
}

// transform native JS types into Brython types
$B.$JS2Py = function(src){
    if(src===null||src===undefined){return __BRYTHON__.builtins.None}
    if(typeof src==='number'){
        if(src%1===0){return src}
        else{return $B.builtins.float(src)}
    }
    var klass = $B.get_class(src)
    if(klass!==undefined){
        if(klass===__BRYTHON__.builtins.list.$dict){
            for(var i=0;i<src.length;i++){
                src[i] = $B.$JS2Py(src[i])
            }
        }
        return src
    }
    if(typeof src=="object"){
        if($B.$isNode(src)){return $B.$DOMNode(src)}
        else if($B.$isEvent(src)){return $B.DOMEvent(src)}
        else if(src.constructor===Array||$B.$isNodeList(src)){
            var res = []
            for(var i=0;i<src.length;i++){
                res.push($B.$JS2Py(src[i]))
            }
            return res
        }
    }
    return $B.JSObject(src)
}

// exceptions
$B.$raise= function(){
    // used for "raise" without specifying an exception
    // if there is an exception in the stack, use it, else throw a simple Exception
    if($B.exception_stack.length>0){throw $last($B.exception_stack)}
    else{throw Error('Exception')}
}

$B.$syntax_err_line = function(module,pos) {
    // map position to line number
    var pos2line = {}
    var lnum=1
    var src = __BRYTHON__.$py_src[module]
    var line_pos = {1:0}
    for(var i=0;i<src.length;i++){
        pos2line[i]=lnum
        if(src.charAt(i)=='\n'){lnum+=1;line_pos[lnum]=i}
    }
    var line_num = pos2line[pos]
    var lines = src.split('\n')

    var lib_module = module
    if(lib_module.substr(0,13)==='__main__,exec'){lib_module='__main__'}

    var line = lines[line_num-1]
    var lpos = pos-line_pos[line_num]
    while(line && line.charAt(0)==' '){
     line=line.substr(1)
     lpos--
    }
    info = '\n    ' //+line+'\n    '
    for(var i=0;i<lpos;i++){info+=' '}
    info += '^'
    return info
}

$B.$SyntaxError = function(module,msg,pos) {
    var exc = $B.builtins.SyntaxError(msg)
    exc.info += $B.$syntax_err_line(module,pos)
    throw exc
}

$B.$IndentationError = function(module,msg,pos) {
    var exc = $B.builtins.IndentationError(msg)
    exc.info += $B.$syntax_err_line(module,pos)
    throw exc
}

// function to remove internal exceptions from stack exposed to programs
$B.$pop_exc=function(){$B.exception_stack.pop()}

// classes used for passing parameters to functions
// keyword arguments : foo(x=1)
$B.$KwDict = {__class__:__BRYTHON__.$type,__name__:'kw'}
$B.$KwDict.__mro__ = [$B.$KwDict,__BRYTHON__.builtins.object.$dict]

$B.$Kw = function(name,value){
    return {__class__:$B.$KwDict,name:name,value:value}
}
$B.$Kw.$dict = $B.$KwDict // for insinstance
$B.$KwDict.$factory = $B.$Kw

// packed tuple : foo(*args)
$B.$ptupleDict = {
    __class__:__BRYTHON__.$type,
    __name__:'packed tuple',
    toString:function(){return 'ptuple'}
}
$B.$ptupleDict.$dict = $B.$ptupleDict

$B.$ptuple = function(arg){
    return {
        __class__:$B.$ptupleDict,
        arg:arg
    }
}
$B.$ptuple.$dict = $B.$ptupleDict
$B.$ptupleDict.$factory = $B.$ptuple

// packed dict : foo(**kw)
$B.$pdictDict = {
    __class__ : __BRYTHON__.$type,
    __name__:'packed dict'
}
$B.$pdictDict.$dict = $B.$pdictDict

$B.$pdict = function(arg){
    return {
        __class__:$B.$pdictDict,
        arg:arg
    }
}
$B.$pdict.$dict = $B.$pdictDict
$B.$pdict.$factory = $B.$pdict

$B.$test_item = function(expr){
    // used to evaluate expressions with "and" or "or"
    // returns a Javascript boolean (true or false) and stores
    // the evaluation in a global variable $test_result
    $B.$test_result = expr
    return __BRYTHON__.builtins.bool(expr)
}

$B.$test_expr = function(){
    // returns the last evaluated item
    return $B.$test_result
}

$B.$is_member = function(item,_set){
    // used for "item in _set"
    var f,_iter
    var getattr = $B.builtins.getattr
    // use __contains__ if defined
    try{f = getattr(_set,"__contains__")}
    catch(err){$B.$pop_exc()}
    if(f){return f(item)}

    // use __iter__ if defined
    try{_iter = $B.builtins.iter(_set)}
    catch(err){$B.$pop_exc()}
    if(_iter){
        while(true){
            try{
                var elt = $B.builtins.next(_iter)
                if(getattr(elt,"__eq__")(item)){return true}
            }catch(err){
                if(err.__name__=="StopIteration"){
                    $B.$pop_exc()
                    return false
                }
                throw err
            }
        }
    }

    // use __getitem__ if defined
    try{f = getattr(_set,"__getitem__")}
    catch(err){
        $B.$pop_exc()
        throw TypeError("argument of type '"+_set.__class__.__name__+"' is not iterable")
    }
    if(f){
        var i = -1
        while(true){
            i++
            try{
                var elt = f(i)
                if(getattr(elt,"__eq__")(item)){return true}
            }catch(err){
                if(err.__name__=='IndexError'){return false}
                else{throw err}
            }
        }
    }
}

// default standard output and error
// can be reset by sys.stdout or sys.stderr
var $io = {__class__:$B.$type,__name__:'io'}
$io.__mro__ = [$io,$B.builtins.object.$dict]

$B.stderr = {
    __class__:$io,
    write:function(data){console.log(data)},
    flush:function(){}
}
$B.stderr_buff = '' // buffer for standard output

$B.stdout = {
    __class__:$io,
    write: function(data){console.log(data)},
    flush:function(){}
}

function pyobject2jsobject(obj) {
    if($B.builtins.isinstance(obj,$B.builtins.dict)){
        var temp = new Object()
        temp.__class__ = 'dict'
        for(var i=0;i<obj.$keys.length;i++){temp[obj.$keys[i]]=obj.$values[i]}
        return temp
    }

    // giving up, just return original object
    return obj
}

function jsobject2pyobject(obj) {
    if(obj === undefined) return $B.builtins.None
    if(obj.__class__ === 'dict'){
       var d = $B.builtins.dict()
       for(var attr in obj){
          if (attr !== '__class__') d.__setitem__(attr, obj[attr])
       }
       return d
    }

    // giving up, just return original object
    return obj
}

// override IDBObjectStore's add, put, etc functions since we need
// to convert python style objects to a js object type

if (window.IDBObjectStore !== undefined) {
    window.IDBObjectStore.prototype._put=window.IDBObjectStore.prototype.put
    window.IDBObjectStore.prototype.put=function(obj, key) {
       var myobj = pyobject2jsobject(obj)
       return window.IDBObjectStore.prototype._put.apply(this, [myobj, key]);
    }
    
    window.IDBObjectStore.prototype._add=window.IDBObjectStore.prototype.add
    window.IDBObjectStore.prototype.add=function(obj, key) {
       var myobj= pyobject2jsobject(obj);
       return window.IDBObjectStore.prototype._add.apply(this, [myobj, key]);
    }
}

if (window.IDBRequest !== undefined) {
    window.IDBRequest.prototype.pyresult=function() {
       return jsobject2pyobject(this.result);
    }
}

// functions to define iterators
$B.$iterator = function(items,klass){
    var res = {
        __class__:klass,
        __iter__:function(){return res},
        __len__:function(){return items.length},
        __next__:function(){
            res.counter++
            if(res.counter<items.length){return items[res.counter]}
            else{throw $B.builtins.StopIteration("StopIteration")}
        },
        __repr__:function(){return "<"+klass.__name__+" object>"},
        counter:-1
    }
    res.__str__ = res.toString = res.__repr__
    return res
}

$B.$iterator_class = function(name){
    var res = {
        __class__:__BRYTHON__.$type,
        __name__:name
    }
    res.__str__ = res.toString = res.__repr__
    res.__mro__ = [res,__BRYTHON__.builtins.object.$dict]
    res.$factory = {__class__:__BRYTHON__.$factory,$dict:res}
    return res
}

// class dict of functions attribute __code__
$B.$CodeDict = {__class__:__BRYTHON__.$type,__name__:'code'}
$B.$CodeDict.__mro__ = [$B.$CodeDict,__BRYTHON__.builtins.object.$dict]


})(__BRYTHON__)

// IE doesn't implement indexOf on Arrays
if(!Array.indexOf){  
Array.prototype.indexOf = function(obj){  
    for(var i=0;i<this.length;i++){  
        if(this[i]==obj){  
            return i;  
        }  
    }  
    return -1;  
 }  
}

// in case console is not defined
try{console}
catch(err){
    //var console = {'log':function(data){void(0)}}
}


