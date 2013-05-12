Traduction de la syntaxe Python en code Javascript
--------------------------------------------------

<p>
<table border=1>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Commentaires</th>
</tr>

<tr>
<td><pre><code>
x = 1
y = 3.14
z = "azerty"
</code></pre></td>
<td><pre><code>
x = 1
y = float(3.14)
z = "azerty"
</code></pre></td>
<td>
_float_ est une fonction Javascript définie dans __py\_classes.js__
</td>
</tr>

<tr>
<td><pre>
`x = foo.bar`
</td>
<td>
`x = foo.__getattr__('bar')`
<td>sauf pour l'attribut _\_\_getattr\_\__</td>
</td>
</tr>

<tr>
<td>`foo.bar = x`</td>
<td>`foo.__setattr__('bar',x)`</pre>
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x = foo[bar]`</td>
<td>`x = foo.__getitem__(bar)`</pre>
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>
`foo[bar] = x`
</td>
<td>
`foo.__setitem__(bar,x)`
</pre>
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x+y`</td>
<td>`x.__add__(b)`</pre>
<td>même chose pour tous les opérateurs

indispensable pour implémenter des opérations comme 2*"a"
</td>
</td>
</tr>

<tr>
<td>`a and b`</td>
<td>`$test_expr($test_item(a)&&$test_item(b))`
<td>on conserve l'opérateur Javascript && pour ne pas évaluer b si a est faux

_$test\_item_ retourne un booléen Javascript (`true` ou `false`) et stocke la valeur évaluée dans une variable globale ; _$test\_expr_ renvoie cette variable globale</td>
</td>
</tr>

<tr>
<td><pre><code>
for obj in iterable:
   (...)
</code></pre></td>
<td>
    var $iter1 =iterable 
    for (var $i1=0;$i1<$iter1.__len__();$i1++){ 
       obj =$iter1.__item__($i1)
       void(0) 
    }
</td>
<td>&nbsp;</td></tr>

<tr>
<td>`x,y = iterable`</td>
<td>
    var $var =iterable 
    x =$var.__item__(0) 
    y =$var.__item__(1) 
</td>
<td>&nbsp;</td></tr>

<tr>
<td>`x,y = a,b`</td>
<td><pre><code>
var $temp=[] 
$temp.push(a)
$temp.push(b)
x =$temp[0] 
y =$temp[1]
</code></pre></td>
<td>&nbsp;</td></tr>

<tr>
<td><pre><code>
def foo():
   x=3
</code></pre></td>
<td><pre><code>
function foo(){
   var x=3
}
window.foo=foo 
</code></pre></td>
<td>
Pour être cohérent avec la gestion de l'espace de noms Python, la variable _x_ est locale, déclarée par le mot-clé `var`

La dernière ligne ajoute le nom de la fonction dans l'espace de noms du navigateur ; elle n'est présente que si la fonction est au niveau du module, pas à l'intérieur d'une autre fonction ou d'une classe</td></tr>

<tr>
<td><pre><code>
def foo():
   global x
   x=3
</code></pre></td>
<td><pre><code>
function foo(){
   x=3
}
window.foo=foo 
</code></pre></td>
<td>pour une variable globale, on ne précède pas l'affectation du mot-clé `var`</td>
</tr>

<tr>
<td><pre><code>
def foo(x,y=3,*args,**kw):
   (...)
</code></pre></td>
<td><pre><code>
function foo(){
   $ns=$MakeArgs(arguments,['x'],{"y":3},"args","kw")
   for($var in $ns){eval("var "+$var+"=$ns[$var]")} 
   (...)
}
window.foo=foo 
</code></pre></td>
<td>la fonction _$MakeArgs_ contruit un objet Javascript faisant correspondre les noms définis dans la signature de la fonction aux valeurs effectivement passées. La ligne suivante construit l'espace de noms de la fonction (variables locales)</td>
</tr>

<tr>
<td><pre>
`foo(x)`
</pre></td>
<td>
`foo.__call__(x)`
</td>
<td>Cette transformation est nécessaire pour rendre appelables les instances des classes qui définissent une méthode`__call__()`

Elle est définie pour les objets de type fonction par 
<br>`Function.prototype.__call__ = function(){return this.apply(null,arguments)}`
</tr>

<tr>
<td>
`foo(x,y=1)`
</td>
<td>
`foo.__call__(x,$Kw("y",1))`
</td>
<td>les arguments passés sous forme de mots-clés sont convertis en objets créés par la fonction _$Kw()_
</tr>

<tr>
<td>
    x='brython'
    try:
        x[2]='a'
    except TypeError:
        print('erreur')
    except:
        print('autre erreur')
</code></pre></td>
<td>
    x='brython'
    try{
        x.__setitem__(Number(2),'a')
    }
    catch($err0){
        if(false){void(0)}
        else if(["TypeError"].indexOf($err0.__name__)>-1){
           $print.__call__('erreur')
        }
        else{
            $print.__call__('autre erreur')
        }
    }
</td>
<td>les lignes
    catch($err0){
       if(false){void(0)} </b></pre><p>
sont ajoutées avant toutes les clauses `except`, qui sont traduites en `else if` si un nom d'exception est précisé ou `else` sinon

</tr>

<tr>
<td><pre><code>class foo:
   pass
</code></pre></td>
<td><pre><code>
var $foo=(function(){
   var $class = new Object()
   void(0)
   return $class
}
)()
var foo=$class_constructor("foo",$foo,tuple([]))
window.foo=foo
</code></pre></td>
<td>le corps de la définition de la classe est intégré dans une fonction préfixée par le signe $. Cette fonction renvoie un objet `$class` qui possède les attributs et méthodes définis dans la classe

La classe elle-même est construite par la fonction _$class\_constructor_ définie dans __py_utils.js__ qui construit un objet Javascript correspondant à la classe Python. Les arguments passés à cette fonction sont le nom de la classe, la fonction préfixée par $, et un tuple contenant les éventuelles classes parentes
</tr>

<tr>
<td>
    class foo(A):
        def __init__(self,x):
            self.x = x
<td>
    var $foo=(function()
      var $class = new Object()
      var __init__ = $class.__init__= (function (){
        return function(){
          try{
            var $ns=$MakeArgs("__init__",arguments,
              ["self","x"],{},null,null)
            for($var in $ns){eval("var "+$var+"=$ns[$var]")}
            self.__setattr__("x",x)
          }
          catch(err2){
            if(err2.py_error!==undefined){throw err2}
            else{throw RuntimeError(err2.message)}}
          }
        }
        )()
      __init__.__name__=$class.__init__.__name__="__init__"
      return $class
    }
    )()
    var foo=$class_constructor("foo",$foo,A)
    window.foo=foo

</td>
<td>On voit que l'objet `$class` reçoit comme attribut la méthode `__init__()`

La classe hérite d'une autre classe `A`, qu'on retrouve comme 3ème argument de l'appel à `$class_constructor`
</tr>



</table>

<p>

<h3>Traduction de quelques fonctions Javascript courantes</h3>
<table border=1>
<tr>
<th>Javascript</th>
<th>Python</th>
</tr>

<tr>
<td>`setInterval(func,millisec)`</td>
<td><pre><code>
import time
time.set_interval(func,millisec)
</code></pre></td>
<td>&nbsp;</td>
</tr>

<tr>
<td>`clearInterval(interval_id)`</td>
<td><pre><code>
import time
time.clear_interval(interval_id)
</code></pre></td>
</tr>

<tr>
<td>`setTimeOut(func,millisec)`</td>
<td><pre><code>
import time
time.set_timeout(func,millisec)
</code></pre></td>
</tr>



</table>
