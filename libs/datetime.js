function $DateClass(){return new $Date(arguments)}
$DateClass.__class__ = $type
$DateClass.__str__ = function(){return "<class 'datetime.date'>"}

function $Date(args){

    if(args.length>3){$raise('TypeError',"Too many arguments - required 3, got "+args.length)}

    var obj = new $DateTime(args)
    this.year = obj.year
    this.month = obj.month
    this.day = obj.day
    this.$dt = obj

    this.__add__ = function(other) {
        //if (isinstance(other, timedelta)) {}
        $raise('TypeError', "unsupported operand type(s) for +: 'datetime.date' and '" + other.__class__ + "'");
    }
    
    this.__class__ = $DateClass

    this.__div__ = function(other) {
        $raise('TypeError', "unsupported operand type(s) for /: 'datetime.date' and '" + other.__class__ + "'");
    }

    this.__getattr__ = function(attr){return $getattr(this,attr)}

    this.__gt__ = function(other) {
         if (!isinstance(other, $Date)) {
            $raise('TypeError', "unorderable types: datetime.date() < " + other.__class__ + "()");
         }
         return this.$js_date.getTime() > other.$js_date.getTime();
    }

    this.__hash__ = function() {return hash(tuple(this.year,this.month,this.day))}

    this.__lt__ = function(other) {
         if (!isinstance(other, $Date)) {
            $raise('TypeError', "unorderable types: datetime.date() < " + other.__class__ + "()");
         }
         return this.$js_date.getTime() < other.$js_date.getTime();
    }
    
    this.__mul__ = function(other) {
        $raise('TypeError', "unsupported operand type(s) for *: 'datetime.date' and '" + other.__class__ + "'");
    }

    this.__str__ = function(){return this.strftime('%Y-%m-%d')}

    this.strftime = function(fmt){return this.$dt.strftime(fmt)}

    this.weekday = function(fmt){return this.$dt.weekday(fmt)}
}

function $DateTimeClass(){return new $DateTime(arguments)}
$DateTimeClass.__class__ = $type
$DateTimeClass.__str__ = function(){return "<class 'datetime.datetime'>"}

function $DateTime(args){

    this.__class__ = $DateTimeClass

    var daysPerMonth = [31,28,31,30,31,30,31,31,30,31,30,31]
 
    if(args.length==0){$raise('TypeError',"Required argument 'year' (pos 1) not found")}
    year = args[0]
    if(args.length==1){$raise('TypeError',"Required argument 'month' (pos 2) not found")}
    month = args[1]
    if(args.length==2){$raise('TypeError',"Required argument 'day' (pos 3) not found")}
    day = args[2]
    if(args.length>7){$raise('TypeError',"Too many arguments - required 6, got "+args.length)}
    if(args.length>3){hour=args[3]}else{hour=0}
    if(args.length>4){minute=args[4]}else{minute=0}
    if(args.length>5){second=args[5]}else{second=0}
    if(args.length>6){microsecond=args[6]}else{microsecond=0}

    if(!isinstance(year,int) || !isinstance(month,int)
        || !isinstance(day,int) || !isinstance(hour,int)
        || !isinstance(minute,int) || !isinstance(second,int)
        || !isinstance(microsecond,int)){$raise('TypeError',"an integer is required")}
    if(month<1 || month>12){$raise('ValueError',"month must be in 1..12")}
    var nb_days = daysPerMonth[month-1]
    if(month==2 && (year%4==0 && (year%100>0 || year%400==0))){nb_days=29}
    if(day<1 || day>nb_days){$raise('ValueError',"day is out of range for month")}
    if(hour<0 || hour>23){$raise('ValueError',"hour must be in 0..23")}
    if(minute<0 || minute>59){$raise('ValueError',"minute must be in 0..59")}
    if(second<0 || second>59){$raise('ValueError',"second must be in 0..59")}
    if(microsecond<0 || microsecond>999999){
        $raise('ValueError',"microsecond must be in 0..999999")}
    this.year = year
    this.month = month
    this.day = day
    this.hour = hour
    this.minute = minute
    this.second = second
    this.microsecond = microsecond
    this.$js_date = new Date(year,month-1,day,hour,minute,
        second,microsecond/1000)
        
    this.__getattr__ = function(attr){return $getattr(this,attr)}
    
    this.__hash__ = function() {
       return hash(tuple(this.year,this.month,this.day,this.hour,this.minute,this.second,this.microsecond));
    }

    this.__str__ = function(){return !this.microsecond?
        this.strftime('%Y-%m-%d %H:%M:%S'):this.strftime('%Y-%m-%d %H:%M:%S.%f')}
    
    this.norm_str = function(arg,nb){
        // left padding with 0
        var res = str(arg)
        while(res.length<nb){res = '0'+res}
        return res
    }
    this.strftime = function(fmt){
        if(!isinstance(fmt,str)){throw new TypeError("strftime() argument should be str, not "+$str(fmt.__class__))}
        var res = fmt
        res = res.replace('%d',this.norm_str(this.day,2))
        res = res.replace('%f',this.norm_str(this.microsecond,6))
        res = res.replace('%H',this.norm_str(this.hour,2))
        res = res.replace('%I',this.norm_str(int(this.hour.value%12),2))
        res = res.replace('%m',this.norm_str(this.month,2))
        res = res.replace('%M',this.norm_str(this.minute,2))
        res = res.replace('%S',this.norm_str(this.second,2))
        res = res.replace('%y',this.norm_str(this.year,4).substr(2))
        res = res.replace('%Y',this.norm_str(this.year,4))
        res = res.replace('%w',this.$js_date.getDay())
        return str(res)
    }

    this.weekday = function(){
        var wd = this.$js_date.getDay()
        return wd == 0 ? 6 : wd-1
    }
}

function $TimeClass(){return new $Time(arguments)}
$TimeClass.__class__ = $type
$TimeClass.__str__ = function(){return "<class 'datetime.time'>"}

function $Time(args){

    this.__class__ = $TimeClass

    if(args.length>4){$raise('TypeError',"Too many arguments - required 4, got "+args.length)}
    if(args.length>0){hour=args[0]}else{hour=0}
    if(args.length>1){minute=args[1]}else{minute=0}
    if(args.length>2){second=args[2]}else{second=0}
    if(args.length>3){microsecond=args[3]}else{microsecond=0}

    if(!isinstance(hour,int)
        || !isinstance(minute,int) || !isinstance(second,int)
        || !isinstance(microsecond,int)){$raise('TypeError',"an integer is required")}
    if(hour<0 || hour>23){$raise('ValueError',"hour must be in 0..23")}
    if(minute<0 || minute>59){$raise('ValueError',"minute must be in 0..59")}
    if(second<0 || second>59){$raise('ValueError',"second must be in 0..59")}
    if(microsecond<0 || microsecond>999999){
        $raise('ValueError',"microsecond must be in 0..999999")}
    this.hour = hour
    this.minute = minute
    this.second = second
    this.microsecond = microsecond
    this.$js_date = new Date(hour,minute,second,microsecond/1000)

    this.__getattr__ = function(attr){return $getattr(this,attr)}

    this.__hash__ = function() {
       return hash(tuple(this.hour,this.minute,this.second,this.microsecond))
    }

    this.__str__ = function(){return !!this.microsecond?this.strftime('%H:%M:%S.%f'):this.strftime('%H:%M:%S')}

    this.norm_str = function(arg,nb){
        // left padding with 0
        var res = str(arg)
        while(res.length<nb){res = '0'+res}
        return res
    }
    this.strftime = function(fmt){
        if(!isinstance(fmt,str)){throw new TypeError("strftime() argument should be str, not "+$str(fmt.__class__))}
        var res = fmt
        res = res.replace('%f',this.norm_str(this.microsecond,6))
        res = res.replace('%H',this.norm_str(this.hour,2))
        res = res.replace('%I',this.norm_str(int(this.hour.value%12),2))
        res = res.replace('%M',this.norm_str(this.minute,2))
        res = res.replace('%S',this.norm_str(this.second,2))
        return str(res)
    }
}

function $time(hour,minute,second,microsecond){
    return new $Time(hour,minute,second,microsecond)
}

function $date(year,month,day){
    if(year===undefined){throw new TypeError("Required argument 'year' (pos 1) not found")}
    if(month===undefined){throw new TypeError("Required argument 'month' (pos 2) not found")}
    if(day===undefined){throw new TypeError("Required argument 'day' (pos 3) not found")}
    return new $Date(year,month,day)
}
function $datetime(year,month,day,hour,minute,second,microsecond){
    if(year===undefined){$raise('TypeError',"Required argument 'year' (pos 1) not found")}
    if(month===undefined){throw new TypeError("Required argument 'month' (pos 2) not found")}
    if(day===undefined){throw new TypeError("Required argument 'day' (pos 3) not found")}
    return new $DateTime(year,month,day,hour,minute,second,microsecond)
}

$module = {
    __getattr__ : function(attr){return this[attr]},
    date : $DateClass,
    datetime : $DateTimeClass,
    time : $TimeClass,
    MAXYEAR : 9999,
    MINYEAR : 1    
}

$module.datetime.__getattr__= function(attr){
    if(attr=='now'){
        return function(){
            var obj = new Date()
            var args = [int(obj.getFullYear()),int(obj.getMonth()+1),
                int(obj.getDate()),int(obj.getHours()),int(obj.getMinutes()),
                int(obj.getSeconds()),int(obj.getMilliseconds()*1000)]
            return new $DateTime(args)}
    }
    $raise('AttributeError','datetime.datetime has no attribute '+attr)
}

$module.date.__getattr__= function(attr){
    if(attr=='today'){
        return function(){
            var obj = new Date()
            var args = [int(obj.getFullYear()),int(obj.getMonth()+1),
                int(obj.getDate())]
            return new $Date(args)
        }
    }
    $raise('AttributeError','datetime.datetime has no attribute '+attr)
}


$module.time.__getattr__= function(attr){
    $raise('AttributeError','datetime.datetime has no attribute '+attr)
} 
