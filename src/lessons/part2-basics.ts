import type { Lesson } from './types.ts'

// 初級: TSの型の基本
export const basics: Lesson[] = [
  {
    id: 'basic-annotations',
    title: '1. 型注釈とプリミティブ',
    level: '初級',
    lang: 'ts',
    explanation: `
## 型注釈とは

TypeScript では、変数や引数のあとに \`:\` を付けて「この値はこの種類しか入らない」と宣言できます。これを**型注釈**と呼びます。

\`\`\`ts
const west: number = 139.69

function move(distance: number): number {
  return distance * 2
}
\`\`\`

## なぜ書くのか

- 間違った型の値を渡したときに、実行する前にエディタが赤い波線で教えてくれる
- 関数の「入出力の約束」がコードを読む人に伝わる
- 補完が効き、プロパティ名の打ち間違いにも気づける

型注釈を書かない引数は \`any\` とみなされ、\`strict\` 設定ではエラーになります（赤い波線）。このレッスンでは、自分で注釈を付けるところから始めましょう。

## 課題

エディタ先頭のコメントに、実装する3つの関数と入出力の例を書いています。
\`add\` / \`isNorth\` / \`describe\` に引数と戻り値の型注釈を付け、中身も実装してください。
`,
    starter: `// 課題: 次の3つの関数を、型注釈を付けて実装してください
//   1) add(a, b)          : 2つの数値の合計を返す        例: add(2, 3) → 5
//   2) isNorth(lat)       : 緯度が北緯（0以上）なら true  例: isNorth(35.68) → true
//   3) describe(lat, lon) : 「35.68, 139.77」の形の文字列 例: describe(35.68, 139.77) → '35.68, 139.77'
// すべて number / boolean / string の型注釈を引数と戻り値に付けること
// ※ いまは引数の型注釈が無いので、赤い波線が出ています

function add(a, b) {
  return 0
}

function isNorth(lat) {
  return false
}

function describe(lat, lon) {
  return ''
}

console.log(add(2, 3), isNorth(35.68), describe(35.68, 139.77))
`,
    hints: [
      '`function 名前(引数: 型): 戻り値の型 { ... }` の形で書きます',
      '`add` は `return a + b`、`isNorth` は `return lat >= 0` です',
      '`describe` はテンプレートリテラル `` `${lat}, ${lon}` `` で組み立てられます',
    ],
    tests: `check('add(2, 3)', add(2, 3), 5)
check('add(10, 20)', add(10, 20), 30)
check('isNorth(35.68)', isNorth(35.68), true)
check('isNorth(-1)', isNorth(-1), false)
check('describe(35.68, 139.77)', describe(35.68, 139.77), '35.68, 139.77')`,
    solution: `function add(a: number, b: number): number {
  return a + b
}

function isNorth(lat: number): boolean {
  return lat >= 0
}

function describe(lat: number, lon: number): string {
  return \`\${lat}, \${lon}\`
}

console.log(add(2, 3), isNorth(35.68), describe(35.68, 139.77))
`,
  },
  {
    id: 'object-interface',
    title: '2. オブジェクトと interface',
    level: '初級',
    lang: 'ts',
    explanation: `
## interface でオブジェクトの形を決める

machimoki の \`frontend/src/types/api.ts\` には、実際にこういう型が定義されています。

\`\`\`ts
export interface Bounds {
  west: number
  south: number
  east: number
  north: number
}
\`\`\`

\`interface\` は「このオブジェクトはこういうプロパティを持っている」という**形（シェイプ）**を定義します。定義された形に合わないオブジェクトを代入すると、コンパイル前にエラーになります。

## 課題

いま \`const bounds: Bounds = {}\` に**赤い波線が出ているはず**です。「プロパティが足りません」というエラーです。これが interface の役割です。

必要な値はエディタ先頭のコメントに書いています。4つとも埋めて、新宿駅あたりの範囲を作ってください。
`,
    starter: `interface Bounds {
  west: number
  south: number
  east: number
  north: number
}

// 課題: Bounds の4つのプロパティをすべて埋めて、新宿駅あたりの範囲にしてください
//   west  → 139.69   （西端・経度）
//   south → 35.69    （南端・緯度）
//   east  → 139.7    （東端・経度）
//   north → 35.7     （北端・緯度）
// ※ いまはプロパティが1つも無いので「プロパティが足りない」という型エラー（赤線）が出ています
// ※ 変数名は bounds のままにしてください

const bounds: Bounds = {
}

console.log(bounds)
`,
    hints: [
      '`{ west: 139.69, south: 35.69, east: 139.7, north: 35.7 }` のように書きます',
      'プロパティの順番は自由です。カンマで区切ります',
      '値はエディタ先頭のコメントにまとめてあります',
    ],
    tests: `check('west', bounds.west, 139.69)
check('south', bounds.south, 35.69)
check('east', bounds.east, 139.7)
check('north', bounds.north, 35.7)`,
    solution: `interface Bounds {
  west: number
  south: number
  east: number
  north: number
}

const bounds: Bounds = {
  west: 139.69,
  south: 35.69,
  east: 139.7,
  north: 35.7,
}

console.log(bounds)
`,
  },
  {
    id: 'optional-null',
    title: '3. オプショナル（?）と null',
    level: '初級',
    lang: 'ts',
    explanation: `
## オプショナル（?）と null

machimoki の \`frontend/src/types/api.ts\` の \`ExportOptions\` には \`?\` 付きのプロパティがあります。

\`\`\`ts
export interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
  lod?: Lod
  includeTerrain?: boolean
  upAxis?: UpAxis
}
\`\`\`

\`lod?: Lod\` は「\`lod\` は \`Lod\` 型だが**省略してもよい**」という意味です。\`?\` を付けると、その値は \`Lod | undefined\` になります。

一方 \`frontend/src/types/pipeline.ts\` の \`PipelineState\` には \`| null\` が出てきます。

\`\`\`ts
export interface PipelineState {
  phase: PipelinePhase
  progress: number
  message: string
  error: string | null
}
\`\`\`

\`string | null\` は「文字列か \`null\` のどちらか」です。\`undefined\` と \`null\` は別物なので注意しましょう。

## なぜ ?? を使うのか

\`??\` は左側が \`null\` か \`undefined\` のときだけ右側を返します。\`||\` だと空文字や \`0\` も弾いてしまうため、\`null\` の穴埋めには \`??\` が向いています。

\`\`\`ts
const message = state.error ?? 'エラーはありません'
\`\`\`

## 課題

エディタ先頭のコメントの仕様に従って \`fallback\` と \`hasError\` を実装してください。
`,
    starter: `interface PipelineState {
  phase: 'idle' | 'error'
  error: string | null
}

const idle: PipelineState = { phase: 'idle', error: null }
const failed: PipelineState = { phase: 'error', error: '接続に失敗しました' }

// 課題: null を安全に扱う2つの関数を実装してください
//   1) fallback(message, fallbackText)
//        message が null のときは fallbackText を返す
//        message が文字列のときは message をそのまま返す（?? が使えます）
//        例: fallback(idle.error, 'エラーはありません') → 'エラーはありません'
//        例: fallback('致命的', 'エラーはありません')    → '致命的'
//   2) hasError(state)
//        state.error が null なら false、文字列なら true を返す
//        例: hasError(idle)   → false
//        例: hasError(failed) → true

function fallback(message: string | null, fallbackText: string): string {
  return ''
}

function hasError(state: PipelineState): boolean {
  return false
}

console.log(fallback(idle.error, 'エラーはありません'), hasError(failed))
`,
    hints: [
      '`message ?? fallbackText` で「null のときだけ既定値」を返せます',
      '`hasError` は `state.error !== null` を返すだけです',
      '`null` と `undefined` はどちらも `??` で拾えます',
    ],
    tests: `check('null はフォールバック', fallback(idle.error, 'エラーはありません'), 'エラーはありません')
check('文字列はそのまま', fallback('致命的', 'エラーはありません'), '致命的')
check('hasError(idle)', hasError(idle), false)
check('hasError(failed)', hasError(failed), true)`,
    solution: `interface PipelineState {
  phase: 'idle' | 'error'
  error: string | null
}

const idle: PipelineState = { phase: 'idle', error: null }
const failed: PipelineState = { phase: 'error', error: '接続に失敗しました' }

function fallback(message: string | null, fallbackText: string): string {
  return message ?? fallbackText
}

function hasError(state: PipelineState): boolean {
  return state.error !== null
}

console.log(fallback(idle.error, 'エラーはありません'), hasError(failed))
`,
  },
  {
    id: 'literal-union',
    title: '4. リテラル型とユニオン',
    level: '初級',
    lang: 'ts',
    explanation: `
## リテラル型とユニオン

machimoki の \`frontend/src/types/api.ts\` では、決まった文字列だけを許可する型が使われています。

\`\`\`ts
export type UpAxis = 'z-up' | 'y-up'
export type Lod = 'lod1' | 'lod2' | 'lod3' | 'lod4'
export type ExportFormat = '3mf' | 'stl' | 'machimoki'
\`\`\`

\`'3mf' | 'stl'\` のように \`|\` でつないだ型を**ユニオン型**と呼びます。\`ExportFormat\` にはこの3つの文字列しか入れられません。

\`ValidationResult\` の \`status\` も同じ書き方です。

\`\`\`ts
export interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
  // ...
}
\`\`\`

既存の型の一部だけを取り出すには \`ValidationResult['status']\` と書きます。

## switch による分岐

リテラル型のユニオンは、\`switch\` ですべての \`case\` を書けます。取りうる値が決まっているので、対応漏れに気づきやすいのが利点です。

## 課題

対応表はエディタ先頭のコメントにまとめています。\`formatLabel\` / \`axisLabel\` / \`statusLabel\` を \`switch\` で実装してください。
`,
    starter: `type ExportFormat = '3mf' | 'stl' | 'machimoki'
type UpAxis = 'z-up' | 'y-up'

interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
}

// 課題: リテラル型を日本語ラベルに変換する3つの関数を実装してください（switch を使う）
//   formatLabel: '3mf' → '3MF' / 'stl' → 'STL' / 'machimoki' → 'machimoki'
//   axisLabel:   'z-up' → 'Z軸アップ' / 'y-up' → 'Y軸アップ'
//   statusLabel: 'pass' → '合格' / 'warning' → '警告' / 'fail' → '不合格'

function formatLabel(format: ExportFormat): string {
  return ''
}

function axisLabel(axis: UpAxis): string {
  return ''
}

function statusLabel(status: ValidationResult['status']): string {
  return ''
}

console.log(formatLabel('3mf'), axisLabel('z-up'), statusLabel('pass'))
`,
    hints: [
      '`switch (format)` と `case \'3mf\':` で場合分けします',
      '`case` ごとに `return` でラベルを返します',
      '`status` の型は `ValidationResult[\'status\']` で取り出せます',
    ],
    tests: `check('formatLabel(3mf)', formatLabel('3mf'), '3MF')
check('formatLabel(stl)', formatLabel('stl'), 'STL')
check('formatLabel(machimoki)', formatLabel('machimoki'), 'machimoki')
check('axisLabel(z-up)', axisLabel('z-up'), 'Z軸アップ')
check('statusLabel(pass)', statusLabel('pass'), '合格')`,
    solution: `type ExportFormat = '3mf' | 'stl' | 'machimoki'
type UpAxis = 'z-up' | 'y-up'

interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
}

function formatLabel(format: ExportFormat): string {
  switch (format) {
    case '3mf':
      return '3MF'
    case 'stl':
      return 'STL'
    case 'machimoki':
      return 'machimoki'
  }
}

function axisLabel(axis: UpAxis): string {
  switch (axis) {
    case 'z-up':
      return 'Z軸アップ'
    case 'y-up':
      return 'Y軸アップ'
  }
}

function statusLabel(status: ValidationResult['status']): string {
  switch (status) {
    case 'pass':
      return '合格'
    case 'warning':
      return '警告'
    case 'fail':
      return '不合格'
  }
}

console.log(formatLabel('3mf'), axisLabel('z-up'), statusLabel('pass'))
`,
  },
  {
    id: 'function-types',
    title: '5. 関数の型とデフォルト引数',
    level: '初級',
    lang: 'ts',
    explanation: `
## 関数の型

関数は「どんな引数を受け取り、どんな値を返すか」を型で書けます。

\`\`\`ts
function makeExportOptions(
  terrainThickness: number,
  flattenBottom: boolean,
  format: ExportFormat,
): ExportOptions {
  return { terrainThickness, flattenBottom, format }
}
\`\`\`

引数リストの後ろの \`): ExportOptions\` が**戻り値の型**です。

## デフォルト引数

引数の型のあとに \`= 値\` を書くと、その引数を省略したときに値が使われます。

\`\`\`ts
function makeExportOptions(
  terrainThickness: number = 10,
  flattenBottom: boolean = true,
  format: ExportFormat = '3mf',
): ExportOptions {
  return { terrainThickness, flattenBottom, format }
}

makeExportOptions()   // 10, true, '3mf'
makeExportOptions(30) // 30, true, '3mf'
\`\`\`

## なぜデフォルト引数を使うのか

呼び出し側が指定しなかった項目を、関数側で安全な既定値にそろえられます。machimoki の API でも、リクエストに無い項目は同様に既定値で補っています（\`core/src/api/server.ts\`）。

## 課題

エディタ先頭のコメントに入出力の例を書いています。\`makeExportOptions\` のシグネチャ（引数の型・デフォルト値・戻り値の型）から自分で書いて実装してください。
`,
    starter: `type ExportFormat = '3mf' | 'stl' | 'machimoki'

interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
}

// 課題: デフォルト引数を持つ makeExportOptions を実装してください
//   makeExportOptions()                 → { terrainThickness: 10, flattenBottom: true, format: '3mf' }
//   makeExportOptions(30)               → { terrainThickness: 30, flattenBottom: true, format: '3mf' }
//   makeExportOptions(30, false)        → { terrainThickness: 30, flattenBottom: false, format: '3mf' }
//   makeExportOptions(30, false, 'stl') → { terrainThickness: 30, flattenBottom: false, format: 'stl' }
// 引数: terrainThickness(number, 既定10) / flattenBottom(boolean, 既定true) / format(ExportFormat, 既定'3mf')
// 戻り値の型: ExportOptions
// ヒント: 戻り値は { terrainThickness, flattenBottom, format } の省略記法で書けます

function makeExportOptions() {
  return {}
}

console.log(makeExportOptions())
`,
    hints: [
      '引数の形は `terrainThickness: number = 10` のように書きます',
      '`return { terrainThickness, flattenBottom, format }` でオブジェクトを返します',
      'デフォルト引数があると、`makeExportOptions(30)` のように途中まで指定できます',
    ],
    tests: `check('引数なし', makeExportOptions(), { terrainThickness: 10, flattenBottom: true, format: '3mf' })
check('第1引数だけ', makeExportOptions(30), { terrainThickness: 30, flattenBottom: true, format: '3mf' })
check('第2引数まで', makeExportOptions(30, false), { terrainThickness: 30, flattenBottom: false, format: '3mf' })
check('全部指定', makeExportOptions(30, false, 'stl'), { terrainThickness: 30, flattenBottom: false, format: 'stl' })`,
    solution: `type ExportFormat = '3mf' | 'stl' | 'machimoki'

interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
}

function makeExportOptions(
  terrainThickness: number = 10,
  flattenBottom: boolean = true,
  format: ExportFormat = '3mf',
): ExportOptions {
  return { terrainThickness, flattenBottom, format }
}

console.log(makeExportOptions())
`,
  },
  {
    id: 'narrowing',
    title: '6. 型の絞り込み（typeof / in / never）',
    level: '初級',
    lang: 'ts',
    explanation: `
## ユニオン型を絞り込む

\`string | number\` のようなユニオン型は、\`typeof\` で実際の型を判定できます。

\`\`\`ts
function toLength(value: string | number): number {
  if (typeof value === 'string') return Number(value) // ここでは value は string
  return value // ここでは value は number
}
\`\`\`

条件分岐の中では型が自動的に狭まります。これを**型の絞り込み（narrowing）**と呼びます。

## in 演算子

オブジェクトの形は \`in\` 演算子で判定できます。

\`\`\`ts
if ('text' in value) {
  return value.text // value は { text: string } に絞り込まれる
}
\`\`\`

## never による網羅チェック

すべての場合を処理し終えると、残った値の型は \`never\` になります。ここで型エラーになれば「処理の漏れ」に気づけます。

\`\`\`ts
if (typeof value === 'string') return value
if (typeof value === 'number') return String(value)
if ('text' in value) return value.text
if ('value' in value) return String(value.value)
const exhaustive: never = value // 漏れがあれば型エラーになる
\`\`\`

## 課題

エディタ先頭のコメントに入出力の例を書いています。\`typeof\` と \`in\` で絞り込みながら \`normalize\` を実装してください。
`,
    starter: `type ValidateInput = string | number | { text: string } | { value: number }

// 課題: normalize(value) を実装してください（typeof と in で型を絞り込む）
//   normalize('abc')          → 'abc'
//   normalize(12)             → '12'
//   normalize(-3.5)           → '-3.5'
//   normalize({ text: 'ok' }) → 'ok'
//   normalize({ value: 7 })   → '7'
// 仕様: 文字列はそのまま / 数値は String(value) / { text } は text / { value } は String(value.value)
// ヒント: 4パターンすべてを if で処理すると、最後に残る値の型は never になります

function normalize(value: ValidateInput): string {
  return ''
}

console.log(normalize('abc'), normalize(12), normalize({ text: 'ok' }))
`,
    hints: [
      '`typeof value === \'string\'` で文字列だけに絞り込めます',
      'オブジェクトの形は `in` 演算子で判定します（`\'text\' in value`）',
      '最後の1行 `const exhaustive: never = value` は、漏れが無いことの確認になります',
    ],
    tests: `check('文字列', normalize('abc'), 'abc')
check('数値', normalize(12), '12')
check('小数と負の数', normalize(-3.5), '-3.5')
check('{ text }', normalize({ text: 'ok' }), 'ok')
check('{ value }', normalize({ value: 7 }), '7')`,
    solution: `type ValidateInput = string | number | { text: string } | { value: number }

function normalize(value: ValidateInput): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if ('text' in value) return value.text
  if ('value' in value) return String(value.value)
  const exhaustive: never = value
  return exhaustive
}

console.log(normalize('abc'), normalize(12), normalize({ text: 'ok' }))
`,
  },
]
