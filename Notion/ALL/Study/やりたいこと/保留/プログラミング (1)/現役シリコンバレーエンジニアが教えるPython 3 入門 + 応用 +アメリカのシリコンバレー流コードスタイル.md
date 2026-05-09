---
notion_id: 2a811a71-fda7-81df-a280-edfe6658adfa
created: 2025-11-11
---

[https://chatgpt.com/](https://chatgpt.com/)
[https://gemini.google.com/app](https://gemini.google.com/app)
[https://www.perplexity.ai/](https://www.perplexity.ai/)
[https://pythontutor.com/render.html#mode=edit](https://pythontutor.com/render.html#mode=edit)

- **環境構築**
  C:\Users\tomot\anaconda3


# Pythonの基本

```javascript
num = 1;
name = 'Mike'
is_ok = True

print(num, type(num))
print(name, type(name))
print(is_ok, type(is_ok))
```
実行結果
```javascript
1 <class 'int'>
Mike <class 'str'>
True <class 'bool'>
```

このように、Cのように変数型を宣言しなくても勝手にPythonはやってくれる
type関数で変数型が分かる

```javascript
print('Hi')
print('Hi', 'Mike', sep=', ')

print('Hi', 'Mike', sep=',', end='.\n')
print('Hi', 'Mike', sep=',', end='\n')
```
実行結果
```javascript
Hi
Hi, Mike

Hi,Mike.
Hi,Mike
```

基本的な計算はCと同じ
ターミナル上でpythonと叩くと、対話型シェルになる
```javascript
3 + 3
Out[5]: 6

type(1.6)
Out[6]: float


17 / 3
Out[7]: 5.666666666666667
17 // 3
Out[8]: 5
17 % 3
Out[9]: 2


5 * 5 * 5 * 5
Out[10]: 625
5 ** 4
Out[11]: 625


x = 5
x
Out[15]: 5
y = 3
y
Out[17]: 3
x * y
Out[18]: 15


pie = 3.1415926535
pie
Out[21]: 3.1415926535
round(pie, 3) //下三桁でまるめてくれる
Out[22]: 3.142
```

mathをインポートすることで、数学関数を利用できる
```javascript
import math

result = math.sqrt(25)
print(result)

print(help(math))
```
実行結果
```javascript
5.0
```

C言語のmanにあたるのはhelp関数
```javascript


Help on module math:

NAME
    math

MODULE REFERENCE
    https://docs.python.org/3.11/library/math.html
    
    The following documentation is automatically generated from the Python
    source files.  It may be incomplete, incorrect or include features that
    are considered implementation detail and may vary between Python
    implementations.  When in doubt, consult the module reference at the
    location listed above.

DESCRIPTION
    This module provides access to the mathematical functions
    defined by the C standard.

FUNCTIONS
    acos(x, /)
        Return the arc cosine (measured in radians) of x.
        
        The result is between 0 and pi.
...
```

```javascript
word = 'python'
n = len(word)
print(n)

//6と出力される
```


###  文字列
```javascript
s = 'My name is Mike. Hi Mike.'
print(s)
is_start = s.startswith('My')
print(is_start)
is_start = s.startswith('X')
print(is_start)

print("###############")

print(s.find('Mike'))
print(s.rfind('Mike'))
print(s.count('Mike'))
print(s.capitalize())
print(s.title())
print(s.upper())
print(s.lower())
print(s.replace('Mike', 'Nancy'))

```
実行結果
```javascript
My name is Mike. Hi Mike.
True
False
###############
11
20
2
My name is mike. hi mike.
My Name Is Mike. Hi Mike.
MY NAME IS MIKE. HI MIKE.
my name is mike. hi mike.
My name is Nancy. Hi Nancy.

```


### 文字列の代入
```javascript
>>> 'a is {}'.format('a')
'a is a'
>>> 'a is {}'.format('test')
'a is test'
>>> 'a is {} {} {}'.format(1, 2, 3)
'a is 1 2 3'
>>> 'a is {0} {1} {2}'.format(1, 2, 3)
'a is 1 2 3'
>>> 'a is {2} {1} {0}'.format(1, 2, 3)
'a is 3 2 1'
>>> 'My name is {0} {1}'.format('Jun', 'Sakai')
'My name is Jun Sakai'
>>> 'My name is {0} {1}. Watashi ha {1} {0}'.format('Jun', 'Sakai')
'My name is Jun Sakai. Watashi ha Sakai Jun'
>>> 'My name is {name} {family}. Watashi ha {family} {name}'.format(name='Jun', family='Sakai')
'My name is Jun Sakai. Watashi ha Sakai Jun'
>>> 1
1
>>> '1'
'1'
>>> str(1)
'1'
>>> x = str(1)
>>> type(x)
<class 'str'>
>>> str(3.14)
'3.14'
>>> str(True)
'True'

```


### リスト型
```javascript
>>> l = [1, 20, 4, 50, 2, 1, 2]
>>> l
[1, 20, 4, 50, 2, 1, 2]
>>> l[0]
1
>>> l[1]
20
>>> l[-1]
2
>>> l[-2]
1
>>> l[0:2]
[1, 20]
>>> l[:2]
[1, 20]
>>> l[2:5]
[4, 50, 2]
>>> l[2:]
[4, 50, 2, 1, 2]
>>> l[:]
[1, 20, 4, 50, 2, 1, 2]
>>> len(l)
7
>>> type(l)
<class 'list'>
```

Python
`>>> list('abcdefg')
['a', 'b', 'c', 'd', 'e', 'f', 'g']`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 文字列'abcdefg'をリストに変換し、各文字が要素となったリストを出力しています。
Python
`>>> l
[1, 20, 4, 50, 2, 1, 2]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 変数lにすでにリストが代入されていることを示しています。
Python
`>>> 1[100]
Traceback (most recent call last):

File "<stdin>", line 1, in <module>
IndexError: list index out of range`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 整数1はリストではないため、要素にアクセスしようとした際にエラーが発生しています。
Python
`>>> n = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 変数nに1から10までの整数のリストを代入しています。
Python
`>>> n
[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 変数nの中身を表示しています。
Python
`>>> n[::2]
[1, 3, 5, 7, 9]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- リストnから、先頭から最後まで、2つ飛ばしで要素を取り出した新しいリストを作成しています。
Python
`>>> n[::-1]
[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- リストnの要素を逆順に並べた新しいリストを作成しています。
Python
`>>> a = ['a', 'b', 'c']
>>> n = [1, 2, 3]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 変数aとnにそれぞれ文字列のリストと整数のリストを代入しています。
Python
`>>> x = [a, n]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 変数aとnのリストを要素とする新たなリストをxに代入しています。つまり、xはネストされたリストになります。
Python
`>>> x
[['a', 'b', 'c'], [1, 2, 3]]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- 変数xの中身を表示しています。
Python
`>>> x [0]
['a', 'b', 'c']`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- リストxの最初の要素（リストa）を取り出しています。
Python
`>>> x[1]
[1, 2, 3]`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- リストxの2番目の要素（リストn）を取り出しています。
Python
`>>> x[0] [1]
'b'`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- リストxの最初の要素（リストa）の2番目の要素を取り出しています。
Python
`>>> x [1] [2]
3`
コードは[注意](https://www.notion.so/faq#coding)してご使用ください。
- リストxの2番目の要素（リストn）の3番目の要素を取り出しています。
**まとめ**
このコードは、Pythonのリストの基本的な操作を網羅しており、リストの作成、要素へのアクセス、スライシング、ネストされたリストの扱い方など、Pythonプログラミングの基礎を学ぶ上で非常に良い例となります。
**補足**
- `>>>` はPythonの対話型インタプリタのプロンプトです。
- `[]` はリストを表します。
- `:` はスライシングに用いられます。
**より詳しく知りたい場合**
Pythonのリストについてさらに詳しく知りたい場合は、以下のキーワードで検索してみてください。
- Python リスト
- Python スライシング
- Python ネストされたリスト


### リストの操作

### コードの行ごとの解説
1. **`n = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]`**
  - 変数`n`に、1から10までの整数を要素とするリストを代入しています。
1. **`n.append(100)`**
  - リスト`n`の末尾に、要素100を追加しています。
1. **`n.insert(0, 200)`**
  - リスト`n`の先頭（インデックス0）に、要素200を挿入しています。
1. **`n.pop()`**
  - リスト`n`の末尾の要素を削除し、その値を返します。この場合、100が削除され、戻り値として100が表示されます。
1. **`n.pop(0)`**
  - リスト`n`の先頭の要素を削除し、その値を返します。この場合、200が削除され、戻り値として200が表示されます。
1. **`del n[8]`**
  - リスト`n`のインデックス8の要素（9番目の要素）を削除します。
1. **`del n`**
  - 変数`n`自体を削除します。そのため、次の行で`n`を参照しようとするとエラーが発生します。
1. **`n = [1, 2, 3]`**
  - 変数`n`に、新しいリストを代入することで、変数`n`を再利用しています。
1. **`n.remove(2)`**
  - リスト`n`から、値が2の要素を一つ削除します。


### コードの行ごとの解説
1. **`n.remove(2)`**
  - 変数`n`が指すリストから、値が2の要素を削除しようとしています。しかし、この行を実行するとエラーが発生しています。これは、`n`という変数が定義されていないか、または`n`が指すリストに値2の要素が含まれていないためです。
1. **`a = [1, 2, 3, 4, 5]`**
  - 変数`a`に、要素が1から5までのリストを代入しています。
1. **`b = [6, 7, 8, 9, 10]`**
  - 変数`b`に、要素が6から10までのリストを代入しています。
1. **`x = a + b`**
  - リスト`a`と`b`の内容を結合し、新しいリストを作成して変数`x`に代入しています。
1. **`a + b`**
  - リスト`a`と`b`を結合した新しいリストを作成しますが、変数に代入していないため、結果は表示されません。
1. **`a += b`**
  - リスト`b`の内容をリスト`a`に結合し、結果をリスト`a`に代入しています。つまり、リスト`a`の内容が変更されます。
1. **`x = y = [1, 2, 3, 4, 5]`**
  - 変数`x`と`y`に、同じリストを代入しています。
1. **`x.extend(y)`**
  - リスト`y`の内容をリスト`x`の末尾に追加しています。

このコードは、リストの作成、要素の削除（エラー例）、リストの結合、リストのコピーなど、Pythonのリストの基本的な操作を示しています。

### 重要なポイント
- **リストの変更:** リストは変更可能なデータ構造なので、要素の追加、削除、変更を行うことができます。
- **リストの結合:** `+`演算子や`extend()`メソッドを使って、リストを結合することができます。
- **リストのコピー:** `=`で代入すると、元のリストへの参照がコピーされるため、一方を変更するともう一方も変更されます。スライスを使ってコピーを作成すれば、独立したコピーを作成できます。


### リストのメソッド

```javascript
r = [1, 2, 3, 4, 5, 1, 2, 3]

print(r.index(3))
print(r.count(3))

if 100 in r:
    print('exist')

r.sort()
print(r)
r.sort(reverse=True)
print(r)
r.reverse()
print(r)

s = 'My name is Mike.'
to_split = s.split(' ')
print(to_split)

x = ' '.join(to_split)
print(x)

実行結果
2
3
[1, 1, 2, 2, 3, 3, 4, 5]
[5, 4, 3, 3, 2, 2, 1, 1]
[1, 1, 2, 2, 3, 3, 4, 5]
['My', 'name', 'is', 'Mike.']
My ####### name ####### is ####### Mike.
```

```javascript
i = [1, 2, 3, 4, 5]
j = i
j = [100]
print('j', j)
print('1', 1)

x = [1, 2, 3, 4, 5]
y = x.copy()
y[0] = 100
print('y', y)
print('x', x)

X = 20
Y = X
print(id(X))
print(id(Y))
print(Y)
print(X)

X = ['a', 'b']
Y = X
Y[0] = 'p'
print(id(X))
print(id(Y))
print(Y)
print(X)
```


### リストの使い所
```javascript
j = [100, 2, 3, 4, 5]
i = [100, 2, 3, 4, 5]
y = [100, 2, 3, 4, 5]
x = [1, 2, 3, 4, 5]

4369853008
4369852528
5
20
4373915784
4373915784
['p', 'b']
['p', 'b']
```


### タプル型


### タプルのアンパッキング

