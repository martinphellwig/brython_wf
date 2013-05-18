Traducci&oacute;n de la sintaxis Python a c&oacute;digo Javascript
------------------------------------------------------------------

<p>
<table border=1>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Comentarios</th>
</tr>

<tr>
<td><pre><code>
x = 1
y = 3.14
z = "azerty"
</code></pre></td>
<td><pre><code>
x = int(1)
y = float(3.14)
z = "azerty"
</pre></code></td>
<td>
_float_ es una funci&oacute;n Javascript definida en __py\_classes.js__
</td>
</tr>

<tr>
<td>`x = foo.bar`</td>
<td>`x = foo.__getattr__('bar')`</pre>
<td>&nbsp;</td>
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
<td>`foo[bar] = x`</td>
<td>`foo.__setitem__(bar,x)`</pre>
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x+y`</td>
<td>`x.__add__(b)`</pre>
<td>Lo mismo para todos los operadores
<br>necesario implementar tales operaciones como 2 * "a"</td>
</td>
</tr>

<tr>
<td>`a and b`</td>
<td>`$test_expr($test_item(a)&&$test_item(b))`
<td>estamos manteniendo el operador && Javascript y de esa forma no se eval&uacute;a b is a es falso
<br>_$test\_item_ devuelve un booleano Javascript (true o false) y almacena el resultado en una variable global; _$test\_expr_ devuelve esa variable global</td>
</td>
</tr>

<tr>
<td><pre><code>
for obj in iterable:
   (...)
</code></pre></td>
<td><pre><code>
var $Iter1 = iterable
for (var $i1=0;$i1<$iter1.__len__();$i1++){ 
   obj =$iter1.__item__($i1)
   void(0)
}</pre>
</td>
<td>&nbsp;</td></tr>

<tr>
<td>`x,y = iterable`</td>
<td><pre><code>
var $var =iterable 
x =$var.__item__(0) 
y =$var.__item__(1) 
</code></pre></td>
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
<td><pre><code>function foo(){
   var x=3
}
window.foo=foo 
</code></pre></td>
<td>Para ser consistente en la gesti&oacute;n del espacio de nombres (namespace) de Python, la variable local _x_ ser&aacute; declarada por la keyword `var`

La &uacute;ltima l&iacute;nea a&ntilde;ade el nombre de la funci&oacute;n al espacio de nombres del navegador; solo existir&aacute; si la funci&oacute;n est&aacute; en el nivel del m&oacute;dulo y no dentro de otra funci&oacute;n</td></tr>

<tr>
<td><pre><code>
def foo():
   global x
   x=3
</code></pre></td>
<td><pre><code>function foo(){
   x=3
}
window.foo=foo 
</code></pre></td>
<td>para una variable global no usamos la keyword `var`</td>
</tr>

<tr>
<td><pre><code>def foo(x,y=3,*args,**kw):
   (...)
</code></pre></td>
<td><pre><code>function foo(){
   $ns=$MakeArgs(arguments,['x'],{"y":3},"args","kw")
   for($var in $ns){eval("var "+$var+"=$ns[$var]")} 
   (...)
}
window.foo=foo 
</code></pre></td>
<td>la funci&oacute;n _$MakeArgs_ crea un objeto Javascript combinando los nombres definidos en la firma de la funci&oacute;n con valores que han sido introducidos realmente. La siguiente l&iacute;nea crea el namespace de la funci&oacute;n (variables locales)</td>
</tr>

<tr>
<td>
`foo(x,y=1)`
</td>
<td>
`foo(x,$Kw("y",1))`
</td>
<td>los argumentos introducidos como keywords se convierten en objetos creados por la funci&oacute;n _$Kw_
</tr>

<tr>
<td><pre><code>
x='brython'
try:
    x[2]='a'
except TypeError:
    log('error')
except:
    log('another error')
</code></pre></td>
<td>
    x ='brython' 
    try{
        x.__setitem__(2,str('a'))
    }
    catch($err0){
       if(false){void(0)} 
       else if($err0.name=="TypeError"){
            log('error')
        }
        else{
            log('another error')
        }
    }
</td>
<td>las l&iacute;neas
<pre><b>catch($err0){
   if(false){void(0)} </b></pre><p>
se a&ntilde;aden antes que las cl&aacute;usulas `except`, traducido como `else if` cuando el nombre de una excepci&oacute;n se especifica o como un `else` cuando no es el caso

</tr>

</table>

<p>
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
