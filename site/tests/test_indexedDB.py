import pyindexedDB

_kids=['Marsha', 'Jan', 'Cindy']

def exists(event):
    if event.target.pyresult() is None:
       #handle cause of when get returns undefined if the key doesn't exist
       #in the db..
       continue2()
    else:
       print(event.result)
       #this shouldn't get called, output message if called
       print("this shouldn't get called")


def printrec(event):
    _obj=event.target.pyresult()

    assert isinstance(_obj, dict)
    assert _obj['name']=='Jan'
          
def printmsg(event):
    _obj=event.target.pyresult()
    assert _obj in _kids

def printerr(event):
    print("Error: %s" % (event.result))    

def onsuccess(event):
    def continue1(event):
        _objectStore.get('Jan', onsuccess=exists, onerror=continue2)

    def continue2(event):
        for _kid in _kids:
            _rec={'name': _kid}
            _objectStore.put(_rec, _kid, onsuccess=printmsg, onerror=printerr)

        _objectStore.get('Jan', onsuccess=continue3, onerror=printerr)
      
    def continue3(event):
        print ("Async operations complete..")

    _trans=_db.transaction(["BradyKids"], 'readwrite')
    _objectStore=_trans.objectStore("BradyKids")
    _objectStore.clear(onsuccess=continue1, onerror=printerr)

def onupgradeneeded(e):
   print("event: ", e)
   print("event type: ",  e.type)
   
   print("e.oldVersion: ", e.oldVersion)
   print("e.newVersion: ", e.newVersion)
   
   # todo.. override createObjectStore to take options (ie, like OS.put)
   e.target.result.createObjectStore("BradyKids")
   
_db=pyindexedDB.pyindexedDB()
_db.open("BradyKids", onsuccess=onsuccess, onupgradeneeded=onupgradeneeded, version=3)
print("allowing async operations to complete")

