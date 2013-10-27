// creation of an HTML element
$module = (function(){
function $Tag(tagName,args){
    var obj = $DOMNode(document.createElement(tagName))
    // obj.elt is the DOM element
    obj.parent = this
    if(args!=undefined && args.length>0){
        $start = 0
        $first = args[0]
        // if first argument is not a keyword, it's the tag content
        if($first.__class__!==$Kw){
            $start = 1
            if(isinstance($first,[str,int,float])){
                txt = document.createTextNode(str($first))
                obj.elt.appendChild(txt)
            } else if($first.__class__===$TagSumDict){
                for($i=0;$i<$first.children.length;$i++){
                    obj.elt.appendChild($first.children[$i].elt)
                }
            } else { // argument is another DOMNode instance
                try{obj.elt.appendChild($first.elt)}
                catch(err){console.log('erreur '+err);throw ValueError('wrong element '+$first)}
            }
        }
        // attributes
        for(var $i=$start;$i<args.length;$i++){
            // keyword arguments
            $arg = args[$i]
            if(isinstance($arg,$Kw)){
                if($arg.name.toLowerCase().substr(0,2)==="on"){ // events
                    eval('DOMNode.bind(obj,"'+$arg.name.toLowerCase().substr(2)+'",function(){'+$arg.value+'})')
                }else if($arg.name.toLowerCase()=="style"){
                    DOMNode.set_style(obj,$arg.value)
                } else {
                    if($arg.value!==false){
                        // option.selected=false sets it to true :-)
                        try{
                            var arg = $arg.name.toLowerCase()
                            obj.elt.setAttribute(arg,$arg.value)
                            if(arg=="class"){ // for IE
                                obj.elt.setAttribute("className",$arg.value)
                            }
                        }catch(err){
                            console.log('erreur '+err)
                            throw ValueError("can't set attribute "+$arg.name)
                        }
                    }
                }
            }
        }
    }
    return obj
}

// the classes used for tag sums, $TagSUm and $TagSumClass 
// are defined in py_dom.js

function A(){
    var obj = $Tag('A',arguments)
    return obj
}
A.__name__='html.A'

var $src = A+'' // source of function A
// HTML4 tags
$tags = ['A', 'ABBR', 'ACRONYM', 'ADDRESS', 'APPLET',
            'B', 'BDO', 'BIG', 'BLOCKQUOTE', 'BUTTON',
            'CAPTION', 'CENTER', 'CITE', 'CODE',
            'DEL', 'DFN', 'DIR', 'DIV', 'DL',
            'EM', 'FIELDSET', 'FONT', 'FORM', 'FRAMESET',
            'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
            'I', 'IFRAME', 'INS', 'KBD', 'LABEL', 'LEGEND',
            'MAP', 'MENU', 'NOFRAMES', 'NOSCRIPT', 'OBJECT',
            'OL', 'OPTGROUP', 'PRE', 'Q', 'S', 'SAMP',
            'SCRIPT', 'SELECT', 'SMALL', 'SPAN', 'STRIKE',
            'STRONG', 'STYLE', 'SUB', 'SUP', 'TABLE',
            'TEXTAREA', 'TITLE', 'TT', 'U', 'UL',
            'VAR', 'BODY', 'COLGROUP', 'DD', 'DT', 'HEAD',
            'HTML', 'LI', 'P', 'TBODY','OPTION', 
            'TD', 'TFOOT', 'TH', 'THEAD', 'TR',
            'AREA', 'BASE', 'BASEFONT', 'BR', 'COL', 'FRAME',
            'HR', 'IMG', 'INPUT', 'ISINDEX', 'LINK',
            'META', 'PARAM']

// HTML5 tags
$tags = $tags.concat(['ARTICLE','ASIDE','AUDIO','BDI',
    'CANVAS','COMMAND','DATALIST','DETAILS','DIALOG',
    'EMBED','FIGCAPTION','FIGURE','FOOTER','HEADER',
    'KEYGEN','MARK','METER','NAV','OUTPUT',
    'PROGRESS','RP','RT','RUBY','SECTION','SOURCE',
    'SUMMARY','TIME','TRACK','VIDEO','WBR'])

// create classes
var obj = new Object()
for($i=0;$i<$tags.length;$i++){
    $code = $src.replace(/A/gm,$tags[$i])
    eval("obj."+$tags[$i]+"="+$code)
    eval("obj."+$tags[$i]+'.__name__="html.'+$tags[$i]+'"')
}
obj.__getattr__ = function(attr){return this[attr]}
return obj
})()
