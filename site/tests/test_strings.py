# strings

hello = "This is a rather long string containing\n\
several lines of text just as you would do in C.\n\
    Note that whitespace at the beginning of the line is\
 significant."

hello = """\
Usage: thingy [OPTIONS]
     -h                        Display this usage message
     -H hostname               Hostname to connect to
"""
hello = r"This is a rather long string containing\n\
several lines of text much as you would do in C."

word = 'Help' + 'A'
assert word=='HelpA'
assert '<' + word*5 + '>'=='<HelpAHelpAHelpAHelpAHelpA>'

x = 'str' 'ing'
assert x=='string'
assert 'str'.strip() + 'ing'=='string'

# string methods
x='fooss'
assert x.replace('o','X',20) == 'fXXss'
assert 'GhFF'.lower() == 'ghff'
assert x.lstrip('of') == 'ss'
x='aZjhkhZyuy'
assert x.find('Z')==1
assert x.rfind('Z')==6
assert x.rindex('Z')==6
try:
    print(x.rindex('K'))
except ValueError:
    pass
assert x.split('h') == ['aZj', 'k', 'Zyuy']
#print(x.split('h',1))
assert x.startswith('aZ')
assert x.strip('auy') == 'ZjhkhZ'
assert x.upper()=='AZJHKHZYUY'

x = "zer"
assert x.capitalize() == "Zer"
assert str.capitalize(x) == "Zer"

x = "azert$t y t"
assert x.count('t')==3
assert str.count(x,'t')==3

assert x.endswith("y t")==True

assert x.find('t')==4
assert x.find('$')==5
assert x.find('p')==-1

assert x.index('t')==4

items = ['sd','kj']
assert '-'.join(items)=="sd-kj"

assert "ZER".lower()=="zer"

assert "azerty".lstrip('a')=="zerty"
assert "azerty".lstrip('za')=="erty"
assert "azaerty".lstrip('az')=="erty"

assert "$XE$".replace("$XE$", "!")=="!"
assert "$XE".replace("$XE", "!")=='!'
assert "XE$".replace("XE$", "!")=="!"
assert "XE$".replace("$", "!")=="XE!"
assert "$XE".replace("$", "!")=="!XE"
assert "?XE".replace("?", "!")=="!XE"
assert "XE?".replace("?", "!")=="XE!"
assert "XE!".replace("!", "?")=="XE?"

assert "azterty".find('t')==2
assert "azterty".rfind('t')==5
assert "azterty".rfind('p')==-1

assert "azterty".rindex('t')==5

try:
    "azterty".rindex('p')
except ValueError:
    pass

assert "azerty".rstrip('y')=="azert"
assert "azerty".rstrip('yt')=="azer"
assert "azeryty".rstrip('ty')=="azer"

assert "az er ty".split()==["az","er","ty"]
assert "azferfty".split('f')==["az","er","ty"]
assert " aBc  dEf ".split(maxsplit=1)==['aBc','dEf ']
assert " aBc  dEf ".split()==['aBc','dEf']

assert "az\ner\nty".splitlines()==["az","er","ty"]

assert "azerty".startswith('az')

assert "  azerty ".strip() == "azerty"

assert "bghggbazertyhbg".strip("bhg") == "azerty"

assert "zer".upper() == "ZER"

assert  r'(?:([\w ]+) ([\w.]+) .*\[.* ([\d.]+)\])' == (r'(?:([\w ]+) ([\w.]+) '
        '.*'
        '\[.* ([\d.]+)\])'), 'raw string continuation'

print("passed all tests...")

