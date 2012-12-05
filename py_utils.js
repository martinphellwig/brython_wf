// transform native JS types into Brython types
function $JS2Py(src){
    if($isinstance(src,list(str,int,float,list,dict,set))){return src}
    if(src===null){return None}
    if(src===false){return False}
    if(src===true){return True}
    htmlelt_pattern = new RegExp(/\[object HTML(.*)Element\]/)
    if(typeof src=="string"){
        return str(src)
    } else if(typeof src=="number") {
        if(src.toString().search(/\./)==-1){
            return int(src)
        } else {
            return float(src)
        }
    } else if(typeof src=="object"){
        if(src.constructor===Array){return new $ListClass(src)}
        else if(src.tagName!==undefined && src.nodeName!==undefined){return $DomElement(src)}
        else{
            try{if(src.constructor==DragEvent){return new $MouseEvent(src)}}
            catch(err){void(0)}
            try{if(src.constructor==MouseEvent){return new $MouseEvent(src)}}
            catch(err){void(0)}
            try{if(src.constructor==KeyboardEvent){return new $DomWrapper(src)}}
            catch(err){void(0)}
            if(src.__class__!==undefined){return src}
            return new $DomObject(src)
        }
    }else{return src}
}

function $assign(expr){
    // used for simple assignments : target = expr
    // if expr is a simple built-in type, return a clone, *not* the same object !
    // this is to avoid bad side effects like "a=0 ; x=a ; x++"
    // causing a to become 1, since a and x are the same object
    if($isinstance(expr,int)){return int(expr.value)}
    else if($isinstance(expr,float)){return float(expr.value)}
    else if($isinstance(expr,str)){return str(expr.value)}
    else{return expr}
}

function $test_item(expr){
    // used to evaluate expressions with "and" or "or"
    // returns a Javascript boolean (true or false) and stores
    // the evaluation in a global variable $test_result
    document.$test_result = expr
    return $bool(expr)
}

function $test_expr(){
    // returns the last evaluated item
    return document.$test_result
}

// define a function __eq__ for functions to allow test on Python classes
// such as object.__class__ == SomeClass
Function.prototype.__eq__ = function(other){
    if(typeof other !== 'function'){return False}
    return $bool_conv((other+'')===(this+''))
}
Function.prototype.__class__ = Function

Array.prototype.match = function(other){
    // return true if array and other have the same first items
    var $i = 0
    while($i<this.length && $i<other.length){
        if(this[$i]!==other[$i]){return false}
        $i++
    }
    return true
}

function $List2Dict(){
    var res = {}
    var i=0
    if(arguments.length==1 && arguments[0].constructor==Array){
        // arguments passed as a list
        for(i=0;i<arguments[0].length;i++){
            res[arguments[0][i]]=0
        }
    } else {
        for(i=0;i<arguments.length;i++){
            res[arguments[i]]=0
        }
    }
    return res
}

function $last(item){
    if(typeof item=="string"){return item.charAt(item.length-1)}
    else if(typeof item=="object"){return item[item.length-1]}
}

// classes to manipulate the tokens generated by py_tokenizer

function Atom(stack){
    this.parent = stack
    this.type = null
    this.stack = function(){
        return new Stack(this.parent.list.slice(this.start,this.end+1))
    }
    this.list = function(){
        return this.parent.list.slice(this.start,this.end+1)
    }
    this.to_js = function(){return this.stack().to_js()}
}

function Stack(stack_list){
    this.list = stack_list
}    
Stack.prototype.find_next = function(){
    // arguments are position to search from, researched type and
    // optional researched values
    // return position of next matching stack item or null
    var pos = arguments[0]
    var _type = arguments[1]
    var values = null
    if(arguments.length>2){
        values = {}
        for(i=2;i<arguments.length;i++){values[arguments[i]]=0}
    }
    for(i=pos;i<this.list.length;i++){
        if(this.list[i][0]==_type){
            if(values==null){
                return i
            } else if(this.list[i][1] in values){
                return i
            }
        }
    }
    return null
}

Stack.prototype.find_next_at_same_level = function(){
    // same as find_next but skips enclosures to find the token
    // at the same level as the one where search starts
    var pos = arguments[0]
    var _type = arguments[1]
    var values = null
    if(arguments.length>2){
        values = {}
        for(i=2;i<arguments.length;i++){values[arguments[i]]=0}
    }
    while(true){
        if(this.list[pos][0]==_type){
            if(values==null){return pos}
            else if(this.list[pos][1] in values){return pos}
        }else if(this.list[pos][0]=="bracket" 
            && this.list[pos][1] in $OpeningBrackets){
            // opening bracket
            pos = this.find_next_matching(pos)
        } 
        pos++
        if (pos>this.list.length-1){return null}
    }
}
    
Stack.prototype.find_previous = function(){
    // same as find_next but search backwards from pos
    var pos = arguments[0]
    var _type = arguments[1]
    var values = null
    if(arguments.length>2){
        values = {}
        for(i=2;i<arguments.length;i++){values[arguments[i]]=0}
    }
    for(i=pos;i>=0;i--){
        if(this.list[i][0]==_type){
            if(values==null){
                return i
            } else if(this.list[i][1] in values){
                return i
            }
        }
    }
    return null
}

Stack.prototype.find_next_matching = function(pos){
    // find position of stack item closing the bracket 
    // at specified position in the tokens stack
    
    var brackets = {"(":")","[":"]","{":"}"}
    var _item = this.list[pos]
    if(_item[0]=="bracket"){
        opening = _item[1]
        count = 0
        for(i=pos;i<this.list.length;i++){
            if(this.list[i][0]=="bracket"){
                var value = this.list[i][1]
                if(value==opening){count += 1}
                else if(value==brackets[opening]){
                    count -= 1
                    if(count==0){return i}
                }
            }
        }
    }
    return null
}

Stack.prototype.find_previous_matching = function(pos){
    // find position of stack item closing the bracket 
    // at specified position in the tokens stack
    
    var brackets = {")":"(","]":"[","}":"{"}
    var item = this.list[pos]
    var i=0
    if(item[0]=="bracket"){
        closing = item[1]
        count = 0
        for(i=pos;i>=0;i--){
            if(this.list[i][0]=="bracket"){
                var value = this.list[i][1]
                if(value==closing){count += 1;}
                else if(value==brackets[closing]){
                    count -= 1
                    if(count==0){return i}
                }
            }
        }
    }
    return null
}
    
Stack.prototype.get_atoms = function(){
    var pos = 0
    var nb = 0
    var atoms = []
    while(pos<this.list.length){
        atom = this.atom_at(pos,true)
        atoms.push(atom)
        pos += atom.end-atom.start
    }
    return atoms
}

Stack.prototype.raw_atom_at = function(pos){
    atom = new Atom(this)
    atom.valid_type = true
    atom.start = pos
    if(pos>this.list.length-1){
        atom.valid_type = false
        atom.end = pos
        return atom
    }
    var dict1 = $List2Dict('id','assign_id','str','int','float')
    var $valid_kws=$List2Dict("True","False","None")
    if(this.list[pos][0] in dict1 || 
        (this.list[pos][0]=="keyword" && this.list[pos][1] in $valid_kws) ||
        (this.list[pos][0]=="bracket" && 
            (this.list[pos][1]=="(" || this.list[pos][1]=='['))){
        atom.type = this.list[pos][0]
        end = pos
        if(this.list[pos][0]=='bracket'){
            atom.type="tuple"
            end=this.find_next_matching(pos)
        }
        while(end<this.list.length-1){
            var item = this.list[end+1]
            if(item[0] in dict1 && atom.type=="qualified_id"){
                end += 1
            } else if(item[0]=="point"||item[0]=="qualifier"){
                atom.type = "qualified_id"
                end += 1
            } else if(item[0]=="bracket" && item[1]=='('){
                atom.type = "function_call"
                end = this.find_next_matching(end+1)
            } else if(item[0]=="bracket" && item[1]=='['){
                atom.type = "slicing"
                end = this.find_next_matching(end+1)
            } else {
                break
            }
        }
        atom.end = end
        return atom
    } else if(this.list[pos][0]=="bracket" && 
        (this.list[pos][1]=="(" || this.list[pos][1]=='[')){
        atom.type = "tuple"
        atom.end = this.find_next_matching(pos)
        return atom
    } else {
        atom.type = this.list[pos][0]
        atom.valid_type = false
        atom.end = pos
        return atom
    }
}

Stack.prototype.tuple_at = function(pos){
    var first = this.raw_atom_at(pos)
    var items=[first]
    while(true){
        var last = items[items.length-1]
        if(last.end+1>=this.list.length){break}
        var delim = this.list[last.end+1]
        if(delim[0]=='delimiter' && delim[1]==','){
            var next=this.raw_atom_at(last.end+2)
            if(next !==null && next.valid_type){items.push(next)}
            else{break}
        }else{break}
    }
    return items
}

Stack.prototype.atom_at = function(pos,implicit_tuple){
    if(!implicit_tuple){return this.raw_atom_at(pos)}
    else{
        var items = this.tuple_at(pos) // array of raw atoms
        atom = new Atom(this)
        if(items.length==1){return items[0]}
        else{
            atom.type="tuple"
            atom.start = items[0].start
            atom.end = items[items.length-1].end
            return atom
        }
    }
}

Stack.prototype.atom_before = function(pos,implicit_tuple){
        // return the atom before specified position
        atom = new Atom(this)
        if(pos==0){return null}
        atom.end = pos-1
        atom.start = pos-1
        // find position before atom
        var atom_parts=$List2Dict("id","assign_id","str",'int','float',"point","qualifier")
        var $valid_kws=$List2Dict("True","False","None")
        var closing = $List2Dict(')',']')
        while(true){
            if(atom.start==-1){break}
            var item = this.list[atom.start]
            if(item[0] in atom_parts){atom.start--;continue}
            else if(item[0]=="keyword" && item[1] in $valid_kws){
                atom.start--;continue
            }
            else if(item[0]=="bracket" && item[1] in closing){
                atom.start = this.find_previous_matching(atom.start)-1
                continue
            }
            else if(implicit_tuple && item[0]=="delimiter"
                    && item[1]==","){atom.start--;continue}
            break
        }
        atom.start++
        return this.atom_at(atom.start,implicit_tuple)
    }
    
Stack.prototype.indent = function(pos){
    // return indentation of the line of the item at specified position
    var nl = this.find_previous(pos,"newline")
    if(nl==null){nl=0}
    if(nl<this.list.length-1 && this.list[nl+1][0]=="indent"){
        return this.list[nl+1][1]
    }else{return 0}    
}

Stack.prototype.next_at_same_indent = function(pos){
    var indent = this.indent(pos)
    var nxt_pos = this.find_next(pos,"newline")
    while(true){
        if(nxt_pos===null){return null}
        if(nxt_pos>=this.list.length-1){return null}
        else if(this.list[nxt_pos+1][0]=="indent"){
            var nxt_indent = this.list[nxt_pos+1][1]
            nxt_pos++
        }else{var nxt_indent=0}
        if(nxt_indent==indent){return nxt_pos+1}
        else if(nxt_indent<indent){return null}
        nxt_pos = this.find_next(nxt_pos+1,"newline")
    }    
}    

Stack.prototype.split = function(delimiter){
    // split stack with specified delimiter
    var items = new Array(), count = 0,pos = 0,start = 0
    while(pos<this.list.length){
        pos = this.find_next_at_same_level(pos,'delimiter',delimiter)
        if(pos==null){pos=this.list.length;break}
        var s = new Stack(this.list.slice(start,pos))
        s.start = start
        s.end = pos-1
        items.push(s)
        start = pos+1
        pos++
    }
    var s = new Stack(this.list.slice(start,pos))
    s.start = start
    s.end = pos-1
    if(s.end<start){s.end=start}
    items.push(s)
    return items
}

Stack.prototype.find_block = function(pos){
        var item = this.list[pos]
        var closing_pos = this.find_next_at_same_level(pos+1,'delimiter',':')
        if(closing_pos!=null){
            // find block end : the newline before the first indentation equal
            // to the indentation of the line beginning with the keyword
            var kw_indent = 0
            var line_start = this.find_previous(pos,"newline")
            if(line_start==null){kw_indent=0}
            else if(this.list[line_start+1][0]=="indent"){
                kw_indent = this.list[line_start+1][1]
            }
            var stop = closing_pos
            while(true){
                nl = this.find_next(stop,"newline")
                if(nl==null){stop = this.list.length-1;break}
                if(nl<this.list.length-1){
                    if(this.list[nl+1][0]=="indent"){
                        if(this.list[nl+1][1]<=kw_indent){
                            stop = nl
                            break
                        }
                    } else { // no indent
                        stop = nl
                        break
                    }
                } else {
                    stop = this.list.length-1
                    break
                }
                stop = nl+1
            }
            return [closing_pos,stop,kw_indent]
        }else{return null}
    }

Stack.prototype.to_js = function(){
    // build Javascript code
    var i=0,j=0,x=null
    var js = "",scope_stack=[]
    var t2 = $List2Dict('id','assign_id','str','int','float','keyword','code')

    for(i=0;i<this.list.length;i++){
        x = this.list[i]
        if(x[0]=="indent") {
            for(j=0;j<x[1];j++){js += " "}
        } else if(x[0] in t2) {
            if(x[0]=='str'){js += 'str('+x[1].replace(/\n/gm,'\\n')+')'}
            else if(x[0]=='int'){js += 'int('+x[1]+')'}
            else if(x[0]=='float'){js += 'float('+x[1]+')'}
            else{js += x[1]}
            if(i<this.list.length-1 && this.list[i+1][0] != "bracket"
                && this.list[i+1][0]!="point" && this.list[i+1][0]!="delimiter"){
                js += " "
            }
        } else {
            if(x[0]=="newline"){js += '\r\n'}
            else{js += x[1]}
        }
    }
    return js
}

Stack.prototype.dump = function(){
    ch = ''
    for(var i=0;i<this.list.length;i++){
        _item = this.list[i]
        ch += i+' '+_item[0]+' '+_item[1]+'\n'
    }
    alert(ch)
}



