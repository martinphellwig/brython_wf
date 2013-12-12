// https://raw.github.com/florentx/stringformat/master/stringformat.py

brython()
//__BRYTHON__.exception_stack=[]   // need this since we don't call brython()

_format_str_re = new RegExp(
    '(%)' +
    '|((?!{)(?:{{)+' +
    '|(?:}})+(?!})' +
    '|{(?:[^{](?:[^{}]+|{[^{}]*})*)?})', 'g'
)

_format_sub_re = new RegExp('({[^{}]*})')  // nested replacement field

_format_spec_re = new RegExp(
    '((?:[^{}]?[<>=^])?)' +      // alignment
    '([\\-\\+ ]?)' +                 // sign
    '(#?)' + '(\\d*)' + '(,?)' +    // base prefix, minimal width, thousands sep
    '((?:\.\\d\\+)?)' +             // precision
    '(.?)$'                      // type
)

//_field_part_re = new RegExp(
//    '(?:(\\[)|\\.|^)' +            // start or '.' or '['
//    '((?(1)[^]]*|[^.[]*))' +       // part
//    '(?(1)(?:\\]|$)([^.[]+)?)'        // ']' and invalid tail
//)

function field_part(literal) {
  var _matches=[]

  var _pos=0
  if (literal.length == 0) { _matches.push(['','',''])}
  while (_pos < literal.length) {
     var _start='', _middle='', _end=''

     if (literal.substring(_pos,1) == '[') {
        _start='['
        _pos++
        while (_pos < literal.length && literal.substring(_pos,1) !== ']') {
           _middle += literal.substring(_pos,1)
           _pos++
        }
        if (literal.substring(_pos, 1) == ']') _end=']'
     } else {
       if (literal.substring(_pos,1) == '.') {
          _start='.'
          _pos++
       }
       while (_pos < literal.length &&
              literal.substring(_pos,1) !== '[' && 
              literal.substring(_pos,1) !== '.') {
           _middle += literal.substring(_pos,1)
           _pos++
       }
     }
     _matches.push([_start, _middle, _end])
  }

  return _matches
}

function _center(s, width, fillchar) {
  if (width <= self.length) return s

  var pad = parseInt((width-s.length)/2)
  var res = Array(pad+1).join(fillchar)
  res = res + s + res
  if(res.length<width){res += fillchar}
  return res
}

function _ljust(s, width, fillchar) {
   if (width <= s.length) return s
   return s + Array(width - s.length +1).join(fillchar)
}

function _partition(s, sep) {
  var i=s.indexOf(sep)
  if (i == -1) return [s, '', '']
  return [s.substring(0,i), sep, s.substring(i+sep.length)]
}

function _rjust(s, width, fillchar) {
   if (width <= s.length) return s
   return Array(width - s.length +1).join(fillchar) + s
}

// old format  ie, '%s' % 'blah'

// code taken from py_string.js

_old_format = function(format_string,args){
    // string formatting (old style with %)
    var flags = $List2Dict('#','0','-',' ','+')
    var ph = [] // placeholders for replacements
 
    function format(s){
        var conv_flags = '([#\\+\\- 0])*'
        var conv_types = '[diouxXeEfFgGcrsa%]'
        var re = new RegExp('\\%(\\(.+?\\))*'+conv_flags+'(\\*|\\d*)(\\.\\*|\\.\\d*)*(h|l|L)*('+conv_types+'){1}')
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
            
        this.toString = function(){
            var res = 'type '+this.type+' key '+this.mapping_key+' min width '+this.min_width
            res += ' precision '+this.precision
            return res
        }
        this.format = function(src){
            if(this.mapping_key!==null){
                if(!isinstance(src,dict)){throw TypeError("format requires a mapping")}
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
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
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
                    var prec = 6
                    if(this.precision){prec=parseInt(this.precision.substr(1))-1}
                    var elts = str(src).split('.')
                    this.precision = '.'+(prec-elts[0].length)
                    this.type="f"
                    return this.format(src)
                }
            }else if(this.type=="e" || this.type=="E"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var prec = 6
                if(this.precision){prec=parseInt(this.precision.substr(1))}
                var res = parseFloat(src).toExponential(prec)
                var elts = res.split('e')
                var res = elts[0]+this.type+elts[1].charAt(0)
                if(elts[1].length===2){res += '0'}
                return res+elts[1].substr(1)
            }else if(this.type=="x" || this.type=="X"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = src
                res = src.toString(16)
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){res = '+'+res}
                else if(this.flag==='#'){
                    if(this.type==='x'){res = '0x'+res}
                    else{res = '0X'+res}
                }
                if(this.min_width){
                    var pad = ' '
                    if(this.flag==='0'){pad="0"}
                    while(res.length<parseInt(this.min_width)){res=pad+res}
                }
                return res
            }else if(this.type=="i" || this.type=="d"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = parseInt(src)
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
            }else if(this.type=="f" || this.type=="F"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = parseFloat(src)
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
                else if(isinstance(src,int) && src>0 && src<256){return String.fromCharCode(src)}
                else{throw TypeError('%c requires int or char')}
            }
        }
    } // format
    
    // elts is an Array ; items of odd rank are string format objects
    var elts = []
    var pos = 0, start = 0, nb_repl = 0, is_mapping = null
    var val = format_string
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
                        throw TypeError('format required a mapping')
                    }
                }else{ // form %%
                    pos++;pos++
                }
            }else{pos++}
        }else{pos++}
    }
    elts.push(val.substr(start))
    if(!isinstance(args,tuple)){
       if(args.__class__==$DictDict && is_mapping){
          // convert all formats with the dictionary
          for(var i=1;i<elts.length;i+=2){
                elts[i]=elts[i].format(args)
          }
       }
       else if(nb_repl>1){throw TypeError('244:not enough arguments for format string')}
       else{elts[1]=elts[1].format(args)}
    }else{
        if(nb_repl==args.length){
            for(var i=0;i<args.length;i++){
                var fmt = elts[1+2*i]
                elts[1+2*i]=fmt.format(args[i])
            }
        }else if(nb_repl<args.length){throw TypeError(
            "not all arguments converted during string formatting")
        }else{throw TypeError('254:not enough arguments for format string')}
    }

    var res = ''
    for(var i=0;i<elts.length;i++){res+=elts[i]}
    // finally, replace %% by %
    res = res.replace(/%%/g,'%')
    return res
}


function _strformat(value, format_spec) {
  if (format_spec === undefined) format_spec = ''

  var _m = _format_spec_re.test(format_spec)

  if(!_m) {
    throw ValueError('Invalid conversion specification') 
  }

  var _match=_format_spec_re.exec(format_spec)
  var _align=_match[0]
  var _sign=_match[1]
  var _prefix=_match[2]
  var _width=_match[3]
  var _comma=_match[4]
  var _precision=_match[5]
  var _conversion=_match[6]
  console.log('align', _align,_sign,_prefix,_width,_comma,_precision,_conversion)

  var _is_numeric = isinstance(value, float)
  var _is_integer = isinstance(value, int)

  if (_prefix && ! _is_numeric) {
     if (_is_numeric) {
        throw ValueError('Alternate form (#) not allowed in float format specifier')
     } else {
        throw ValueError('Alternate form (#) not allowed in string format specification')
     } 
  }

  if (_is_numeric && _conversion == 'n') {
     _conversion = _is_integer && 'd' || 'g'
  } else {
    if (_sign) {
       if (! _is_numeric) {
          throw ValueError('Sign not allowd in string format specifification');
       }
       if (_conversation == 'c') {
          throw("Sign not allowd with integer format specifier 'c'")
       }
    }
  }

  if (_comma) {
     // to do thousand separator
  }

  console.log('329')
  var _rv
  //try {
    console.log('332')
    console.log(_conversion)
    if (_conversion != '' && ((_is_numeric && _conversion == 's') || 
        (! _is_integer && 'cdoxX'.indexOf(_conversion) != -1))) {
       throw ValueError('Fix me')
    }
    console.log('336')
    if (_conversion == 'c') {
       _conversion = 's'
       //value = _chr(value)    // do we need to do this?
    } 
    
    // fix me
    _rv='%' + _prefix + _precision + (_conversion || 's')
    console.log("line 302")
    _rv = _old_format(_rv, value)

    //console.log('%' + _prefix + _precision + (_conversion || 's')))
    //console.log(value) 
  //} catch (err) {
  //  throw ValueError(err)
  //}

  if (_sign != '-' && value >= 0) {
     _rv = _sign + _rv
  }

  var _zero = False
  if (_width) {
    _zero = width.substring(0,1) == '0'
    _width = parseInt(_width)
  } else {
    _width = 0
  }

  // Fastpath when alignment is not required

  if (_width <= _rv.length) {
     if (! _is_numeric && (_align == '=' || (_zero && ! _align))) {
        throw ValueError("'=' alignment not allowd in string format specifier")
     }
     return _rv
  }

  _fill = _align.substring(0,_align.length-1)
  _align= _align.substring(_align.length)

  if (! _fill) {_fill = _zero && '0' || ' '}

  if (_align == '^') {
     _padding = _width - _rv.length
     // tweak the formatting if the padding is odd
     if (_padding % 2) {
        _rv = _center(_rv,_width, _fill)
     }
  } else if (_align == '=' || (_zero && ! _align)) {
    if (! _is_numeric) {
       throw ValueError("'=' alignment not allowd in string format specifier")
    }
    if (_value < 0 || _sign != '-') {
       _rv = _rv.substring(0,1) + _rjust(_rv.substring(1),_width - 1, _fill)
    } else {
       _rv = _rjust(_rv, _width, _fill)
    }
  } else if ((_align == '>' || _align == '=') || (_is_numeric && ! _aligned)) {
    _rv = _rjust(_rv,_width, _fill)
  } else {
    _rv = _ljust(_rv,_width, _fill)
  }

  return _rv
}

function _format_field(value,parts,conv,spec,want_bytes) {
  if (want_bytes === undefined) want_bytes = False

  console.log('parts', parts)
  for (var i=0; i < parts.length; i++) {
      var _k = parts[i][0]
      var _part = parts[i][1]

      if (_k) {
         if (!isNaN(_part)) {
            value = value[parseInt(_part)]
         } else {
            value = value[_part]
         }
      } else {
        value = value[_part]
      }
  }

  if (conv) {
     // fix me
     //value = (conv == 'r') && '%r' || '%s' % value
     console.log("line 378")
     value = _old_format((conv == 'r') && '%r' || '%s', value)
  }
  console.log(value)
  //if (value.__format__ !== undefined) {
  //   value = value.__format__(spec)
  //} else if (value.__strftime__ !== undefined && spec) {
  //   value = value.strftime(spec.toString())
  //} else {
  value = _strformat(value, spec)
  //}

  if (want_bytes) { // && isinstance(value, unicode)) {
     return value.toString()
  }

  console.log('value', value)
  return value
}

function FormattableString(format_string) {
    this.format_string=format_string

    this._prepare = function(match) {
       console.log('part', match)
       //if (match == '%') return '%%'
       if (match.substring(0,1) == match.substring(match.length)) {
          // '{{' or '}}'
          return match.substring(0, int(match.length/2))
       }

       var _repl
       if (match.length >= 2) {
          _repl=''
       } else {
         _repl = match.substring(1)
       }
       //console.log(_repl)
       var _out = _partition(_repl, ':')
       var _field=_out[0]
       var _dummy=_out[1]
       var _format_spec=_out[2]
       //console.log(_field, _dummy, _format_spec)
       _out= _partition(_field, '!')
       var _literal=_out[0]
       var _sep=_out[1]
       var _conversion=_out[2]
       //console.log(_literal, _sep, _conversion)

       if (_sep && ! _conversion) {
          throw ValueError("end of format while looking for conversion specifier")
       }

       if (_conversion.length > 1) {
          throw ValueError("expected ':' after format specifier")
       }

       if ('rsa'.indexOf(_conversion) == -1) {
          throw ValueError("Unknown conversation specifier " + _conversion)
       }

       //fix me
       //_name_parts = _field_part_re.search(_literal)
       console.log('literal', _literal)
       _name_parts=field_part(_literal)
       console.log('name_parts', _name_parts)

       var _start=_literal.substring(0,1)
       var _name=''
       console.log('start', _start)
       if (_start == '' || '.['.indexOf(_start) != -1) {
          // auto-numbering
          if (this._index === undefined) {
             throw ValueError("cannot switch from manual field specification to automatic field numbering")
          }

          _name = self._index.toString()
          this._index=1
          console.log('500:', _name_parts)
          if (! _literal ) {
             _name_parts.shift()
          }
          console.log('504:', _name_parts)
       } else {
         console.log('504:_name_parts', _name_parts)
         _name = _name_parts.shift()[1]
         if (this._index !== undefined && !isNaN(_name)) {
            // manual specification
            if (this._index) {
               throw ValueError("cannot switch from automatic field " +
                                "numbering to manual field specification")
               this._index=undefined
            }
         }
       }

       var _empty_attribute=false

       var _k
       console.log('519:name_parts', _name_parts)
       for (var i=0; i < _name_parts.length; i++) {
           _k = _name_parts[i][0]
           var _v = _name_parts[i][1]
           var _tail = _name_parts[i][2]

           if (_v == '') {_empty_attribute = true}
           if (_tail !== undefined) {
              console.log('tail = ' + _tail)
              throw ValueError("Only '.' or '[' may follow ']' " +
                               "in format field specifier")
           }
       }

       if (_name_parts && _k == '[' && ! 
          _literal.substring(_literal.length) == ']') {
          throw ValueError("Missing ']' in format string")
       }

       if (_empty_attribute) {
          throw ValueError("Empty attribute in format string")
       }

       var _rv=''
       if (_format_spec.indexOf('{') != -1) {
          _format_spec = _format_sub_re.replace(_format_spec, self._prepare)
          _rv = list([_name_parts, _conversion, _format_spec])
          if (this._nested[_name] === undefined) {
             this._nested[_name]=[]
             this._nested_array.push(_name)
          }
          this._nested[_name].push(_rv) 
       } else {
          _rv = list([_name_parts, _conversion, _format_spec])
          if (this._kwords[_name] === undefined) {
             this._kwords[_name]=[]
             this._kwords_array.push(_name)
          }
          this._kwords[_name].push(_rv) 
       }
       console.log('559 name_parts', _name_parts)
       return '%(' + id(_rv) + ')s'
    } // this.prepare

    this.eq = function(other) {
       if (other.format_string !== undefined) {
          return this.format_string == other.format_string
       }
       return this.format_string == other
    }

    this.format=function() {
       // same as str.format() and unicode.format in Python 2.6+

       var $ns=$MakeArgs('format',arguments,[],{},'args','kwargs')
       for($var in $ns){eval("var "+$var+"=$ns[$var]")}

       if (args) {
          for (var i=0; i < args.length; i++) {
              kwargs[str(i)]=args[i]
          }
       }

       //encode arguments to ASCII, if format string is bytes
       var _want_bytes = isinstance(this._string, str)
       var _params={}
       //var _params = $dict()
       for (var i=0; i < this._kwords_array.length; i++) {
           var _name = this._kwords_array[i]
           var _items = this._kwords[_name]
           console.log('name', _name)
           console.log('kwargs', kwargs)
           //var _value = kwargs.get(_name)
           var _value = kwargs[_name]

           for (var j=0; j < _items.length; j++) {
               var _parts = _items[j][0]
               var _conv = _items[j][1]
               var _spec = _items[j][2]

               _params[id(_items[j]).toString()]= _format_field(_value, _parts, _conv,
                                                    _spec, _want_bytes)

               //_params[id(_items[j]).toString()] = _format_field(_value, _parts, 
               //                                       _conv, _spec, _want_bytes)
           }
       }

       for (var i=0; i < this._nested_array.length; i++) {
           var _name = this._nested_array[i]
           var _items = this._nested[i]
           var _value = kwargs[_name]

           for (var j=0; j < _items.length; j++) {
               var _parts = _items[j][0]
               var _conv = _items[j][1]
               var _spec = _items[j][2]

               //_spec = _spec % _params
               console.log("line 541")
               _spec=_old_format(_spec, _params)

               _params[id(_items[j]).toString()] = _format_field(_value, _parts, 
                                                      _conv, _spec, _want_bytes)
           }
       }

       // this._string % _params
       console.log("line 592", this._string, _params)
       return _old_format(this._string, _params)
    } // this.format


    this._index = 0
    this._kwords = {}
    this._kwords_array=[]
    this._nested = {}
    this._nested_array=[]

    console.log(format_string)
    this._string=format_string.replace(_format_str_re, this._prepare, 'g')

    console.log('self._string', this._string)

    return this
}
