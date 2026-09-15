import type { Lesson } from './types.ts'

// 入門: プログラミング未経験者向け
export const intro: Lesson[] = [
  {
    id: 'intro-values',
    title: '1. 値と表示',
    level: '入門',
    lang: 'ts',
    explanation: `
## 値には種類がある

プログラミングで扱うデータの種類のことを**型**と呼びます。まずはよく使う3つを覚えましょう。

- **数値（number）**: \`25\` や \`-3.5\` のように、計算できる値
- **文字列（string）**: \`'こんにちは'\` のように \`'\` や \`"\` で囲んだ文字の並び
- **真偽値（boolean）**: \`true\` か \`false\` の2つだけの値

## 表示する

書いた値や計算結果を確認するには \`console.log\` を使います。エディタの「実行」ボタンを押すと、下の出力欄に結果が見えます。プログラムは上から順に実行されるので、\`console.log\` を書いた場所でその時点の値が表示されます。

## 文字列に値を埋め込む

文字列と値を組み合わせるには、**テンプレートリテラル**が便利です。バッククォート \`\` \` \`\` で囲み、\`\${式}\` と書いた場所に値が埋め込まれます。

\`\`\`ts
const name = '佐藤'
console.log(\`こんにちは、\${name}さん\`)
\`\`\`

## 型注釈は今はおまじないで OK

\`function greet(name: string): string\` の \`string\` は「引数 name は文字列」「戻り値も文字列」という宣言です。今は「おまじない」として書いておけば大丈夫です。なぜ書くのかは初級の「型注釈とプリミティブ」で詳しく学びます。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`greet\` と \`temperature\` の中身を実装してください。
`,
    starter: `// 課題: 次の2つの関数を実装してください
//   1) greet(name: string): string
//        name を含むあいさつ文を返す
//        例: greet('佐藤') → 'こんにちは、佐藤さん'
//   2) temperature(celsius: number): string
//        気温を表す文を返す
//        例: temperature(25) → '気温は25度です'
// ヒント: 文字列に値を埋め込むときは テンプレートリテラル（バッククォートで囲み \${式}）を使います

function greet(name: string): string {
  return ''
}

function temperature(celsius: number): string {
  return ''
}

console.log(greet('佐藤'), temperature(25))
`,
    expected: 'こんにちは、佐藤さん 気温は25度です',
    hints: [
      '`\'こんにちは、\' + name + \'さん\'` のように `+` でつなげる書き方もあります',
      'テンプレートリテラルはバッククォートで囲み、`${name}` の場所に値を埋め込みます',
      '`temperature` でも同じで、`celsius` を文の中に埋め込みます',
    ],
    tests: `check('greet(佐藤)', greet('佐藤'), 'こんにちは、佐藤さん')
check('greet(田中)', greet('田中'), 'こんにちは、田中さん')
check('temperature(25)', temperature(25), '気温は25度です')
check('temperature(0)', temperature(0), '気温は0度です')`,
    solution: `function greet(name: string): string {
  return \`こんにちは、\${name}さん\`
}

function temperature(celsius: number): string {
  return \`気温は\${celsius}度です\`
}

console.log(greet('佐藤'), temperature(25))
`,
  },
  {
    id: 'intro-variables',
    title: '2. 変数と計算',
    level: '入門',
    lang: 'ts',
    explanation: `
## 変数は値を入れる箱

\`const\` と \`let\` は、どちらも値を入れる箱（変数）を作ります。

\`\`\`ts
const price = 120 // あとから入れ替えない値
let count = 3 // あとから入れ替える値
count = count + 1 // let は再代入できる
\`\`\`

- \`const\`: 一度決めたら**再代入できない**。値を変えないつもりならこちらを使う
- \`let\`: 再代入できる。カウントアップなど、あとで値を変えたいときだけ使う

迷ったら \`const\` にしておくと、意図せず値を書き換えてしまうバグを防げます。使い分けの感覚は、この後のレッスンのループで身につきます。

## 計算する

数値は \`+\` \`-\` \`*\` \`/\` で計算できます。\`*\` はかけ算、\`/\` はわり算です。計算結果は \`const area = width * height\` のように変数に入れておくと、あとで使い回せます。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`area\` と \`total\` を実装してください。
`,
    starter: `// 課題: 次の2つの関数を実装してください
//   1) area(width: number, height: number): number
//        長方形の面積を返す
//        例: area(3, 4) → 12
//   2) total(price: number, count: number): number
//        単価×個数の合計金額を返す
//        例: total(120, 3) → 360

function area(width: number, height: number): number {
  return 0
}

function total(price: number, count: number): number {
  return 0
}

console.log(area(3, 4), total(120, 3))
`,
    expected: '12 360',
    hints: [
      '面積は「横 × 高さ」なので `return width * height` です',
      '合計金額は「単価 × 個数」なので `return price * count` です',
      '計算結果を一度 `const result = ...` に入れてから `return result` してもかまいません',
    ],
    tests: `check('area(3, 4)', area(3, 4), 12)
check('area(5, 6)', area(5, 6), 30)
check('total(120, 3)', total(120, 3), 360)
check('total(100, 0)', total(100, 0), 0)`,
    solution: `function area(width: number, height: number): number {
  return width * height
}

function total(price: number, count: number): number {
  return price * count
}

console.log(area(3, 4), total(120, 3))
`,
  },
  {
    id: 'intro-if',
    title: '3. 条件分岐',
    level: '入門',
    lang: 'ts',
    explanation: `
## 条件で分ける

\`if\` は「もし〜なら」を表します。

\`\`\`ts
if (celsius <= 0) {
  return true
}
return false
\`\`\`

\`if (...)\` の中には \`true\` / \`false\` になる式を書きます。大小を比べるには次の記号を使います。

| 記号 | 意味 |
| --- | --- |
| \`a > b\` | a は b より大きい |
| \`a < b\` | a は b より小さい |
| \`a >= b\` | a は b 以上 |
| \`a <= b\` | a は b 以下 |
| \`a === b\` | a と b は等しい |

\`=\` は代入、\`===\` は比較です。混同しないようにしましょう。

## else で分ける

\`if\` に当てはまらない場合を書くには \`else if\` / \`else\` をつなげます。3つ以上に分かれるときは上から順に判定されるので、順番が大切です。

## boolean を返す関数

\`return celsius <= 0\` のように、比較式そのものを返すと短く書けます。「条件に合うかどうか」を返す関数はよく登場します。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`hemisphere\` と \`isFreezing\` を実装してください。
`,
    starter: `// 課題: 次の2つの関数を実装してください
//   1) hemisphere(lat: number): string
//        緯度が正なら '北半球'、負なら '南半球'、0 なら '赤道' を返す
//        例: hemisphere(35.68) → '北半球'
//        例: hemisphere(-33.9) → '南半球'
//        例: hemisphere(0)     → '赤道'
//   2) isFreezing(celsius: number): boolean
//        気温が0度以下なら true、そうでなければ false を返す
//        例: isFreezing(0) → true
//        例: isFreezing(5) → false

function hemisphere(lat: number): string {
  return ''
}

function isFreezing(celsius: number): boolean {
  return false
}

console.log(hemisphere(35.68), isFreezing(0))
`,
    expected: '北半球 true',
    hints: [
      '`if (lat > 0)` で北半球、`if (lat < 0)` で南半球を返し、残りを赤道にします',
      '`else if` を使わず、`if` を2つ並べて最後に `return \'赤道\'` でもかまいません',
      '`isFreezing` は `return celsius <= 0` の1行で書けます',
    ],
    tests: `check('hemisphere(35.68)', hemisphere(35.68), '北半球')
check('hemisphere(-33.9)', hemisphere(-33.9), '南半球')
check('hemisphere(0)', hemisphere(0), '赤道')
check('isFreezing(0)', isFreezing(0), true)
check('isFreezing(5)', isFreezing(5), false)`,
    solution: `function hemisphere(lat: number): string {
  if (lat > 0) {
    return '北半球'
  }
  if (lat < 0) {
    return '南半球'
  }
  return '赤道'
}

function isFreezing(celsius: number): boolean {
  return celsius <= 0
}

console.log(hemisphere(35.68), isFreezing(0))
`,
  },
  {
    id: 'intro-loops-arrays',
    title: '4. 配列と繰り返し',
    level: '入門',
    lang: 'ts',
    explanation: `
## 配列

複数の値を順番にまとめたものを**配列**と呼びます。\`[1, 2, 3]\` のように \`[]\` で囲んで書きます。要素の個数は \`.length\` でわかります。

\`\`\`ts
const values = [1, 2, 3]
console.log(values.length) // 3
console.log(values[0]) // 1（先頭は 0 番目）
\`\`\`

## for-of で1つずつ見る

\`for (const value of values)\` と書くと、配列の要素を先頭から1つずつ取り出して繰り返せます。

\`\`\`ts
for (const value of values) {
  console.log(value)
}
\`\`\`

## 集計のパターン: 初期値 + ループ

合計や個数を求めるときは、**先に初期値を用意して、ループの中で足し込む**のが基本パターンです。

\`\`\`ts
let total = 0
for (const value of values) {
  total = total + value
}
\`\`\`

数えるときも同じで、条件に合ったときだけ \`count = count + 1\` します。ループの中で値を書き換えるので、ここでは \`let\` を使います。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`sum\` と \`countPositive\` を「初期値 + ループ」で実装してください。
`,
    starter: `// 課題: 次の2つの関数を実装してください
//   1) sum(values: number[]): number
//        配列の合計を返す
//        例: sum([1, 2, 3]) → 6
//        例: sum([])        → 0
//   2) countPositive(values: number[]): number
//        0より大きい値の個数を返す
//        例: countPositive([1, -2, 3]) → 2
//        例: countPositive([])         → 0
// ヒント: どちらも「初期値 0 の変数を用意し、for-of で回して足し込む」形です

function sum(values: number[]): number {
  return 0
}

function countPositive(values: number[]): number {
  return 0
}

console.log(sum([1, 2, 3]), countPositive([1, -2, 3]))
`,
    expected: '6 2',
    hints: [
      '`let total = 0` を用意し、`for (const value of values)` の中で `total = total + value` します',
      '`countPositive` は `if (value > 0)` のときだけ `count = count + 1` します',
      '空配列のときはループが1回も回らないので、初期値の 0 がそのまま返ります',
    ],
    tests: `check('sum([1, 2, 3])', sum([1, 2, 3]), 6)
check('sum([])', sum([]), 0)
check('countPositive([1, -2, 3])', countPositive([1, -2, 3]), 2)
check('countPositive([])', countPositive([]), 0)`,
    solution: `function sum(values: number[]): number {
  let total = 0
  for (const value of values) {
    total = total + value
  }
  return total
}

function countPositive(values: number[]): number {
  let count = 0
  for (const value of values) {
    if (value > 0) {
      count = count + 1
    }
  }
  return count
}

console.log(sum([1, 2, 3]), countPositive([1, -2, 3]))
`,
  },
  {
    id: 'intro-functions',
    title: '5. 関数',
    level: '入門',
    lang: 'ts',
    explanation: `
## 関数は処理に名前を付けたもの

同じ処理を何度も書かずに済むよう、ひとまとまりの処理に名前を付けたものが**関数**です。

\`\`\`ts
function double(value: number): number {
  return value * 2
}
\`\`\`

- 引数: 関数に渡す値（ここでは \`value\`）
- 戻り値: \`return\` で返す値

\`return\` を書いた時点で関数は終わり、呼び出し元に値が返ります。戻り値を使わずに画面に出すだけなら \`console.log(...)\` を呼びます。

## 組み合わせて使う

関数は他の関数の結果を受け取れます。小さな部品を組み合わせると、見通しよく書けます。すでに学んだ \`sum\` や \`repeat\` のような関数も、中の処理を自分で書けるようになりましょう。

文字列を繰り返しつなげるときは、空文字 \`''\` から始めてループで足していきます（前のレッスンの「初期値 + ループ」と同じ考え方です）。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`repeat\` と \`joinWith\` を実装してください。
`,
    starter: `// 課題: 次の2つの関数を実装してください
//   1) repeat(text: string, count: number): string
//        text を count 回つなげた文字列を返す
//        例: repeat('ab', 3) → 'ababab'
//        例: repeat('x', 0)  → ''
//   2) joinWith(items: string[], separator: string): string
//        配列の要素を separator で区切ってつなげた文字列を返す
//        例: joinWith(['a', 'b', 'c'], '-') → 'a-b-c'
//        例: joinWith([], '-')             → ''
// ヒント: どちらも空文字 '' から始めて、ループで文字をつなげていきます

function repeat(text: string, count: number): string {
  return ''
}

function joinWith(items: string[], separator: string): string {
  return ''
}

console.log(repeat('ab', 3), joinWith(['a', 'b', 'c'], '-'))
`,
    expected: 'ababab a-b-c',
    hints: [
      '`let result = \'\'` を用意し、`text` の回数だけ `result = result + text` します',
      '回数を数えるには `for (let i = 0; i < count; i++)` が使えます',
      '`joinWith` は「2個目以降の前に区切り文字を足す」と `a-b-c` になります（`i > 0` で判定）',
    ],
    tests: `check('repeat(ab, 3)', repeat('ab', 3), 'ababab')
check('repeat(x, 0)', repeat('x', 0), '')
check('joinWith(a b c, -)', joinWith(['a', 'b', 'c'], '-'), 'a-b-c')
check('joinWith(空, -)', joinWith([], '-'), '')`,
    solution: `function repeat(text: string, count: number): string {
  let result = ''
  for (let i = 0; i < count; i++) {
    result = result + text
  }
  return result
}

function joinWith(items: string[], separator: string): string {
  let result = ''
  for (let i = 0; i < items.length; i++) {
    if (i > 0) {
      result = result + separator
    }
    result = result + items[i]
  }
  return result
}

console.log(repeat('ab', 3), joinWith(['a', 'b', 'c'], '-'))
`,
  },
  {
    id: 'intro-capstone',
    title: '6. 総合演習',
    level: '入門',
    lang: 'ts',
    explanation: `
## これまでの組み合わせ

総合演習では、配列・条件・計算・文字列を組み合わせます。新しい文法はありません。落ち着いて、次の順番で組み立てましょう。

1. 数える用の変数を初期値付きで用意する（例: 北緯の数は \`0\` から）
2. 配列を \`for-of\` で回し、\`if\` で条件ごとに数える
3. 最後にテンプレートリテラルで1つの文字列にまとめて返す

\`\`\`ts
let north = 0
for (const lat of lats) {
  if (lat >= 0) {
    north = north + 1
  }
}
return \`\${lats.length}地点 / 北緯\${north} / ...\`
\`\`\`

## 「数える」は前のレッスンと同じ形

条件に合ったときだけ \`+ 1\` する形は、レッスン4の \`countPositive\` とまったく同じです。違うのは条件と、最後に文字列へまとめるところだけです。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`summarize\` を実装してください。
`,
    starter: `// 課題: summarize(lats: number[]): string を実装してください
//   緯度の配列を集計して、次の形の文字列を返す
//     「地点数 / 北緯の数 / 南緯の数」
//   北緯: lat >= 0、南緯: lat < 0
//   例: summarize([35.68, -33.9, 0]) → '3地点 / 北緯2 / 南緯1'
//   例: summarize([-1, -2])          → '2地点 / 北緯0 / 南緯2'
//   例: summarize([])                → '0地点 / 北緯0 / 南緯0'

function summarize(lats: number[]): string {
  return ''
}

console.log(summarize([35.68, -33.9, 0]))
`,
    expected: '3地点 / 北緯2 / 南緯1',
    hints: [
      '北緯用と南緯用に `let north = 0` `let south = 0` の2つの変数を用意します',
      '`if (lat >= 0)` なら北緯、そうでなければ南緯として数えます',
      '地点数はループで数えなくても `lats.length` で求められます',
    ],
    tests: `check('3地点', summarize([35.68, -33.9, 0]), '3地点 / 北緯2 / 南緯1')
check('南緯のみ', summarize([-1, -2]), '2地点 / 北緯0 / 南緯2')
check('空', summarize([]), '0地点 / 北緯0 / 南緯0')`,
    solution: `function summarize(lats: number[]): string {
  let north = 0
  let south = 0
  for (const lat of lats) {
    if (lat >= 0) {
      north = north + 1
    } else {
      south = south + 1
    }
  }
  return \`\${lats.length}地点 / 北緯\${north} / 南緯\${south}\`
}

console.log(summarize([35.68, -33.9, 0]))
`,
  },
]
