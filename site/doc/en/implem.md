Translation of the Python syntax into Javascript code
-----------------------------------------------------

<table border=1>
<tr>
<th>Python</th>
<th>Javascript</th>
<th>Comments</th>
</tr>

<tr>
<td>
`x = 1`

`y = 3.14`

`z = "azerty"`
</td>
<td>
`x = Number(1)`

`y = float(3.14)`

`z = "azerty"`
</td>
<td>_float_ is a Javascript function defined in __py\_classes.js__</td>
</tr>

<tr>
<td>`x = foo.bar`</td>
<td>`x = foo.__getattr__('bar')`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`foo.bar = x`</td>
<td>`foo.__setattr__('bar',x)`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x = foo[bar]`</td>
<td>`x = foo.__getitem__(bar)`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`foo[bar] = x`</td>
<td>`foo.__setitem__(bar,x)`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`x+y`</td>
<td>`x.__add__(b)`
<td>same for all operators
<br>necessary to implement such operations as 2 * "a"</td>
</td>
</tr>

<tr>
<td>`a and b`</td>
<td>`$test\_expr($test\_item(a)&&$test\_item(b))`
<td>we are keeping the Javascript && operator so as to not evaluate b if a is false
<br>_$test\_item_ returns a Javascript boolean (true or false)  and stores the resulting value in a global variable ; _$test\_expr_ returns this global variable</td>
</td>
</tr>

<tr>
<td>
    for obj in iterable:
        (...)
</td>
<td>
    var $Iter1 = iterable
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
<td>
    var $temp=[]
    $temp.push(a)
    $temp.push(b)
    x =$temp[0] 
    y =$temp[1]
</td>
<td>&nbsp;</td></tr>

<tr>
<td>
    def foo():
       x=3
</td>
<td>
    function foo(){
       var x=3
    }
    window.foo=foo 
</td>
<td>
To be consistent with the management of the Python namespace, the local variable `x` is declared by the `var` keyword

The last line adds the function name in the namespace of the browser ; it will only exist if the function is at the level of the module, and not inside another function
</td>
</tr>

<tr>
<td>
    def foo():
       global x
       x=3
</td>
<td>
    function foo(){
       x=3
    }
    window.foo=foo 
</td>
<td>for a global variable, we do not use the `var` keyword</td>
</tr>

<tr>
<td>
    def foo(x,y=3,*args,**kw):
       (...)
</td>
<td>
    function foo(){
       $ns=$MakeArgs(arguments,['x'],{"y":3},"args","kw")
       for($var in $ns){eval("var "+$var+"=$ns[$var]")} 
       (...)
    }
    window.foo=foo 
</td>
<td>the _$MakeArgs_ function builds a Javascript object matching the names defined in the function signature to the values that are actually passed to it. The following line builds the namespace of the function (local variables)</td>
</tr>

<tr>
<td>`foo(x,y=1)`
</td>
<td>`foo(x,$Kw("y",1))`
</td>
<td>arguments passed as keywords are converted into objects created by the _$Kw_ function
</tr>

<tr>
<td>
    x='brython'
    try:
        x[2]='a'
    except TypeError:
        log('error')
    except:
        log('another error')
</td>
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
<td>the lines
    catch($err0){
        if(false){void(0)}
        
are added before all `except` clauses, translated as `else if` when an exception name is specified or as an `else` when it is not the case

</tr>

</table>

<p>
<table border=1>
<tr>
<th>Javascript</th>
<th>Python</th>
<th>Comment</th>
</tr>


<tr>
<td>`document`</td>
<td>`doc`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`document.getElementById(elt_id)`</td>
<td>`doc[elt_id]`
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`document.getElementsByTagName('A')`</td>
<td>`doc[A]`
<td>returns a Python list</td>
</td>
</tr>

<tr>
<td>`setInterval(func,millisec)`</td>
<td>
    import time
    time.set_interval(func,millisec)
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`clearInterval(interval_id)`</td>
<td>
    import time
    time.clear_interval(interval_id)
<td>&nbsp;</td>
</td>
</tr>

<tr>
<td>`setTimeOut(func,millisec)`</td>
<td>
    import time
    time.set_timeout(func,millisec)
<td>&nbsp;</td>
</td>
</tr>



</table>

