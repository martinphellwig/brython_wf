;(function($B){

var __builtins__ = $B.builtins
for(var $py_builtin in __builtins__){eval("var "+$py_builtin+"=__builtins__[$py_builtin]")}
var $ObjectDict = object.$dict

var $StringDict = {__class__:$B.$type,
    __name__:'str',
    $native:true
}

$StringDict.__add__ = function(self,other){
    if(!(typeof other==="string")){
        try{return getattr(other,'__radd__')(self)}
        catch(err){throw __builtins__.TypeError(
            "Can't convert "+other.__class__.__name__+" to str implicitely")}
    }else{
        return self+other
    }
}

$StringDict.__contains__ = function(self,item){
    if(!(typeof item==="string")){throw __builtins__.TypeError(
         "'in <string>' requires string as left operand, not "+item.__class__)}
    var nbcar = item.length
    if(nbcar==0){return self.length==0}
    for(var i=0;i<self.length;i++){
        if(self.substr(i,nbcar)==item){return True}
    }
    return False
}

$StringDict.__delitem__ = function(){
    throw __builtins__.TypeError("'str' object doesn't support item deletion")
}

$StringDict.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "str"
        return self===str
    }
    return other===self.valueOf()
}

$StringDict.__getitem__ = function(self,arg){
    var i
    if(isinstance(arg,__builtins__.int)){
        var pos = arg
        if(arg<0){pos=self.length+pos}
        if(pos>=0 && pos<self.length){return self.charAt(pos)}
        else{throw __builtins__.IndexError('string index out of range')}
    } else if(isinstance(arg,slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? getattr(self,'__len__')() : arg.stop
        }else{
            var start = arg.start===None ? getattr(self,'__len__')()-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0){start=self.length+start}
        if(stop<0){stop=self.length+stop}
        var res = '',i=null
        if(step>0){
            if(stop<=start){return ''}
            else {
                for(i=start;i<stop;i+=step){
                    res += self.charAt(i)
                }
            }
        } else {
            if(stop>=start){return ''}
            else {
                for(i=start;i>=stop;i+=step){
                    res += self.charAt(i)
                }
            }
        }            
        return res
    } else if(isinstance(arg,bool)){
        return self.__getitem__(__builtins__.int(arg))
    }
}

$StringDict.__hash__ = function(self) {
  //http://stackoverflow.com/questions/2909106/python-whats-a-correct-and-good-way-to-implement-hash
  // this implementation for strings maybe good enough for us..

  var hash=1;
  for(var i=0; i < self.length; i++) {
      hash=(101*hash + self.charCodeAt(i)) & 0xFFFFFFFF;
  }

  return hash;
}

$StringDict.__init__ = function(self,arg){
    self.valueOf = function(){return arg}
    self.toString = function(){return arg}
}

var $str_iterator = $B.$iterator_class('str_iterator')
$StringDict.__iter__ = function(self){
    var items = self.split('') // list of all characters in string
    return $B.$iterator(items,$str_iterator)
}

$StringDict.__len__ = function(self){return self.length}

var $legacy_format=$StringDict.__mod__ = function(self,args){
    // string formatting (old style with %)
    var ph = [] // placeholders for replacements

    function format(s){
        //console.log('format:', s)
        var conv_flags = '([#\\+\\- 0])*'
        //var conv_types = '[diouxXeEfFgGcrsa%]'
        //var re = new RegExp('\\%(\\(.+?\\))*'+conv_flags+'(\\*|\\d*)(\\.\\*|\\.\\d*)*(h|l|L)*('+conv_types+'){1}')
        var re = new RegExp('\\%(\\(.+?\\))*'+conv_flags+'(\\*|\\d*)(\\.\\*|\\.\\d*)*(h|l|L)*(.){1}')
        var res = re.exec(s)
        this.is_format = true
        if(!res){this.is_format = false;return}
        this.src = res[0]
        if(res[1]){this.mapping_key=str(res[1].substr(1,res[1].length-2))}
        else{this.mapping_key=null}
        this.flag = res[2]
        this.min_width = res[3]
        this.precision = res[4]
        this.length_modifier = res[5]
        this.type = res[6]
        
        this._number_check=function(s) {
            if(!isinstance(s,[__builtins__.int,__builtins__.float])){
              if (s.__class__ !== undefined) {
                 throw __builtins__.TypeError("%"+this.type+" format: a number is required, not " + str(s.__class__))
              } else if (typeof(s) === 'string') {
                 throw __builtins__.TypeError("%"+this.type+" format: a number is required, not str")
              } else {
                 throw __builtins__.TypeError("%"+this.type+" format: a number is required, not 'unknown type'")
              }
            }
        }
    
        this.toString = function(){
            var res = 'type '+this.type+' key '+this.mapping_key+' min width '+this.min_width
            res += ' precision '+this.precision
            return res
        }
        this.format = function(src){
            if(this.mapping_key!==null){
                if(!isinstance(src,__builtins__.dict)){throw __builtins__.TypeError("format requires a mapping")}
                src=getattr(src,'__getitem__')(this.mapping_key)
            }
          
            if(this.type=="s"){
                var res = str(src)
                if(this.precision){res = res.substr(0,parseInt(this.precision.substr(1)))}
                return res
            }else if(this.type=="r"){
                var res = repr(src)
                if(this.precision){res = res.substr(0,parseInt(this.precision.substr(1)))}
                return res
            }else if(this.type=="a"){
                var res = ascii(src)
                if(this.precision){res = res.substr(0,parseInt(this.precision.substr(1)))}
                return res
            }else if(this.type=="g" || this.type=="G"){
                if(!isinstance(src,[__builtins__.int,__builtins__.float])){
                   throw __builtins__.TypeError("a float is required")}
                var prec = -4
                if(this.precision){prec=parseInt(this.precision.substr(1))}
                var res = parseFloat(src).toExponential()
                var elts = res.split('e')
                if((this.precision && eval(elts[1])>prec)||
                    (!this.precision && eval(elts[1])<-4)){
                    this.type === 'g' ? this.type='e' : this.type='E'
                    // The precision determines the number of significant digits 
                    // before and after the decimal point and defaults to 6
                    var prec = 6
                    if(this.precision){prec=parseInt(this.precision.substr(1))-1}
                    var res = parseFloat(src).toExponential(prec)
                    var elts = res.split('e')
                    var res = elts[0]+this.type+elts[1].charAt(0)
                    if(elts[1].length===2){res += '0'}
                    return res+elts[1].substr(1)
                }else{
                    var prec = 2
                    if(this.flag=='#'){
                      if (this.precision === undefined) {
                         this.precision='.5'  // use a default of 6
                      } else {
                        prec=parseInt(this.precision.substr(1))-1
                        var elts = str(src).split('.')
                        this.precision = '.'+(prec-elts[0].length)
                      }
                    } else {
                      this.precision = 0
                    }

                    this.type="f"
                    return this.format(src)
                }
            }else if(this.type=="e" || this.type=="E"){
                this._number_check(src)
                //if(!isinstance(src,[__builtins__.int,__builtins__.float])){
                //    throw __builtins__.TypeError(
                //        "%"+this.type+" format: a number is required, not "+str(src.__class__))}
                var prec = 6
                if(this.precision){prec=parseInt(this.precision.substr(1))}
                var res = parseFloat(src).toExponential(prec)
                var elts = res.split('e')
                var res = elts[0]+this.type+elts[1].charAt(0)
                if(elts[1].length===2){res += '0'}
                return res+elts[1].substr(1)
            }else if(this.type=="x" || this.type=="X"){ // hex
                this._number_check(src)
                //if(!isinstance(src,[__builtins__.int,__builtins__.float])){throw __builtins__.TypeError(
                //    "%"+this.type+" format: a number is required, not "+str(src.__class__))}
                var num = src
                res = src.toString(16)

                var pad=' '
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){pad='+';res = '+'+res}

                if(this.precision){
                    var width=this.precision.substr(1)
                    if(this.flag==='#'){pad="0"}
                    //if(this.flag==='0'){pad="0"}
                    while(res.length<width){res=pad+res}
                }

                if(this.flag==='#'){
                    if(this.type==='x'){res = '0x'+res}
                    else{res = '0X'+res}
                }
                return res
            }else if(this.type=="i" || this.type=="d"){
                //this._number_check(src)
                
                var num = __builtins__.int(src)
                num=num.toPrecision()
                res = num+''
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){res = '+'+res}

                if(this.precision){   //for integers, precision is actually the width
                    var flag=this.precision[0]
                    var pad = ' '
                    if(flag==='0' || flag==='.'){pad="0"}
                    var width=parseInt(this.precision.substr(1))
                    while(res.length<width){res=pad+res}
                }
                return res
            }else if(this.type=="f" || this.type=="F"){
                this._number_check(src)
                //if(!isinstance(src,[__builtins__.int,__builtins__.float])){throw __builtins__.TypeError(
                //    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = parseFloat(src)
                // set default precision of 6 if precision is not specified
                if(this.precision === undefined) this.precision=".6" 
                if(this.precision){num = num.toFixed(parseInt(this.precision.substr(1)))}
                res = num+''
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){res = '+'+res}
                if(this.min_width){
                    var pad = ' '
                    if(this.flag==='0'){pad="0"}
                    while(res.length<parseInt(this.min_width)){res=pad+res}
                }
                return res
            }else if(this.type=='c'){
                if(isinstance(src,str) && str.length==1){return src}
                else if(isinstance(src,__builtins__.int) && src>0 && src<256){return String.fromCharCode(src)}
                else{throw __builtins__.TypeError('%c requires __builtins__.int or char')}
            }else if(this.type=='o'){
                res = src.toString(8)
                if(this.flag==='#') return '0o' + res
                return res
            }else if (this.type=='b') {
                res = src.toString(2)
                if(this.flag==='#') return '0b' + res
                return res
            }else {
                //if (hasattr(src, '__format__')) {
                //   console.log(this.type)
                //   //console.log(getattr(src, '__format__')(this.type))
                //   return getattr(src, '__format__')(this.type)
                //}
                // consider this 'type' invalid
                var _msg="unsupported format character '" + this.type
                    _msg+= "' (0x" + this.type.charCodeAt(0).toString(16) + ") at index "
                    _msg+= (self.valueOf().indexOf('%' + this.type)+1)
                console.log(_msg) 
                throw __builtins__.ValueError(_msg) 
            }
        }
    }  // end $legacy_format

    
    // elts is an Array ; items of odd rank are string format objects
    var elts = []
    var pos = 0, start = 0, nb_repl = 0, is_mapping = null
    var val = self.valueOf()
    while(pos<val.length){
        if(val.charAt(pos)=='%'){
            var f = new format(val.substr(pos))
            if(f.is_format){
                if(f.type!=="%"){
                    elts.push(val.substring(start,pos))
                    elts.push(f)
                    start = pos+f.src.length
                    pos = start
                    nb_repl++
                    if(is_mapping===null){is_mapping=f.mapping_key!==null}
                    else if(is_mapping!==(f.mapping_key!==null)){
                        // can't mix mapping keys with non-mapping
                        console.log(f+' not mapping')
                        throw __builtins__.TypeError('format required a mapping')
                    }
                }else{ // form %%
                    pos++;pos++
                }
            }else{pos++}
        }else{pos++}
    }
    // check for invalid format string  "no format"
    if(elts.length == 0) {
        throw __builtins__.TypeError('not all arguments converted during string formatting')
    }
    elts.push(val.substr(start))
    if(!isinstance(args,__builtins__.tuple)){
        if(args.__class__==__builtins__.dict.$dict && is_mapping){
            // convert all formats with the dictionary
            for(var i=1;i<elts.length;i+=2){
                elts[i]=elts[i].format(args)
            }
        }
        else if(nb_repl>1){throw __builtins__.TypeError('not enough arguments for format string')}
        else{elts[1]=elts[1].format(args)}
    }else{
        if(nb_repl==args.length){
            for(var i=0;i<args.length;i++){
                var fmt = elts[1+2*i]
                elts[1+2*i]=fmt.format(args[i])
            }
        }else if(nb_repl<args.length){throw __builtins__.TypeError(
            "not all arguments converted during string formatting")
        }else{throw __builtins__.TypeError('not enough arguments for format string')}
    }
    var res = ''
    for(var i=0;i<elts.length;i++){res+=elts[i]}
    // finally, replace %% by %
    res = res.replace(/%%/g,'%')
    return res
}


$StringDict.__mro__ = [$StringDict,$ObjectDict]

$StringDict.__mul__ = function(self,other){
    if(!isinstance(other,__builtins__.int)){throw __builtins__.TypeError(
        "Can't multiply sequence by non-__builtins__.int of type '"+str(other.__class__)+"'")}
    $res = ''
    for(var i=0;i<other;i++){$res+=self.valueOf()}
    return $res
}

$StringDict.__ne__ = function(self,other){return other!==self.valueOf()}

$StringDict.__or__ = $ObjectDict.__or__

$StringDict.__repr__ = function(self){
    if(self===undefined){return "<class 'str'>"}
    var qesc = new RegExp("'","g") // to escape single quote
    var res = self.replace(/\n/g,'\\\\n')
    res = "'"+res.replace(qesc,"\\'")+"'"
    //console.log(res)
    return res
}

$StringDict.__setattr__ = function(self,attr,value){setattr(self,attr,value)}

$StringDict.__setitem__ = function(self,attr,value){
    throw __builtins__.TypeError("'str' object does not support item assignment")
}
$StringDict.__str__ = function(self){
    if(self===undefined){return "<class 'str'>"}
    else{return self.toString()}
}
$StringDict.toString = function(){return 'string!'}

// generate comparison methods
var $comp_func = function(self,other){
    if(typeof other !=="string"){throw __builtins__.TypeError(
        "unorderable types: 'str' > "+other.__class__+"()")}
    return self > other
}
$comp_func += '' // source code
var $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for(var $op in $comps){
    eval("$StringDict.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// unsupported operations
var $notimplemented = function(self,other){
    throw NotImplementedError("OPERATOR not implemented for class str")
}
$notimplemented += '' // coerce to string
for(var $op in $B.$operators){
    var $opfunc = '__'+$B.$operators[$op]+'__'
    if(!($opfunc in str)){
        //eval('$StringDict.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
    }
}

$StringDict.capitalize = function(self){
    if(self.length==0){return ''}
    return self.charAt(0).toUpperCase()+self.substr(1).toLowerCase()
}

$StringDict.casefold = function(self) {
  throw NotImplementedError("function casefold not implemented yet");
}

$StringDict.center = function(self,width,fillchar){
    if(fillchar===undefined){fillchar=' '}else{fillchar=fillchar}
    if(width<=self.length){return self}
    else{
        var pad = parseInt((width-self.length)/2)
        var res = Array(pad+1).join(fillchar) // is this statement faster than the for loop below?
        //for(var i=0;i<pad;i++){res+=fillchar}
        res = res + self + res
        if(res.length<width){res += fillchar}
        return res
    }
}

$StringDict.count = function(self,elt){
    if(!(typeof elt==="string")){throw __builtins__.TypeError(
        "Can't convert '"+elt.__class__.__name__+"' object to str implicitly")}
    //needs to be non overlapping occurrences of substring in string.
    var n=0, pos=0
    while(true){
        pos=self.indexOf(elt,pos)
        if(pos>=0){ n++; pos+=elt.length} else break;
    }
    return n
}

$StringDict.decode = function(self) {
  return self // to fix
}

$StringDict.encode = function(self) {
  return self // to fix
}

$StringDict.endswith = function(self){
    // Return True if the string ends with the specified suffix, otherwise 
    // return False. suffix can also be a tuple of suffixes to look for. 
    // With optional start, test beginning at that position. With optional 
    // end, stop comparing at that position.
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var start=null,end=null
    var $ns=$B.$MakeArgs("$StringDict.endswith",args,['suffix'],
        ['start','end'],null,null)
    var suffixes = $ns['suffix']
    if(!isinstance(suffixes,__builtins__.tuple)){suffixes=[suffixes]}
    start = $ns['start'] || start
    end = $ns['end'] || self.length-1
    var s = self.substr(start,end+1)
    for(var i=0;i<suffixes.length;i++){
        suffix = suffixes[i]
        if(suffix.length<=s.length &&
            s.substr(s.length-suffix.length)==suffix){return True}
    }
    return False
}

$StringDict.expandtabs = function(self) {
  throw NotImplementedError("function expandtabs not implemented yet");
}

$StringDict.find = function(self){
    // Return the lowest index in the string where substring sub is found, 
    // such that sub is contained in the slice s[start:end]. Optional 
    // arguments start and end are interpreted as in slice notation. 
    // Return -1 if sub is not found.
    var start=0,end=self.length
    var $ns=$B.$MakeArgs("$StringDict.find",arguments,['self','sub'],
        ['start','end'],null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
    if(!isinstance(sub,str)){throw __builtins__.TypeError(
        "Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
    if(!isinstance(start,__builtins__.int)||!isinstance(end,__builtins__.int)){throw __builtins__.TypeError(
        "slice indices must be integers or None or have an __index__ method")}
    var s = self.substring(start,end)
    var escaped = ['[','.','*','+','?','|','(',')','$','^']
    var esc_sub = ''
    for(var i=0;i<sub.length;i++){
        if(escaped.indexOf(sub.charAt(i))>-1){esc_sub += '\\'}
        esc_sub += sub.charAt(i)
    }
    var res = s.search(esc_sub)
    if(res==-1){return -1}
    else{return start+res}
}

var $FormattableString=function(format_string) {
    // inspired from 
    // https://raw.github.com/florentx/stringformat/master/stringformat.py
    this.format_string=format_string

    this._prepare = function() {
       //console.log('prepare')
       var match = arguments[0]
       //console.log('match1', match)

       var p1 = '' + arguments[2]

       if (match == '%') return '%%'
       if (match.substring(0,1) == match.substring(match.length-1)) {
          // '{{' or '}}'
          return match.substring(0, Math.floor(match.length/2))
       }

       if (p1.substring(0,1) == '{' && p1.substring(match.length-1) == '}') {
          p1=match.substring(1, p1.length-1)
       }

       var _repl
       if (match.length >= 2) {
          _repl=''
       } else {
         _repl = match.substring(1)
       }

       var _i = p1.indexOf(':')
       var _out
       if (_i > -1) {
         _out = [p1.slice(0,_i), p1.slice(_i+1)]
         //var _out = p1.split(':')   // only want to split on first ':'
       } else { _out=[p1]}
  
       var _field=_out[0] || ''
       var _format_spec=_out[1] || ''

       _out= _field.split('!')
       var _literal=_out[0] || ''
       var _sep=_field.indexOf('!') > -1?'!': undefined // _out[1]
       var _conversion=_out[1]

       if (_sep && _conversion === undefined) {
          throw __builtins__.ValueError("end of format while looking for conversion specifier")
       }

       if (_conversion !== undefined && _conversion.length > 1) {
          throw __builtins__.ValueError("expected ':' after format specifier")
       }

       if (_conversion !== undefined && 'rsa'.indexOf(_conversion) == -1) {
          throw __builtins__.ValueError("Unknown conversion specifier " + _conversion)
       }

       _name_parts=this.field_part.apply(null, [_literal])

       var _start=_literal.substring(0,1)
       var _name=''
       if (_start=='' || _start=='.' || _start == '[') {
          // auto-numbering
          if (this._index === undefined) {
             throw __builtins__.ValueError("cannot switch from manual field specification to automatic field numbering")
          }

          _name = self._index.toString()
          this._index+=1

          if (! _literal ) {
             _name_parts.shift()
          }
       } else {
         _name = _name_parts.shift()[1]
         if (this._index !== undefined && !isNaN(_name)) {
            // manual specification
            if (this._index) {
               throw __builtins__.ValueError("cannot switch from automatic field " +
                                "numbering to manual field specification")
               this._index=undefined
            }
         }
       }

       var _empty_attribute=false

       //console.log('name', _name)
       var _k
       for (var i=0; i < _name_parts.length; i++) {
           _k = _name_parts[i][0]
           var _v = _name_parts[i][1]
           var _tail = _name_parts[i][2]
           //console.log('_v', _v)
           if (_v === '') {_empty_attribute = true}
           //console.log(_tail)
           if (_tail !== '') {
              throw __builtins__.ValueError("Only '.' or '[' may follow ']' " +
                               "in format field specifier")
           }
       }

       if (_name_parts && _k == '[' && ! 
          _literal.substring(_literal.length) == ']') {
          throw __builtins__.ValueError("Missing ']' in format string")
       }

       if (_empty_attribute) {
          throw __builtins__.ValueError("Empty attribute in format string")
       }

       var _rv=''
       if (_format_spec.indexOf('{') != -1) {
          //_format_spec = this.format_sub_re.replace(_format_spec, this._prepare)
          _format_spec = _format_spec.replace(this.format_sub_re, this._prepare)
          //console.log(_format_spec)
          _rv = [_name_parts, _conversion, _format_spec]
          if (this._nested[_name] === undefined) {
             this._nested[_name]=[]
             this._nested_array.push(_name)
          }
          this._nested[_name].push(_rv) 
       } else {
          _rv = [_name_parts, _conversion, _format_spec]
          if (this._kwords[_name] === undefined) {
             this._kwords[_name]=[]
             this._kwords_array.push(_name)
          }
          this._kwords[_name].push(_rv)
       }

       //console.log('_rv', _rv)
       return '%(' + id(_rv) + ')s'
    }  // this._prepare

    this.format=function() {
       //console.log('format')
       // same as str.format() and unicode.format in Python 2.6+

       var $ns=$B.$MakeArgs('format',arguments,[],[],'args','kwargs')
       var args=$ns['args']
       var kwargs=$ns['kwargs']
       
       if (args.length>0) {
          for (var i=0; i < args.length; i++) {
              //kwargs[str(i)]=args.$dict[i]
              getattr(kwargs, '__setitem__')(str(i), args[i])
          }
       }

       //encode arguments to ASCII, if format string is bytes
       var _want_bytes = isinstance(this._string, str)
       var _params=__builtins__.dict()

       for (var i=0; i < this._kwords_array.length; i++) {
           var _name = this._kwords_array[i]
           var _items = this._kwords[_name]
           var _var = getattr(kwargs, '__getitem__')(_name)
           var _value;
           if (hasattr(_var, 'value')) {
              //_value = getattr(getattr(kwargs, '__getitem__')(_name), 'value')
              _value = getattr(_var, 'value')
           } else {
             _value=_var
           }

           for (var j=0; j < _items.length; j++) {
               var _parts = _items[j][0]
               var _conv = _items[j][1]
               var _spec = _items[j][2]

               //console.log('legacy_format:', _spec, _params)
               //_spec=$legacy_format(_spec, _params)

               var _f=this.format_field.apply(null, [_value, _parts,_conv,_spec,_want_bytes])
               getattr(_params,'__setitem__')(id(_items[j]).toString(), _f)
           }
       }

       for (var i=0; i < this._nested_array.length; i++) {
           var _name = this._nested_array[i]
           var _items = this._nested[i]

           var _var = getattr(kwargs, '__getitem__')(_name)
           var _value;
           if (hasattr(_var, 'value')) {
              _value = getattr(getattr(kwargs, '__getitem__')(_name), 'value')
           } else {
             _value=_var
           }

           for (var j=0; j < _items.length; j++) {
               var _parts = _items[j][0]
               var _conv = _items[j][1]
               var _spec = _items[j][2]

               console.log('legacy_format:', _spec, _params)
               _spec=$legacy_format(_spec, _params)

               var _f=this.format_field.apply(null, [_value, _parts,_conv,_spec,_want_bytes])
               getattr(_params,'__setitem__')(id(_items[j]).toString(), _f)
           }
       }
       //console.log('legacy_format:', this._string, _params)
       return $legacy_format(this._string, _params)
    }  // this.format

    this.format_field=function(value,parts,conv,spec,want_bytes) {
       //console.log('format_field')

       if (want_bytes === undefined) want_bytes = False

       for (var i=0; i < parts.length; i++) {
           var _k = parts[i][0]
           var _part = parts[i][1]

           if (_k) {
              if (!isNaN(_part)) {
                 value = value[parseInt(_part)]
              } else {
                 value = getattr(value, _part)
              }
           } else {
              value = value[_part]
           }
       }

       if (conv) {
          // fix me
          //console.log('legacy_format:', conv, value)
          value = $legacy_format((conv == 'r') && '%r' || '%s', value)
       }

       value = this.strformat(value, spec)
       //value=this.strformat.apply(null, [value, spec])

       if (want_bytes) { // && isinstance(value, unicode)) {
          return value.toString()
       }

       return value
    }

    this.strformat=function(value, format_spec) {
       //console.log('strformat')
       if (format_spec === undefined) format_spec = ''
       //console.log(value)
       //console.log(format_spec)
       if (hasattr(value, '__format__')) {
          return getattr(value, '__format__')(format_spec)
       }
       var _m = this.format_spec_re.test(format_spec)

       if (!_m) {
          throw __builtins__.ValueError('Invalid conversion specification') 
       }

       var _match=this.format_spec_re.exec(format_spec)
       var _align=_match[1]
       var _sign=_match[2]
       var _prefix=_match[3]
       var _width=_match[4]
       var _comma=_match[5]
       var _precision=_match[6]
       var _conversion=_match[7]

       var _is_numeric = isinstance(value, __builtins__.float)
       var _is_integer = isinstance(value, __builtins__.int)

       //console.log('match', _match)

       if (_prefix != '' && ! _is_numeric) {
          if (_is_numeric) {
             throw __builtins__.ValueError('Alternate form (#) not allowed in float format specifier')
          } else {
             throw __builtins__.ValueError('Alternate form (#) not allowed in string format specification')
          } 
       }

       if (_is_numeric && _conversion == 'n') {
          _conversion = _is_integer && 'd' || 'g'
       } else {
          if (_sign) {
             if (! _is_numeric) {
                throw __builtins__.ValueError('Sign not allowed in string format specification');
             }
             if (_conversion == 'c') {
                throw("Sign not allowed with integer format specifier 'c'")
             }
          }
       }

       if (_comma !== '') {
          value += ''
          var x = value.split('.')
          var x1 = x[0];
          var x2 = x.length > 1 ? '.' + x[1] : '';
          var rgx = /(\d+)(\d{3})/;
    
          while (rgx.test(x1)) {
                 x1 = x1.replace(rgx, '$1' + ',' + '$2');
          }
          value=x1+x2   
       }

       var _rv
       if (_conversion != '' && ((_is_numeric && _conversion == 's') || 
          (! _is_integer && 'coxX'.indexOf(_conversion) != -1))) {
          console.log(_conversion)
          throw __builtins__.ValueError('Fix me')
       }

       if (_conversion == 'c') {
          _conversion = 's'
       } 
    
       // fix me
       _rv='%' + _prefix + _precision + (_conversion || 's')

       //console.log('legacy_format', _rv, value)
       _rv = $legacy_format(_rv, value)

       if (_sign != '-' && value >= 0) {
          _rv = _sign + _rv
       }

       var _zero = False
       if (_width) {
          _zero = _width.substring(0,1) == '0'
          _width = parseInt(_width)
       } else {
          _width = 0
       }

       // Fastpath when alignment is not required

       if (_width <= _rv.length) {
          if (! _is_numeric && (_align == '=' || (_zero && ! _align))) {
             throw __builtins__.ValueError("'=' alignment not allowed in string format specifier")
          }
          return _rv
       }

       _fill = _align.substr(0,_align.length-1)
       _align= _align.substr(_align.length-1)

       if (! _fill) {_fill = _zero && '0' || ' '}

       if (_align == '^') {
          _rv = getattr(_rv, 'center')(_width, _fill)
       } else if (_align == '=' || (_zero && ! _align)) {
          if (! _is_numeric) {
             throw __builtins__.ValueError("'=' alignment not allowed in string format specifier")
          }
          if (_value < 0 || _sign != '-') {
             _rv = _rv.substring(0,1) + getattr(_rv.substring(1),'rjust')(_width - 1, _fill)
          } else {
             _rv = getattr(_rv, 'rjust')(_width, _fill)
          }
       } else if ((_align == '>' || _align == '=') || (_is_numeric && ! _aligned)) {
         _rv = getattr(_rv, 'rjust')(_width, _fill)
       } else if (_align == '<') {
         _rv = getattr(_rv, 'ljust')(_width, _fill)
       } else {
         throw __builtins__.ValueError("'" + _align + "' alignment not valid")
       }

       return _rv
    }

    //earney
    //  _field_part_re = re.compile(
    //    r'(?:(\[)|\.|^)'            # start or '.' or '['
    //    r'((?(1)[^]]*|[^.[]*))'     # part
    //    r'(?(1)(?:\]|$)([^.[]+)?)'  # ']' and invalid tail
    //  )

    this.field_part=function(literal) {
       //console.log('field_part')
       if (literal.length == 0) { return [['','','']]}

       var _matches=[]
       var _pos=0

       var _start='', _middle='', _end=''
       var arg_name=''

       // arg_name
       while (_pos < literal.length &&
              literal.charAt(_pos) !== '[' && 
              literal.charAt(_pos) !== '.') {
              //console.log(literal.charAt(_pos))
              arg_name += literal.charAt(_pos)
              _pos++
            //  console.log(_pos)
       }

       // todo.. need to work on code below, but this takes cares of most
       // common cases.
       if (arg_name != '') _matches.push(['', arg_name, ''])

       //return _matches

       var attribute_name=''
       var element_index=''

       //look for attribute_name and element_index
       while (_pos < literal.length) {
          var car = literal.charAt(_pos)
          //console.log(_pos, car)

          if (car == '[') { // element_index
             _start=_middle=_end=''
             _pos++

             car = literal.charAt(_pos)
             while (_pos < literal.length && car !== ']') {
                _middle += car
                _pos++
                car = literal.charAt(_pos)
                //console.log(car)
             }

             _pos++
             if (car == ']') {
                while (_pos < literal.length) {
                  _end+=literal.charAt(_pos)
                  _pos++
                }
             }

             _matches.push([_start, _middle, _end])
          
          } else if (car == '.') { // attribute_name
                  _middle=''
                  _pos++
                  car = literal.charAt(_pos)
                  while (_pos < literal.length &&
                         car !== '[' && 
                         car !== '.') {
                      //console.log(car)
                      _middle += car
                      _pos++
                      car = literal.charAt(_pos)
                  }

                  _matches.push(['.', _middle, ''])
          }
       }
       //console.log(_matches)
       return _matches
    }

    this.format_str_re = new RegExp(
      '(%)' +
      '|((?!{)(?:{{)+' +
      '|(?:}})+(?!})' +
      '|{(?:[^{](?:[^{}]+|{[^{}]*})*)?})', 'g'
    )

    this.format_sub_re = new RegExp('({[^{}]*})')  // nested replacement field

    this.format_spec_re = new RegExp(
      '((?:[^{}]?[<>=^])?)' +      // alignment
      '([\\-\\+ ]?)' +                // sign
      '(#?)' + '(\\d*)' + '(,?)' +    // base prefix, minimal width, thousands sep
      '((?:\.\\d+)?)' +             // precision
      '(.?)$'                      // type
    )

    this._index = 0
    this._kwords = {}
    this._kwords_array=[]
    this._nested = {}
    this._nested_array=[]

    this._string=format_string.replace(this.format_str_re, this._prepare)

    return this
}


$StringDict.format = function(self) {

    var _fs = $FormattableString(self.valueOf())
    var args=[]
    // we don't need the first item (ie, self)
    for (var i =1; i < arguments.length; i++) { args.push(arguments[i])}
    return _fs.format.apply(null, args)
}

$StringDict.format_map = function(self) {
  throw NotImplementedError("function format_map not implemented yet");
}

$StringDict.index = function(self){
    // Like find(), but raise ValueError when the substring is not found.
    var res = $StringDict.find.apply(self,arguments)
    if(res===-1){throw __builtins__.ValueError("substring not found")}
    else{return res}
}

$StringDict.isalnum = function(self) {
  var pat=/^[a-z0-9]+$/i;
  return pat.test(self)
}

$StringDict.isalpha = function(self) {
  var pat=/^[a-z]+$/i;
  return pat.test(self)
}

$StringDict.isdecimal = function(self) {
  // this is not 100% correct
  var pat=/^[0-9]+$/;
  return pat.test(self)
}

$StringDict.isdigit = function(self) {
  var pat=/^[0-9]+$/;
  return pat.test(self)
}

$StringDict.isidentifier = function(self) {
  var keywords=['False', 'None', 'True', 'and', 'as', 'assert', 'break',
     'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
     'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
     'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];

  if (keywords.indexOf(self)>-1) return True

  // fixme..  this isn't complete but should be a good start
  var pat=/^[a-z][0-9a-z_]+$/i;
  return pat.test(self)
}

$StringDict.islower = function(self) {
  var pat=/^[a-z]+$/;
  return pat.test(self)
}

$StringDict.isnumeric = function(self) {
  // not sure how to handle unicode variables
  var pat=/^[0-9]+$/;
  return pat.test(self)
}

$StringDict.isprintable = function(self) {
  // inspired by http://www.codingforums.com/archive/index.php/t-17925.html
  var re=/[^ -~]/;
  return !re.test(self);
}

$StringDict.isspace = function(self) {
  var pat=/^\s+$/i;
  return pat.test(self)
}

$StringDict.istitle = function(self) {
  var pat=/^([A-Z][a-z]+)(\s[A-Z][a-z]+)$/i;
  return pat.test(self)
}

$StringDict.isupper = function(self) {
  var pat=/^[A-Z]+$/;
  return pat.test(self)
}

$StringDict.join = function(self,obj){
    var iterable=iter(obj)
    var res = '',count=0
    while(true){
        try{
            var obj2 = next(iterable)
            if(!isinstance(obj2,str)){throw __builtins__.TypeError(
                "sequence item "+count+": expected str instance, "+obj2.__class__+"found")}
            res += obj2+self
            count++
        }catch(err){
            if(err.__name__==='StopIteration'){$B.$pop_exc();break}
            else{throw err}
        }
    }
    if(count==0){return ''}
    res = res.substr(0,res.length-self.length)
    return res
}

$StringDict.ljust = function(self, width, fillchar) {
  if (width <= self.length) return self
  if (fillchar === undefined) { fillchar=' '}
  return self + Array(width - self.length + 1).join(fillchar)
}

$StringDict.lower = function(self){
    return self.toLowerCase()
}

$StringDict.lstrip = function(self,x){
    var pattern = null
    if(x==undefined){pattern="\\s*"}
    else{pattern = "["+x+"]*"}
    var sp = new RegExp("^"+pattern)
    return self.replace(sp,"")
}

// note, maketrans should be a static function.
$StringDict.maketrans = function(from, to) {
 var _t=[]
   // make 'default' translate table
   for(var i=0; i < 256; i++) {
      _t[i]=String.fromCharCode(i)
   }

   // make substitution in the translation table
   for(var i=0; i < from.source.length; i++) {
      var _ndx=from.source[i].charCodeAt(0)     //retrieve ascii code of char
      _t[_ndx]=to.source[i]
   }

   // create a data structure that string.translate understands
   var _d=__BRYTHON__.$dict()
   for(var i=0; i < 256; i++) {
      _d.$keys.push(i)
      _d.$values.push(_t[i])
   }
   return _d
}

$StringDict.partition = function(self,sep) {
  if (sep === undefined) {
     throw Error("sep argument is required");
     return
  }
  var i=self.indexOf(sep)
  if (i== -1) { return __builtins__.tuple([self, '', ''])}
  return __builtins__.tuple([self.substring(0,i), sep, self.substring(i+sep.length)])
}

function $re_escape(str)
{
  var specials = "[.*+?|()$^"
  for(var i=0;i<specials.length;i++){
      var re = new RegExp('\\'+specials.charAt(i),'g')
      str = str.replace(re, "\\"+specials.charAt(i))
  }
  return str
}

$StringDict.replace = function(self,old,_new,count){
    if(count!==undefined){
        if(!isinstance(count,[__builtins__.int,__builtins__.float])){throw __builtins__.TypeError(
            "'"+str(count.__class__)+"' object cannot be interpreted as an integer")}
        var re = new RegExp($re_escape(old),'g')
        
        var res = self.valueOf()
        while(count>0){
            if(self.search(re)==-1){return res}
            res = res.replace(re,_new)
            count--
        }
        return res
    }else{
        var re = new RegExp($re_escape(old),"g")
        return self.replace(re,_new)
    }
}

$StringDict.rfind = function(self){
    // Return the highest index in the string where substring sub is found, 
    // such that sub is contained within s[start:end]. Optional arguments 
    // start and end are interpreted as in slice notation. Return -1 on failure.
    var start=0,end=self.length
    var $ns=$B.$MakeArgs("$StringDict.find",arguments,['self','sub'],
        ['start','end'],null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}
    if(!isinstance(sub,str)){throw __builtins__.TypeError(
        "Can't convert '"+sub.__class__.__name__+"' object to str implicitly")}
    if(!isinstance(start,__builtins__.int)||!isinstance(end,__builtins__.int)){throw __builtins__.TypeError(
        "slice indices must be integers or None or have an __index__ method")}
    var s = self.substring(start,end)
    var reversed = '',rsub=''
    for(var i=s.length-1;i>=0;i--){reversed += s.charAt(i)}
    for(var i=sub.length-1;i>=0;i--){rsub += sub.charAt(i)}
    var res = reversed.search($re_escape(rsub))
    if(res==-1){return -1}
    else{return start+s.length-1-res-sub.length+1}
}

$StringDict.rindex = function(){
    // Like rfind() but raises ValueError when the substring sub is not found
    var res = $StringDict.rfind.apply(this,arguments)
    if(res==-1){throw __builtins__.ValueError("substring not found")}
    else{return res}
}

$StringDict.rjust = function(self) {
    var fillchar = ' '
    var $ns=$B.$MakeArgs("$StringDict.rjust",arguments,['self','width'],
                      ['fillchar'],null,null)
    for(var attr in $ns){eval('var '+attr+'=$ns[attr]')}

    if (width <= self.length) return self

    return Array(width - self.length + 1).join(fillchar) + self
}

$StringDict.rpartition = function(self,sep) {
  if (sep === undefined) {
     throw Error("sep argument is required");
     return
  }
  var pos=self.length-sep.length
  while(true){
      if(self.substr(pos,sep.length)==sep){
          return __builtins__.tuple([self.substr(0,pos),sep,self.substr(pos+sep.length)])
      }else{
          pos--
          if(pos<0){return __builtins__.tuple(['','',self])}
      }
  }
}

$StringDict.rsplit = function(self) {
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var $ns=$B.$MakeArgs("$StringDict.split",args,[],[],'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = $ns['kw'].get('maxsplit',maxsplit)

    var array=$StringDict.split(self) 

    if (array.length <= maxsplit) {
       return array
    }

    var s=[], j=1
    for (var i=0; i < maxsplit - array.length; i++) {
        if (i < maxsplit - array.length) {
           if (i > 0) { s[0]+=sep}
           s[0]+=array[i]
        } else {
           s[j]=array[i]
           j+=1
        }
    }
    return __builtins__.tuple(s)
}

$StringDict.rstrip = function(self,x){
    if(x==undefined){var pattern="\\s*"}
    else{var pattern = "["+x+"]*"}
    sp = new RegExp(pattern+'$')
    return str(self.replace(sp,""))
}

$StringDict.split = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var $ns=$B.$MakeArgs("$StringDict.split",args,[],[],'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = __builtins__.dict.$dict.get($ns['kw'],'maxsplit',maxsplit)
    if(sep===None){
        var res = []
        var pos = 0
        while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
        if(pos===self.length-1){return []}
        var name = ''
        while(true){
            if(self.charAt(pos).search(/\s/)===-1){
                if(name===''){name=self.charAt(pos)}
                else{name+=self.charAt(pos)}
            }else{
                if(name!==''){
                    res.push(name)
                    if(maxsplit!==-1&&res.length===maxsplit+1){
                        res.pop()
                        res.push(name+self.substr(pos))
                        return res
                    }
                    name=''
                }
            }
            pos++
            if(pos>self.length-1){
                if(name){res.push(name)}
                break
            }
        }
        return res
    }else{
        var escaped = ['*','.','[',']','(',')','|','$','^']
        var esc_sep = ''
        for(var i=0;i<sep.length;i++){
            if(escaped.indexOf(sep.charAt(i))>-1){esc_sep += '\\'}
            esc_sep += sep.charAt(i)
        }
        var re = new RegExp(esc_sep)
        if (maxsplit==-1){
            // use native Javascript split on self
            var a = self.split(re,maxsplit)
        }else{
            // javascript split behavior is different from python when
            // a maxsplit argument is supplied. (see javascript string split
            // function docs for details)
            var l=self.split(re,-1)
            var a=l.splice(0, maxsplit)
            var b=l.splice(maxsplit-1, l.length)
            a.push(b.join(sep))
        }
        return a
    }
}

$StringDict.splitlines = function(self){
    return $StringDict.split(self,'\n')
}

$StringDict.startswith = function(self){
    // Return True if string starts with the prefix, otherwise return False. 
    // prefix can also be a tuple of prefixes to look for. With optional 
    // start, test string beginning at that position. With optional end, 
    // stop comparing string at that position.
    var $ns=$B.$MakeArgs("$StringDict.startswith",arguments,['self','prefix'],
        ['start','end'],null,null)
    var prefixes = $ns['prefix']
    if(!isinstance(prefixes,__builtins__.tuple)){prefixes=[prefixes]}
    var start = $ns['start'] || 0
    var end = $ns['end'] || self.length-1
    var s = self.substr(start,end+1)
    for(var i=0;i<prefixes.length;i++){
        var prefix = prefixes[i]
        if(prefix.length<=s.length &&
            s.substr(0,prefix.length)==prefix){return True}
    }
    return False
}

$StringDict.strip = function(self,x){
    if(x==undefined){x = "\\s"}
    return $StringDict.rstrip($StringDict.lstrip(self,x),x)
}

$StringDict.swapcase = function(self) {
    //inspired by http://www.geekpedia.com/code69_Swap-string-case-using-JavaScript.html
    return self.replace(/([a-z])|([A-Z])/g, function($0,$1,$2)
        { return ($1) ? $0.toUpperCase() : $0.toLowerCase()
    })
}

$StringDict.title = function(self) {
    //inspired from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return self.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

$StringDict.translate = function(self,table) {
    var res = ''
    if (isinstance(table, __builtins__.dict)) {
       for (var i=0; i<self.length; i++) {
           var repl = __builtins__.dict.$dict.get(table,self.charCodeAt(i),-1)
           if(repl==-1){res += self.charAt(i)}
           else if(repl!==None){res += repl}
       }
    }
    return res
}

$StringDict.upper = function(self){return self.toUpperCase()}

$StringDict.zfill = function(self, width) {
  if (width === undefined || width <= self.length) {
     return self
  }
  if (!self.isnumeric()) {
     return self
  }

  return Array(width - self.length +1).join('0');
}

function str(arg){
    if(arg===undefined){return ''}
    else{
        try{ // try __str__
            var f = getattr(arg,'__str__')
            // XXX fix : if not better than object.__str__, try __repr__
            return f()
        }
        catch(err){
            $B.$pop_exc()
            try{ // try __repr__
                var f = getattr(arg,'__repr__')
                return f()
            }catch(err){
                $B.$pop_exc()
                console.log(err+'\ndefault to toString '+arg);return arg.toString()
            }
        }
    }
}
str.__class__ = $B.$factory
str.$dict = $StringDict
$StringDict.$factory = str
$StringDict.__new__ = function(cls){
    if(cls===undefined){
        throw __builtins__.TypeError('str.__new__(): not enough arguments')
    }
    var res = {__class__:cls.$dict}
    return res
}

// dictionary and factory for subclasses of string
var $StringSubclassDict = {
    __class__:$B.$type,
    __name__:'str'
}

// the methods in subclass apply the methods in $StringDict to the
// result of instance.valueOf(), which is a Javascript string
for(var $attr in $StringDict){
    if(typeof $StringDict[$attr]=='function'){
        $StringSubclassDict[$attr]=(function(attr){
            return function(){
                var args = []
                if(arguments.length>0){
                    var args = [arguments[0].valueOf()]
                    for(var i=1;i<arguments.length;i++){
                        args.push(arguments[i])
                    }
                }
                return $StringDict[attr].apply(null,args)
            }
        })($attr)
    }
}
$StringSubclassDict.__mro__ = [$StringSubclassDict,$ObjectDict]

// factory for str subclasses
$B.$StringSubclassFactory = {
    __class__:$B.$factory,
    $dict:$StringSubclassDict
}

$B.builtins.str = str
})(__BRYTHON__)
