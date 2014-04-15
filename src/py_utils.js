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

$B.make_node = function(top_node, node){
    var ctx_js = node.context.to_js()
    var is_cond = false, is_except = false,is_else=false
    
    if(node.locals_def){
        // the node where local namespace is reset
        ctx_js = 'var $locals = __BRYTHON__.vars["'+top_node.iter_id+'"]'
    }
    
    if(node.is_catch){is_except=true;is_cond=true}
    if(node.context.type=='node'){
        var ctx = node.context.tree[0]
        var ctype = ctx.type
        
        if((ctype=='condition' && ['if','elif'].indexOf(ctx.token)>-1) ||
            ctype=='except' || ctype=='single_kw'){
            is_cond = true
        }
        if(ctype=='condition' && ctx.token=='elif'){is_else=true}
        if(ctype=='single_kw' && ctx.token=='else'){is_else=true}
        if(ctype=='except'||
            (ctype=='single_kw'&&ctx.token=="finally")){is_except=true}
    }
    if(ctx_js){ // empty for "global x"
        var new_node = new $B.genNode(ctx_js)

        if(ctype=='yield'){
            var rank = top_node.yields.length
            var res =  'return ['+ctx_js+', '+rank+']'
            new_node.data = res
            top_node.yields.push(new_node)

        
        }else if(node.is_set_yield_value){
            var js = '$sent'+ctx_js+'=__BRYTHON__.modules["'
            js += top_node.iter_id+'"].sent_value || None;'
            js += 'if($sent'+ctx_js+'.__class__===__BRYTHON__.$GeneratorSendError)'
            js += '{throw $sent'+ctx_js+'.err};'
            js += '$yield_value'+ctx_js+'=$sent'+ctx_js+';'
            js += '__BRYTHON__.modules["'+top_node.iter_id+'"].sent_value=None'
            new_node.data = js
        }else if(ctype=='break'){
            new_node.is_break = true
            // For a "break", loop_num is a reference to the loop that is
            // broken
            new_node.loop_num = node.context.tree[0].loop_ctx.loop_num
        }
        new_node.is_cond = is_cond
        new_node.is_except = is_except
        new_node.is_try = node.is_try
        new_node.is_else = is_else
        new_node.loop_start = node.loop_start
        new_node.is_set_yield_value = node.is_set_yield_value

        for(var i=0;i<node.children.length;i++){
            new_node.addChild($B.make_node(top_node, node.children[i]))
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
        if(child===undefined){console.log('child of '+this+' undefined')}
        this.children.push(child)
        this.has_child = true
        child.parent = this
        child.rank = this.children.length-1
    }

    this.clone = function(){
        var res = new $B.genNode(this.data)
        res.has_child = this.has_child
        res.is_cond = this.is_cond
        res.is_except = this.is_except
        res.is_try = this.is_try
        res.is_else = this.is_else
        res.loop_num = this.loop_num
        res.loop_start = this.loop_start
        return res
    }

    this.clone_tree = function(exit_node, head){

        // Return a clone of the tree starting at node
        // If one the descendant of node is the exit_node, replace the code
        // by "void(0)"

        var res = new $B.genNode(this.data)
        if(this.replaced && !in_loop(this)){
            // cloning a node that was already replaced by 'void(0)'
            res.data = 'void(0)'
        }
        if(this===exit_node && (this.parent.is_cond || !in_loop(this))){
            // If we have to clone the exit node and its parent was
            // a condition, replace code by 'void(0)'
            if(!exit_node.replaced){ // replace only once
                res = new $B.genNode('void(0)')
            }else{
                res = new $B.genNode(exit_node.data)
            }
            exit_node.replaced = true
        }
        if(head && this.is_break){
            res.data = '$no_break'+this.loop_num+'=false;'
            res.data += 'var err = new Error("break");'
            res.data += 'err.__class__=__BRYTHON__.GeneratorBreak;throw err;'
            //console.log('res '+res)
        }
        res.has_child = this.has_child
        res.is_cond = this.is_cond
        res.is_except = this.is_except
        res.is_try = this.is_try
        res.is_else = this.is_else
        res.loop_num = this.loop_num
        res.loop_start = this.loop_start
        res.no_break = true
        for(var i=0;i<this.children.length;i++){
            res.addChild(this.children[i].clone_tree(exit_node, head))
            if(this.children[i].is_break){res.no_break=false}
        }
        return res
    }
    
    this.indent_src = function(indent){
        var res = ''
        for(var i=0;i<indent*_indent;i++){res+=' '}
        return res
    }

    this.src = function(indent){

        // Returns the indented Javascript source code starting at "this"

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

// Object used as the attribute "__class__" of an error thrown in case of a
// "break" inside a loop
$B.GeneratorBreak = {}

// Class for errors sent to an iterator by "throw"
$B.$GeneratorSendError = {}

// Class used for "return" inside a generator function
var $GeneratorReturn = {}
$B.generator_return = function(){return {__class__:$GeneratorReturn}}

function in_loop(node){

    // Tests if node is inside a "for" or "while" loop

    while(node){
        if(node.loop_start!==undefined){return true}
        node = node.parent
    }
    return false
}

var $BRGeneratorDict = {__class__:__BRYTHON__.$type,
    __name__:'generator'
}

$BRGeneratorDict.__iter__ = function(self){return self}

$BRGeneratorDict.__next__ = function(self){

    // builtins will be needed to eval() the function
    var __builtins__ = __BRYTHON__.builtins
    for(var $py_builtin in __builtins__){
        eval("var "+$py_builtin+"=__builtins__[$py_builtin]")
    }
 
    // Inject global variables in local namespace
    for(var $attr in __BRYTHON__.vars[self.module]){
        eval("var "+$attr+"=__BRYTHON__.vars[self.module][$attr]")
    }

    // If generator is a method, we need the $class object
    var $class = eval(self.$class)

    if(self._next===undefined){

        // First iteration : run generator function to initialise the iterator

        var src = self.func_root.src()+'\n)()'
        try{eval(src)}
        catch(err){console.log("cant eval\n"+src+'\n'+err);throw err}
        
        self._next = eval(self.func_name)
    }

    // Increment the iteration counter
    self.num++

    // Cannot resume a generator already running
    if(self.gi_running){
        throw $B.builtins.ValueError("ValueError: generator already executing")
    }
    
    self.gi_running = true

    // Call the function _next to yield a value
    try{
        var res = self._next.apply(null, self.args)
    }finally{
        self.gi_running = false
    }

    if(res[0].__class__==$GeneratorReturn){
        // The function may have ordinary "return" lines, in this case
        // the iteration stops
        self._next = function(){throw StopIteration("after generator return")}
        throw StopIteration('')
    }

    // In the _next function, a "yield" returns a 2-element tuple, the
    // yielded value and a reference to the node where the function exited
    
    var yielded_value=res[0], yield_rank=res[1]
    
    //console.log('--- yielded '+yielded_value)
    
    // Get node where yield was thrown
    var exit_node = self.func_root.yields[yield_rank]
    
    // Attribute "replaced" is used to replace a node only once if it was
    // inside a loop
    exit_node.replaced = false

    // Before returning the yielded value, build the function for the next 
    // iteration
    
    // Create root node of new function and add the initialisation 
    // instructions

    var root = new $B.genNode(self.def_ctx.to_js())
    root.addChild(self.func_root.children[0].clone())
    fnode = self.func_root.children[1].clone()
    root.addChild(fnode)
    trynode = self.func_root.children[1].children[0]
    tnode = trynode.clone()
    fnode.addChild(tnode)
    
    // Add code to restore global variables

    var js = 'var $globals = __BRYTHON__.vars["'+self.module+'"]'
    tnode.addChild(new $B.genNode(js))
    js = 'for(var $var in $globals){eval("var "+$var+"=$globals[$var]")}'
    tnode.addChild(new $B.genNode(js))

    // and code to restore local variables

    var js = 'var $locals = __BRYTHON__.vars["'+self.iter_id+'"]'
    tnode.addChild(new $B.genNode(js))
    js = 'for(var $var in $locals){eval("var "+$var+"=$locals[$var]")}'
    tnode.addChild(new $B.genNode(js))

    // Parent of exit node    
    var pnode = exit_node.parent
    
    // Rest of the block after exit_node
    var rest = []
    var no_break = true
    for(var i=exit_node.rank+1;i<pnode.children.length;i++){
        var clone = pnode.children[i].clone_tree(null,true)
        rest.push(clone)
        if(!clone.no_break){no_break=false}
    }
    
    // If exit_node was in an arborescence of "try" clauses, the "rest" must
    // run in the same arborescence
    var prest = exit_node.parent
    while(prest!==trynode){
        if(prest.is_except){
            var catch_node = prest
            if(prest.parent.is_except){catch_node=prest.parent}
            var rank = catch_node.rank
            while(rank<catch_node.parent.children.length && 
                catch_node.parent.children[rank].is_except){rank++}
            for(var i=rank;i<catch_node.parent.children.length;i++){
                rest.push(catch_node.parent.children[i].clone_tree(null,true))
            }
            prest = catch_node
        }
        else if(prest.is_try){
            var rest2 = prest.clone()
            for(var i=0;i<rest.length;i++){rest2.addChild(rest[i])}
            rest = [rest2]
            for(var i=prest.rank+1;i<prest.parent.children.length;i++){
                rest.push(prest.parent.children[i].clone_tree(null,true))
            }
        }
        prest = prest.parent
    }
    
    // add rest of block to new function
    if(no_break){
        for(var i=0;i<rest.length;i++){tnode.addChild(rest[i])}
    }else{
        // If the rest had a "break", this "break" is converted into raising
        // an exception with __class__ set to GeneratorBreak
        var rest_try = new $B.genNode('try')
        for(var i=0;i<rest.length;i++){rest_try.addChild(rest[i])}
        tnode.addChild(rest_try)
        var catch_test = 'catch(err)'
        catch_test += '{if(err.__class__!==__BRYTHON__.GeneratorBreak)'
        catch_test += '{throw err}}'
        tnode.addChild(new $B.genNode(catch_test))  
    }
    
    //console.log('after yielding '+yielded_value+' and adding rest\n'+tnode.src())
    
    // While the parent of exit_node is in a loop, add it, only keeping the
    // part that starts at exit node
    var last_pnode

    while(pnode!==trynode && in_loop(pnode)){
        var rank = pnode.rank
        // block must start by "try", not "except"
        while(pnode.parent.children[rank].is_except){rank--}
        // block must start by "if", not "elif" or "else"
        while(pnode.parent.children[rank].is_else){rank--}

        for(var i=rank;i<pnode.parent.children.length;i++){
            tnode.addChild(pnode.parent.children[i].clone_tree(exit_node))
        }
        last_pnode = pnode
        pnode = pnode.parent
    }

    // if exit_node was in a loop, add the rest of the block after pnode
    if(pnode!==trynode && in_loop(exit_node)){
        var rank = pnode.rank+1
        while(rank < pnode.parent.children.length){
            var next_node = pnode.parent.children[rank]
            if(next_node.is_else){rank++}
            break
        }
    
        for(var i=rank;i<pnode.parent.children.length;i++){
            tnode.addChild(pnode.parent.children[i].clone_tree())
        }

    }
    
    for(var i=1;i<self.func_root.children[1].children.length;i++){
        fnode.addChild(self.func_root.children[1].children[i].clone_tree())
    }
    
    tnode.addChild(new $B.genNode('throw StopIteration("inserted S.I.")'))

    // Set self._next to the code of the function for next iteration

    self.next_root = root
    var next_src = root.src()+'\n)()'
    try{eval(next_src)}
    catch(err){console.log('error '+err+'\n'+next_src)}
    
    self._next = eval(self.func_name)
    
    //alert('after yielding '+yielded_value+'\n'+self._next)
        
    // Return the yielded value
    return yielded_value

}

$BRGeneratorDict.__mro__ = [$BRGeneratorDict,__BRYTHON__.builtins.object.$dict]

$BRGeneratorDict.close = function(self, value){
    var B = $B.builtins
    self.sent_value = B.GeneratorExit()
    try{
        var res = $BRGeneratorDict.__next__(self)
        if(res!==B.None){
            throw B.RuntimeError("closed generator returned a value")
        }
    }catch(err){
        if($B.is_exc(err, [B.StopIteration, 
            B.GeneratorExit])){return B.None}
        throw err
    }
}

$BRGeneratorDict.send = function(self, value){
    self.sent_value = value
    return $BRGeneratorDict.__next__(self)
}

$BRGeneratorDict.$$throw = function(self, value){
    if($B.builtins.isinstance(value,$B.builtins.type)){value=value()}
    self.sent_value = {__class__:$B.$GeneratorSendError,err:value}
    return $BRGeneratorDict.__next__(self)
}


$B.$BRgenerator = function(func, def_id, $class){

    var def_ctx = __BRYTHON__.modules[def_id]
    var counter = 0 // used to identify the function run for each next()

    var func_name = '$'+def_ctx.name // name of the function run for each next()
    if($class!==undefined){func_name = '$class.'+func_name}

    var def_node = def_ctx.parent.node
    var module = def_node.module
    
    // identify the node with "try"

    var try_node = def_node.children[1].children[0]


    var res = function(){
        var args = []
        for(var i=0;i<arguments.length;i++){args.push(arguments[i])}

        // create an id for the iterator
        var iter_id = def_id+'-'+counter
        counter++
        // initialise its namespace
        __BRYTHON__.vars[iter_id] = {}

        // Create a tree structure based on the generator tree
        // iter_id is used in the node where the iterator resets local
        // namespace
        var func_root = new $B.genNode(def_node.context.to_js())
        func_root.yields = []
        func_root.loop_ends = {}
        func_root.iter_id = iter_id
        for(var i=0;i<def_node.children.length;i++){
            func_root.addChild($B.make_node(func_root, def_node.children[i]))
        }
        var trynode = func_root.children[1].children[0]
        trynode.addChild(new $B.genNode('throw StopIteration("")'))

        var obj = {
            __class__ : $BRGeneratorDict,
            args:args,
            $class:$class,
            def_ctx:def_ctx,
            func:func,
            func_name:func_name,
            func_root:func_root,
            module:module,
            trynode:trynode,
            next_root:func_root,
            gi_running:false,
            iter_id:iter_id,
            num:0
        }
        
        __BRYTHON__.modules[iter_id] = obj
        
        return obj
    }
    res.__repr__ = function(){return "<function "+func.__name__+">"}
    return res
}
$B.$BRgenerator.__repr__ = function(){return "<class 'generator'>"}
$B.$BRgenerator.__str__ = function(){return "<class 'generator'>"}
$B.$BRgenerator.__class__ = __BRYTHON__.$type

$B.$ternary = function(env,cond,expr1,expr2){
    // env is the environment to run the ternary expression
    // built-in names must be available to evaluate the expression
    for(var $py_builtin in __BRYTHON__.builtins){
        eval("var "+$py_builtin+"=__BRYTHON__.builtins[$py_builtin]")
    }

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
    // Used for "raise" without specifying an exception
    // If there is an exception in the stack, use it, else throw a simple Exception
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

$B.stdin = {
    __class__:$io,
    //fix me
    read: function(size){return ''}
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

$B.set_line = function(line_num,module_name){
    $B.line_info = [line_num, module_name]
    return $B.builtins.None
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




