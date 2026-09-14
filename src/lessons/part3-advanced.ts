import type { Lesson } from './types.ts'

// 上級・型の応用
export const advanced: Lesson[] = [
  {
    id: 'generics-intro',
    title: '1. ジェネリクス入門',
    level: '上級',
    lang: 'ts',
    explanation: `
## ジェネリクスとは

\`Array<T>\` は「\`T\` 型の配列」を表します。\`T\` の部分は使うときに決まります。

\`\`\`ts
const numbers: Array<number> = [3, 1, 4] // number の配列
const names: Array<string> = ['3mf', 'stl'] // string の配列
\`\`\`

\`Promise<T>\` も同じで、「\`T\` 型の値が後で手に入る」という意味です。

\`\`\`ts
const pending: Promise<number> = Promise.resolve(1)
\`\`\`

## ジェネリック関数

型を引数のように受け取る関数を**ジェネリック関数**と呼びます。関数名の後ろに \`<T>\` を書きます。

\`\`\`ts
function first<T>(items: T[]): T | undefined {
  return items[0]
}
\`\`\`

\`number[]\` を渡せば \`number | undefined\`、\`string[]\` を渡せば \`string | undefined\` を返します。同じ実装でどんな型にも使えます。

## 課題

エディタ先頭のコメントに入出力の例を書いています。\`first\` と \`last\` を、ジェネリック関数として実装してください。
`,
    starter: `const numbers: Array<number> = [3, 1, 4]
const names: Array<string> = ['3mf', 'stl']

// 課題: 配列の先頭と末尾を返すジェネリック関数を実装してください
//   first(numbers) → 3 / first(names) → '3mf' / first<number>([]) → undefined
//   last(numbers)  → 4 / last(names)  → 'stl'
// 型の形: first<T>(items: T[]): T | undefined （last も同じ形）
// Array<T> の T のように、呼び出し側で型が決まるのがジェネリクスです
// ※ いまは型注釈が無いので赤い波線が出ています

function first(items) {
  return undefined
}

function last(items) {
  return undefined
}

console.log(first(numbers), last(names))
`,
    hints: [
      '`function first<T>(items: T[]): T | undefined` と宣言します',
      '先頭は `items[0]`、末尾は `items[items.length - 1]` です',
      '空配列のときの `items[0]` は `undefined` になります',
    ],
    tests: `check('first(numbers)', first(numbers), 3)
check('first(names)', first(names), '3mf')
check('空配列は undefined', first<number>([]), undefined)
check('last(numbers)', last(numbers), 4)
check('last(names)', last(names), 'stl')`,
    solution: `const numbers: Array<number> = [3, 1, 4]
const names: Array<string> = ['3mf', 'stl']

function first<T>(items: T[]): T | undefined {
  return items[0]
}

function last<T>(items: T[]): T | undefined {
  return items[items.length - 1]
}

console.log(first(numbers), last(names))
`,
  },
  {
    id: 'utility-types',
    title: '2. ユーティリティ型（Pick / Partial / Record）',
    level: '上級',
    lang: 'ts',
    explanation: `
## ユーティリティ型

TypeScript には、既存の型から別の型を作る**ユーティリティ型**が標準で用意されています。

\`Pick<T, K>\` は \`T\` から \`K\` のプロパティだけを取り出します。

\`\`\`ts
type ExportBase = Pick<ExportOptions, 'terrainThickness' | 'flattenBottom' | 'format'>
\`\`\`

\`Partial<T>\` はすべてのプロパティを省略可能にします。組み合わせると「フォームで一部だけ編集する」型が作れます。

\`\`\`ts
type ExportForm = Partial<Pick<ExportOptions, 'terrainThickness' | 'flattenBottom' | 'format'>>
\`\`\`

\`Record<K, V>\` は「キーが \`K\`、値が \`V\` のオブジェクト」です。ユニオン型のキーを全部そろえるのに便利です。

\`\`\`ts
const labels: Record<ExportFormat, string> = {
  '3mf': '3MF',
  stl: 'STL',
  machimoki: 'machimoki',
}
\`\`\`

## なぜ使うのか

フォームが扱う項目だけを型にすれば、\`buildingColor\` のような関係ない項目をうっかり含めてしまうのを防げます。

## 課題

エディタ先頭のコメントの仕様に従って、\`ExportForm\` の定義・\`toForm\` の実装・\`formatLabels\` の実装をしてください。
`,
    starter: `type ExportFormat = '3mf' | 'stl' | 'machimoki'

interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
  buildingColor?: string
}

// 課題: フォーム用の型とロジックを実装してください
//   1) ExportForm を
//      Partial<Pick<ExportOptions, 'terrainThickness' | 'flattenBottom' | 'format'>>
//      で定義する（3項目すべて省略可能にする）
//   2) toForm(options): options から上の3項目だけを取り出して返す
//        例: toForm({ terrainThickness: 10, flattenBottom: true, format: 'stl' })
//            → { terrainThickness: 10, flattenBottom: true, format: 'stl' }
//        buildingColor は含めない
//   3) formatLabels を Record<ExportFormat, string> で定義し、次のラベルを入れる
//        '3mf' → '3MF' / 'stl' → 'STL' / 'machimoki' → 'machimoki'

type ExportForm = {}

function toForm(options: ExportOptions): ExportForm {
  return {}
}

const formatLabels: Record<ExportFormat, string> = {
  '3mf': '',
  stl: '',
  machimoki: '',
}

const sample: ExportOptions = {
  terrainThickness: 10,
  flattenBottom: true,
  format: 'stl',
  buildingColor: '#ffffff',
}

console.log(toForm(sample), formatLabels)
`,
    hints: [
      '`type ExportForm = Partial<Pick<ExportOptions, \'terrainThickness\' | \'flattenBottom\' | \'format\'>>` と書けます',
      '`toForm` は3つのプロパティを持つオブジェクトを返します',
      '`Record<ExportFormat, string>` は3つのキーをすべて要求します',
    ],
    tests: `check('toForm は3項目だけ', toForm(sample), { terrainThickness: 10, flattenBottom: true, format: 'stl' })
check('formatLabels(3mf)', formatLabels['3mf'], '3MF')
check('formatLabels(stl)', formatLabels.stl, 'STL')
check('formatLabels(machimoki)', formatLabels.machimoki, 'machimoki')
check('formatLabels のキー数', Object.keys(formatLabels).length, 3)`,
    solution: `type ExportFormat = '3mf' | 'stl' | 'machimoki'

interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
  buildingColor?: string
}

type ExportForm = Partial<
  Pick<ExportOptions, 'terrainThickness' | 'flattenBottom' | 'format'>
>

function toForm(options: ExportOptions): ExportForm {
  return {
    terrainThickness: options.terrainThickness,
    flattenBottom: options.flattenBottom,
    format: options.format,
  }
}

const formatLabels: Record<ExportFormat, string> = {
  '3mf': '3MF',
  stl: 'STL',
  machimoki: 'machimoki',
}

const sample: ExportOptions = {
  terrainThickness: 10,
  flattenBottom: true,
  format: 'stl',
  buildingColor: '#ffffff',
}

    console.log(toForm(sample), formatLabels)
`,
  },
  {
    id: 'unknown-guards',
    title: '3. unknown と型述語',
    level: '上級',
    lang: 'ts',
    explanation: `
## unknown は「何でも入るが、そのままでは使えない」

\`unknown\` 型の値は、正体が分かるまでプロパティを読んだり計算に使ったりできません。まず \`typeof\` などで**絞り込んで**から使います。

machimoki の \`core/src/api/server.ts:212\` では、外から届いた \`unknown\` を厳密に検査しています。

\`\`\`ts
function parseNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}
\`\`\`

## 型述語 value is number

\`function isFiniteNumber(value: unknown): value is number\` の戻り値の \`value is number\` を**型述語**と呼びます。これを持つ関数を \`if (isFiniteNumber(x))\` の形で使うと、そのブロックの中では \`x\` が \`number\` に絞り込まれます。\`boolean\` を返すだけの関数と違い、呼び出し側の型まで変えられるのがポイントです。

## ! と ?. の注意点

末尾の \`!\`（非 null アサーション）は「ここでは null じゃないはず」とコンパイラに**言い切る**だけの記号で、実行時のエラーは防げません。値が実際に \`null\` ならそのまま落ちます。\`!\` で黙らせる前に、\`?.\` や \`??\` で安全に扱えないか考えましょう。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`isFiniteNumber\` / \`formatValue\` / \`readError\` を実装してください。
`,
    starter: `// 課題: 次の3つの関数を実装してください
//   1) isFiniteNumber(value: unknown): value is number
//        value が有限の数値なら true を返す（typeof と Number.isFinite で判定）
//        例: isFiniteNumber(12)   → true
//        例: isFiniteNumber('12') → false
//        例: isFiniteNumber(NaN)  → false
//   2) formatValue(value: unknown): string
//        文字列ならそのまま / 有限の数値なら String(value) / それ以外は '不明'
//        例: formatValue('ok') → 'ok'
//        例: formatValue(12)   → '12'
//        例: formatValue(true) → '不明'
//   3) readError(input: { message?: string } | null): string
//        input?.message があればそれを、無ければ '不明なエラー' を返す
//        例: readError({ message: '失敗' }) → '失敗'
//        例: readError(null)                → '不明なエラー'
// ヒント: unknown はそのままでは使えません。typeof で絞り込むか、型述語を返す関数を通します

function isFiniteNumber(value: unknown): value is number {
  return false
}

function formatValue(value: unknown): string {
  return ''
}

function readError(input: { message?: string } | null): string {
  return ''
}

console.log(formatValue('ok'), readError(null))
`,
    hints: [
      '`isFiniteNumber` の中身は `typeof value === \'number\' && Number.isFinite(value)` です',
      '`formatValue` は `typeof value === \'string\'` → `isFiniteNumber(value)` → `\'不明\'` の順に判定します',
      '`readError` は `input?.message ?? \'不明なエラー\'` の1行で書けます',
    ],
    tests: `check('isFiniteNumber(12)', isFiniteNumber(12), true)
check('isFiniteNumber("12")', isFiniteNumber('12'), false)
check('isFiniteNumber(NaN)', isFiniteNumber(NaN), false)
check('formatValue("ok")', formatValue('ok'), 'ok')
check('formatValue(12)', formatValue(12), '12')
check('formatValue(true)', formatValue(true), '不明')
check('readError(null)', readError(null), '不明なエラー')
check('readError({message})', readError({ message: '失敗' }), '失敗')`,
    solution: `function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (isFiniteNumber(value)) return String(value)
  return '不明'
}

function readError(input: { message?: string } | null): string {
  return input?.message ?? '不明なエラー'
}

console.log(formatValue('ok'), readError(null))
`,
  },
  {
    id: 'discriminated-union',
    title: '4. 判別共用体と Result 型',
    level: '上級',
    lang: 'ts',
    explanation: `
## 判別共用体

同じ「結果」でも、成功と失敗では持っている情報が違います。そんなときは \`ok\` のような**共通の目印**を持つ型を \`|\` でつなぐと、\`ok\` の値で安全に分岐できます。これを**判別共用体**（discriminated union）と呼びます。

machimoki の \`core/src/api/server.ts:113\` では、API に入ってきた値を検査した結果をこの形で返しています。

\`\`\`ts
interface ParseSuccess {
  ok: true
  value: { bounds: Bounds; options: ExportOptions }
}

interface ParseFailure {
  ok: false
  error: string
}
\`\`\`

\`frontend/src/lib/selectionBounds.ts:54\` の \`BoundsResult\` も同じ形です。

\`\`\`ts
export type BoundsResult =
  | { ok: true; bounds: SelectionBounds }
  | { ok: false; error: string }
\`\`\`

## ok で分岐する

\`if (result.ok)\` と書くと、true 側では \`value\`、false 側では \`error\` にだけアクセスできるよう型が絞られます。\`ok\` は両方の型に共通して存在するので、目印として使えます。

## throw と Result の使い分け

\`throw\` は「呼び出し側が対処しようのない異常」を投げるのに向きます。一方、入力ミスのように**呼び出し側が分岐で扱うべき失敗**は Result 型で返すと、分岐の抜け漏れに気づきやすくなります。machimoki の API が入力検査に Result を使い、内部の想定外エラーを try/catch で扱っているのはこの使い分けです。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`parsePositive\` と \`describeResult\` を実装してください。
`,
    starter: `type ParseResult = { ok: true; value: number } | { ok: false; error: string }

// 課題: 判別共用体を返す parsePositive と、それを文字列にする describeResult を実装してください
//   1) parsePositive(value: number): ParseResult
//        value が 0 より大きければ { ok: true, value } を返す
//        それ以外は { ok: false, error: '正の数ではありません' } を返す
//        例: parsePositive(12) → { ok: true, value: 12 }
//        例: parsePositive(0)  → { ok: false, error: '正の数ではありません' }
//   2) describeResult(result: ParseResult): string
//        ok なら 'OK: <value>' / ok でないなら 'NG: <error>' を返す
//        例: describeResult(parsePositive(12)) → 'OK: 12'
//        例: describeResult(parsePositive(0))  → 'NG: 正の数ではありません'
// ヒント: result.ok で分岐すると、それぞれの側で value / error にアクセスできます

function parsePositive(value: number): ParseResult {
  return { ok: false, error: '' }
}

function describeResult(result: ParseResult): string {
  return ''
}

console.log(describeResult(parsePositive(12)), describeResult(parsePositive(0)))
`,
    hints: [
      '`if (value > 0)` なら `{ ok: true, value }`、そうでなければ `{ ok: false, error: \'正の数ではありません\' }` を返します',
      '`describeResult` は `if (result.ok)` で分けると、中で `result.value` が使えます',
      'ok でない側では `result.error` が使えます。`\'OK: \' + result.value` のように文字列をつなげます',
    ],
    tests: `check('parsePositive(12)', parsePositive(12), { ok: true, value: 12 })
check('parsePositive(0)', parsePositive(0), { ok: false, error: '正の数ではありません' })
check('describeResult(OK)', describeResult(parsePositive(12)), 'OK: 12')
check('describeResult(NG)', describeResult(parsePositive(0)), 'NG: 正の数ではありません')`,
    solution: `type ParseResult = { ok: true; value: number } | { ok: false; error: string }

function parsePositive(value: number): ParseResult {
  if (value > 0) {
    return { ok: true, value }
  }
  return { ok: false, error: '正の数ではありません' }
}

function describeResult(result: ParseResult): string {
  if (result.ok) {
    return \`OK: \${result.value}\`
  }
  return \`NG: \${result.error}\`
}

console.log(describeResult(parsePositive(12)), describeResult(parsePositive(0)))
`,
  },
  {
    id: 'keyof-indexed-access',
    title: '5. keyof とインデックスアクセス',
    level: '上級',
    lang: 'ts',
    explanation: `
## keyof とインデックスアクセス

\`keyof T\` は「\`T\` が持つプロパティ名」のユニオン型です。\`T[K]\` は「\`K\` というキーに対応する値の型」を表します。この2つを組み合わせると、「キーと、そのキーに対応する値」を型安全に受け取る関数が書けます。

machimoki の \`frontend/src/components/ParameterPanel.tsx:26\` では、こう書いてパラメータを1項目だけ更新しています。

\`\`\`ts
const handleChange = <K extends keyof Parameters>(key: K, value: Parameters[K]) => {
  onChange({ ...parameters, [key]: value })
}
\`\`\`

\`key\` に \`terrainThickness\` を渡せば \`value\` は \`number\`、\`exportFormat\` を渡せば \`'3mf' | 'stl' | 'machimoki'\` と、自動で対応が取れます。取り違えるとコンパイルエラーになるのが利点です。

## as const と (typeof X)[number]

\`frontend/src/lib/previewBudget.ts:6\` の \`PREVIEW_BUDGET\` はオブジェクトの末尾に \`as const\` が付いています。

\`\`\`ts
export const PREVIEW_BUDGET = {
  maxIntersectingTiles: 1500,
  // ...
} as const
\`\`\`

\`as const\` を付けると各プロパティが読み取り専用のリテラル型になり、値を変えられなくなります。配列に付けた場合は \`(typeof FORMATS)[number]\` で「配列の要素が取りうる値」を型として取り出せます（\`typeof\` は値から型を作る構文です）。

## なぜ元を書き換えないのか

\`{ ...params, [key]: value }\` は、既存のプロパティをコピーしつつ1つだけ差し替えた**新しいオブジェクト**を作ります。元のオブジェクトを直接書き換えると、それを参照している別の場所まで影響が及び、バグの原因になります。

## 課題

エディタ先頭のコメントに、実装する関数と入出力の例を書いています。\`update\` と \`isFormat\` を実装してください。
`,
    starter: `interface ExportParams {
  thickness: number
  format: '3mf' | 'stl'
  flatten: boolean
}

const FORMATS = ['3mf', 'stl'] as const
type Format = (typeof FORMATS)[number]

// 課題: 次の2つを実装してください
//   1) update<K extends keyof ExportParams>(params: ExportParams, key: K, value: ExportParams[K]): ExportParams
//        指定した1項目だけを差し替えた「新しいオブジェクト」を返す（元の params は書き換えない）
//        例: update(base, 'thickness', 20) → { thickness: 20, format: '3mf', flatten: true }
//        例: update(base, 'format', 'stl') → { thickness: 10, format: 'stl', flatten: true }
//   2) isFormat(value: string): value is Format
//        '3mf' か 'stl' なら true、それ以外は false を返す
//        例: isFormat('stl') → true
//        例: isFormat('obj') → false
// ヒント: 元を書き換えず、{ ...params, [key]: value } を返します

const base: ExportParams = { thickness: 10, format: '3mf', flatten: true }

function update<K extends keyof ExportParams>(
  params: ExportParams,
  key: K,
  value: ExportParams[K],
): ExportParams {
  return params
}

function isFormat(value: string): value is Format {
  return false
}

console.log(update(base, 'thickness', 20), isFormat('stl'))
`,
    hints: [
      '`update` の戻り値は `{ ...params, [key]: value }` です（`params[key] = value` としないこと）',
      '`K extends keyof ExportParams` と `value: ExportParams[K]` の対応で、キーと値の型が連動します',
      '`isFormat` は `FORMATS.some((format) => format === value)` のように書けます',
    ],
    tests: `check('update thickness', update(base, 'thickness', 20), { thickness: 20, format: '3mf', flatten: true })
check('update format', update({ thickness: 10, format: '3mf', flatten: true }, 'format', 'stl'), { thickness: 10, format: 'stl', flatten: true })
check('元は不変', (update(base, 'thickness', 99), base), { thickness: 10, format: '3mf', flatten: true })
check('isFormat("stl")', isFormat('stl'), true)
check('isFormat("obj")', isFormat('obj'), false)`,
    solution: `interface ExportParams {
  thickness: number
  format: '3mf' | 'stl'
  flatten: boolean
}

const FORMATS = ['3mf', 'stl'] as const
type Format = (typeof FORMATS)[number]

const base: ExportParams = { thickness: 10, format: '3mf', flatten: true }

function update<K extends keyof ExportParams>(
  params: ExportParams,
  key: K,
  value: ExportParams[K],
): ExportParams {
  return { ...params, [key]: value }
}

function isFormat(value: string): value is Format {
  return FORMATS.some((format) => format === value)
}

console.log(update(base, 'thickness', 20), isFormat('stl'))
`,
  },
  {
    id: 'class-map-set',
    title: '6. クラスと Map・Set',
    level: '上級',
    lang: 'ts',
    explanation: `
## class はフィールドとメソッドの集まり

\`class\` を使うと、データ（フィールド）と、それを操作する処理（メソッド）をひとまとめにできます。\`new\` で実体（インスタンス）を作り、\`インスタンス.メソッド()\` で呼び出します。

machimoki の \`frontend/src/lib/previewBudget.ts:125\` では、並列度を管理する小さなクラスが定義されています。

\`\`\`ts
class Pool {
  private active = 0
  private waiters: Array<() => void> = []

  constructor(private readonly limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    // ...
  }
}
\`\`\`

\`private\` が付いたフィールドは、クラスの外から触れません。「このデータはこのクラスが責任を持って管理する」という宣言です。クラスのコードを読むときは、まず**フィールドの一覧**と**メソッドの一覧**を見て、「どんな状態を持ち、何ができるか」を把握すると読みやすくなります。

## Map と Set

- \`Map<K, V>\`: キーと値の組を保存します。\`get\` / \`set\` / \`has\` で操作し、\`Map<T, number>\` のようにキーと値の型を書きます
- \`Set<T>\`: 重複しない値の集まりです。同じ値を追加しても増えません

machimoki の \`frontend/src/lib/catalogApi.ts:81\` では、取得済みのデータを \`Map\` にキャッシュしています。

\`\`\`ts
const muniCodesCache = new Map<string, string[]>()
\`\`\`

\`Set\` は重複排除に便利で、\`[...new Set(values)]\` とすれば配列に戻せます。

## 課題

エディタ先頭のコメントに、実装するメソッドと関数、入出力の例を書いています。\`Counter\` の \`add\` / \`count\` と、\`unique\` を実装してください。
`,
    starter: `class Counter<T> {
  private counts = new Map<T, number>()

  // 課題(1): item を1回数える（すでにあれば +1、なければ 1 から）
  add(item: T): void {
    // ここに実装する
  }

  // 課題(2): item の出現回数を返す（未登録なら 0）
  count(item: T): number {
    return 0
  }
}

// 課題(3): Set を使って、数値配列の重複を除いた配列を返す
//   例: unique([1, 2, 2, 3, 1]) → [1, 2, 3]
//   ヒント: 返す値は [...new Set(values)] で作れます
function unique(values: number[]): number[] {
  return values
}

const counter = new Counter<string>()
counter.add('りんご')
counter.add('りんご')
counter.add('みかん')

console.log(counter.count('りんご'), unique([1, 2, 2, 3, 1]))
`,
    hints: [
      '`add` は `this.counts.get(item) ?? 0` で現在の回数を取り、`this.counts.set(item, current + 1)` で更新します',
      '`count` は `this.counts.get(item) ?? 0` を返すだけです',
      '`unique` は `[...new Set(values)]` で重複を除いた配列を作れます',
    ],
    tests: `check('りんごの回数', counter.count('りんご'), 2)
check('みかんの回数', counter.count('みかん'), 1)
check('未登録は0', counter.count('ぶどう'), 0)
check('unique', unique([1, 2, 2, 3, 1]), [1, 2, 3])`,
    solution: `class Counter<T> {
  private counts = new Map<T, number>()

  add(item: T): void {
    const current = this.counts.get(item) ?? 0
    this.counts.set(item, current + 1)
  }

  count(item: T): number {
    return this.counts.get(item) ?? 0
  }
}

function unique(values: number[]): number[] {
  return [...new Set(values)]
}

const counter = new Counter<string>()
counter.add('りんご')
counter.add('りんご')
counter.add('みかん')

console.log(counter.count('りんご'), unique([1, 2, 2, 3, 1]))
`,
  },
  {
    id: 'async-await',
    title: '7. async / await と Promise',
    level: '上級',
    lang: 'ts',
    explanation: `
## async 関数は Promise を返す

\`async\` を付けた関数は、必ず \`Promise<T>\` を返します。

\`\`\`ts
async function loadCount(): Promise<number> {
  return 3
}
\`\`\`

戻り値に \`Promise<...>\` と書きますが、\`return\` するのは Promise ではなく中身の値です。

## await で中身を取り出す

\`await\` を使うと \`Promise<T>\` から \`T\` を取り出せます。

\`\`\`ts
const count = await loadCount() // count は number の 3
\`\`\`

このエディタは module worker なので、関数の中だけでなく**トップレベルでも await** が使えます。

## なぜ async / await を使うのか

API 呼び出しのように「すぐには結果が手に入らない」処理を、同期処理と同じ見た目で順番に書けます。machimoki では \`/api/validate\` の結果を待つのに使えます。

## 課題

エディタ先頭のコメントの仕様に従って、\`resolveResult\` と \`result\` / \`label\` を実装してください。
`,
    starter: `interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
  numShells: number
}

// 課題: async / await を使って、検査結果を日本語ラベルに変換してください
//   1) resolveResult(status, numShells)
//        async 関数。受け取った値をそのまま持つ ValidationResult を返す
//        例: await resolveResult('fail', 3) → { status: 'fail', numShells: 3 }
//   2) トップレベル await で resolveResult('fail', 3) の結果を result に入れる
//   3) label: result.status を '合格' / '警告' / '不合格' に変換する
//        例: status 'pass' → '合格' / 'warning' → '警告' / 'fail' → '不合格'

async function resolveResult(
  status: 'pass' | 'warning' | 'fail',
  numShells: number,
): Promise<ValidationResult> {
  return { status: 'warning', numShells: 0 }
}

const result = await resolveResult('fail', 3)
const label = ''

console.log(result, label)
`,
    hints: [
      '`async` 関数では `return { status, numShells }` のように値を返せます',
      'トップレベル `await` は `const result = await resolveResult(...)` のように書きます',
      '`label` は `switch (result.status)` で組み立てられます',
    ],
    tests: `check('result.status', result.status, 'fail')
check('result.numShells', result.numShells, 3)
check('label', label, '不合格')
check('渡した status を返す', (await resolveResult('pass', 1)).status, 'pass')`,
    solution: `interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
  numShells: number
}

async function resolveResult(
  status: 'pass' | 'warning' | 'fail',
  numShells: number,
): Promise<ValidationResult> {
  return { status, numShells }
}

const result = await resolveResult('fail', 3)

let label = ''
switch (result.status) {
  case 'pass':
    label = '合格'
    break
  case 'warning':
    label = '警告'
    break
  case 'fail':
    label = '不合格'
    break
}

console.log(result, label)
`,
  },
]
