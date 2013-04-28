// global object with brython built-ins
$version_info = [1,1,"20130427-070211"]

if(typeof Storage!==undefined){
    var $src = localStorage.getItem('brython')
    var $version = localStorage.getItem('brython_version')
    if(!$src || $version !==$version_info[2]){
        var $scripts = document.getElementsByTagName('script')
        for(var $i=0;$i<$scripts.length;$i++){
            if($scripts[$i].src.substr($scripts[$i].src.length-13)==='/py_loader.js'){
                $brython_path = $scripts[$i].src.substr(0,$scripts[$i].src.length-13)
                break
            }
        }
        // get source code by an Ajax call
        if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
            var $xmlhttp=new XMLHttpRequest();
        }else{// code for IE6, IE5
            var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
        }
        $xmlhttp.onreadystatechange = function(){
            if($xmlhttp.readyState===4 && $xmlhttp.status===200){
                $src = $xmlhttp.responseText
                localStorage.setItem('brython',$src)
                localStorage.setItem('brython_version',$version_info[2])
            }
        }
        $xmlhttp.open('GET',$brython_path+'/brython.js',false)
        $xmlhttp.send()
    }
    eval($src)  
}
