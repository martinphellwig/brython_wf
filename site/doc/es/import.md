import
------

El import se realiza mediante llamadas Ajax

Existen tres tipos de módulos importables:

- módulos escritos en Javascript, localizados en la carpeta __libs__ de la distribución : _datetime, hashlib, html, json, math, random, svg, sys_ (en los cuales solo algunos de los atributos y m&eacute;todos se encuentran implementados)
- módulos escritos en Python, localizados en la carpeta __Lib__ : _dis, errno, itertools, keyword, local\_storage, os, pydom, pyindexedDB, string, sys, traceback_
- módulos escritos por el usuario en Python, los cuales serán importados desde la misma carpeta desde la que se encuentra el script que realiza la llamada

Los módulos deben ser codificados en utf-8 ; la declaración de la codificación al principio del módulo será ignorada.