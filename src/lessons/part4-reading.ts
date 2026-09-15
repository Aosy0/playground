import type { Lesson } from './types.ts'

// 上級・実コード読解
export const reading: Lesson[] = [
  {
    id: 'react-components',
    title: '8. React コンポーネントの読み方',
    level: '上級',
    lang: 'ts',
    explanation: `
## コンポーネントは「状態 → 表示」の関数

React のコンポーネントは、props を受け取って JSX（表示）を返すただの関数です。実コードを読むときは、見た目を作る部分と、値を持って計算する部分を分けて追うと早く読めます。

- \`useState\`: 値と、それを更新する関数のペアを持つ。更新すると再描画される
- \`useEffect\`: 描画のあとに走る副作用（購読の開始・後始末など）。依存配列が「いつ走るか」を決める
- \`useRef\`: 再描画をまたいで保持したい値。更新しても再描画されない

## カスタムフックと純粋関数の分離

\`frontend/src/hooks/useMapLibreRectangleSelection.ts\` は、地図の矩形選択をまとめたカスタムフックです。フック自身は \`useState\` / \`useEffect\` / \`useRef\` で状態を持ちますが、座標計算は controller に、さらにその中の純粋計算は \`selectionLogic.ts\` に逃がしています。

\`\`\`ts
// frontend/src/lib/selectionLogic.ts:35
const minX = Math.min(start.x, current.x)
const minY = Math.min(start.y, current.y)
const maxX = Math.max(start.x, current.x)
const maxY = Math.max(start.y, current.y)
\`\`\`

ドラッグは右上から左下へも動くので、開始点と現在点の大小は決まっていません。\`Math.min\` / \`Math.max\` で正規化するこの4行が、UI から切り離された純粋関数です（\`calculatePixelBounds\`）。React に依存しないので、そのまま単体テストできます。

呼び出し側の \`App.tsx\` は状態を並べるだけです。

\`\`\`ts
// frontend/src/App.tsx:57
const [activeTab, setActiveTab] = useState<Tab>('map')
const [isExporting, setIsExporting] = useState(false)
const [errorMessage, setErrorMessage] = useState<string | null>(null)
\`\`\`

## 読むコツ: 表示とロジックを分けて純粋なロジックを探す

1. まず \`useState\` を並べて、この画面が持つ状態を一覧する
2. \`useEffect\` で「何に反応して何をするか」を追う
3. 計算部分が純粋関数に切り出されていたら、そこだけを読んで理解する

**この演習では React は実行できません。** エディタは型チェック付きの TypeScript 環境なので、フックから切り出された純粋ロジック（矩形の正規化とサイズ判定）を再実装して、読解の勘所をつかみます。

## 課題

エディタ先頭のコメントに、2つの関数の入出力例を書いています。\`normalize\` と \`isBigEnough\` を実装してください。
`,
    starter: `interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

// 課題: 矩形選択の純粋ロジックを2つ実装してください
//   1) normalize(startX, startY, endX, endY):
//        ドラッグ方向に関わらず left <= right, top <= bottom に正規化した Rect を返す
//        例: normalize(30, 50, 10, 20)
//            → { left: 10, top: 20, right: 30, bottom: 50 }
//        例: normalize(10, 20, 30, 50)
//            → { left: 10, top: 20, right: 30, bottom: 50 }（同じ結果）
//   2) isBigEnough(rect, minSize):
//        幅 (right - left) と高さ (bottom - top) の両方が minSize 以上なら true
//        例: isBigEnough({ left: 0, top: 0, right: 10, bottom: 10 }, 5) → true
//        例: isBigEnough({ left: 0, top: 0, right: 3, bottom: 10 }, 5) → false

function normalize(startX: number, startY: number, endX: number, endY: number): Rect {
  return { left: 0, top: 0, right: 0, bottom: 0 }
}

function isBigEnough(rect: Rect, minSize: number): boolean {
  return false
}

console.log(normalize(30, 50, 10, 20), isBigEnough({ left: 0, top: 0, right: 10, bottom: 10 }, 5))
`,
    expected: '{"left":10,"top":20,"right":30,"bottom":50} true',
    hints: [
      '`Math.min(startX, endX)` が left、`Math.max(startX, endX)` が right になります',
      '`isBigEnough` は幅と高さを出して、両方 `>= minSize` かを `&&` でつなぎます',
      '`selectionLogic.ts` の `calculatePixelBounds` と同じ形です',
    ],
    tests: `check('順方向の正規化', normalize(10, 20, 30, 50), { left: 10, top: 20, right: 30, bottom: 50 })
check('逆方向の正規化', normalize(30, 50, 10, 20), { left: 10, top: 20, right: 30, bottom: 50 })
check('縦だけ逆方向', normalize(10, 50, 30, 20), { left: 10, top: 20, right: 30, bottom: 50 })
check('十分な大きさ', isBigEnough({ left: 0, top: 0, right: 10, bottom: 10 }, 5), true)
check('幅が小さすぎる', isBigEnough({ left: 0, top: 0, right: 3, bottom: 10 }, 5), false)`,
    solution: `interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

function normalize(startX: number, startY: number, endX: number, endY: number): Rect {
  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    right: Math.max(startX, endX),
    bottom: Math.max(startY, endY),
  }
}

function isBigEnough(rect: Rect, minSize: number): boolean {
  return rect.right - rect.left >= minSize && rect.bottom - rect.top >= minSize
}

console.log(normalize(30, 50, 10, 20), isBigEnough({ left: 0, top: 0, right: 10, bottom: 10 }, 5))
`,
  },
  {
    id: 'validation-result',
    title: '9. ValidationResult を読む',
    level: '上級',
    lang: 'ts',
    explanation: `
## 検査結果の型

\`frontend/src/types/api.ts\` の \`ValidationResult\` は、メッシュ検査の結果を表します。

\`\`\`ts
export interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
  numTri: number
  numVert: number
  numEdge: number
  volume: number
  surfaceArea: number
  genus: number
  numShells: number
  open_edges: number
  non_manifold_edges: number
  self_intersections: number
  statusCode: string
}
\`\`\`

\`status\` は次のルールで決まります（\`core/src/validate.ts\`）。

\`\`\`ts
let status: ValidationResult['status']
if (openEdges === 0 && nonManifoldEdges === 0 && selfIntersections === 0) {
  status = numShells === 1 ? 'pass' : 'warning'
} else {
  status = 'fail'
}
\`\`\`

- \`pass\`: 穴も非多様体も自己交差もなく、シェルが1つ
- \`warning\`: 同上だがシェルが複数
- \`fail\`: 穴・非多様体・自己交差のいずれかがある

## 課題

エディタ先頭のコメントに、メッセージの対応表と \`issueCount\` の仕様を書いています。それに従って2つの関数を実装してください。
`,
    starter: `interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
  numTri: number
  numVert: number
  numShells: number
  open_edges: number
  non_manifold_edges: number
  self_intersections: number
}

// 課題: 検査結果を扱う2つの関数を実装してください
//   1) judgeMessage(result): status に応じた日本語メッセージを返す
//        'pass'    → '問題ありません'
//        'warning' → '複数のシェルに分かれています'
//        'fail'    → 'メッシュに問題があります'
//   2) issueCount(result): open_edges + non_manifold_edges + self_intersections を返す
//        例: issueCount({ open_edges: 3, non_manifold_edges: 2, self_intersections: 1 }) → 6

const result: ValidationResult = {
  status: 'warning',
  numTri: 120,
  numVert: 80,
  numShells: 2,
  open_edges: 0,
  non_manifold_edges: 0,
  self_intersections: 0,
}

function judgeMessage(value: ValidationResult): string {
  return ''
}

function issueCount(value: ValidationResult): number {
  return 0
}

console.log(judgeMessage(result), issueCount(result))
`,
    expected: '複数のシェルに分かれています 0',
    hints: [
      '`switch (value.status)` で3つの場合に分けます',
      '`issueCount` は3つのプロパティを足すだけです',
      '`open_edges` と `non_manifold_edges` は似ていますが別の項目です',
    ],
    tests: `check('warning のメッセージ', judgeMessage(result), '複数のシェルに分かれています')
check('pass のメッセージ', judgeMessage({ ...result, status: 'pass', numShells: 1 }), '問題ありません')
check('fail のメッセージ', judgeMessage({ ...result, status: 'fail', open_edges: 3 }), 'メッシュに問題があります')
check('issueCount', issueCount({ ...result, open_edges: 3, non_manifold_edges: 2, self_intersections: 1 }), 6)`,
    solution: `interface ValidationResult {
  status: 'pass' | 'warning' | 'fail'
  numTri: number
  numVert: number
  numShells: number
  open_edges: number
  non_manifold_edges: number
  self_intersections: number
}

const result: ValidationResult = {
  status: 'warning',
  numTri: 120,
  numVert: 80,
  numShells: 2,
  open_edges: 0,
  non_manifold_edges: 0,
  self_intersections: 0,
}

function judgeMessage(value: ValidationResult): string {
  switch (value.status) {
    case 'pass':
      return '問題ありません'
    case 'warning':
      return '複数のシェルに分かれています'
    case 'fail':
      return 'メッシュに問題があります'
  }
}

function issueCount(value: ValidationResult): number {
  return value.open_edges + value.non_manifold_edges + value.self_intersections
}

console.log(judgeMessage(result), issueCount(result))
`,
  },
  {
    id: 'pipeline-phases',
    title: '10. PipelinePhase を網羅する switch',
    level: '上級',
    lang: 'ts',
    explanation: `
## パイプラインの段階

\`frontend/src/types/pipeline.ts\` の \`PipelinePhase\` は、処理の段階を表すユニオン型です。

\`\`\`ts
export type PipelinePhase =
  | 'idle'
  | 'identifying'
  | 'acquiring'
  | 'composing'
  | 'cropping'
  | 'displaying'
  | 'complete'
  | 'error'
\`\`\`

## 網羅チェック

\`switch\` ですべての \`case\` を書くと、\`default\` に来る値の型は \`never\` になります。

\`\`\`ts
default: {
  const exhaustive: never = phase
  return exhaustive
}
\`\`\`

もし \`case\` を書き忘れると \`phase\` は \`never\` にならないため、この代入が**型エラー**になります。これが「漏れの検出」です。新しい phase が追加されたときも、修正すべき場所に気づけます。

## 課題

対応表はエディタ先頭のコメントにまとめています。\`describePhase\` の \`case\` をすべて書いてください。
`,
    starter: `type PipelinePhase =
  | 'idle'
  | 'identifying'
  | 'acquiring'
  | 'composing'
  | 'cropping'
  | 'displaying'
  | 'complete'
  | 'error'

// 課題: describePhase(phase) を、すべての phase を網羅する switch で実装してください
//   'idle' → '待機中' / 'identifying' → '識別中' / 'acquiring' → '取得中'
//   'composing' → '合成中' / 'cropping' → '切り出し中' / 'displaying' → '表示中'
//   'complete' → '完了' / 'error' → 'エラー'
// すべて書けたら default を const exhaustive: never = phase にしましょう（漏れを型エラーで検出）

function describePhase(phase: PipelinePhase): string {
  switch (phase) {
    case 'idle':
      return '待機中'
    default:
      return ''
  }
}

console.log(describePhase('idle'))
`,
    expected: '待機中',
    hints: [
      '`case` は8つあります。コメントの対応表どおりにラベルを返します',
      '網羅できたら `default` は `const exhaustive: never = phase` にします',
      '`return exhaustive` と書くと、漏れが型エラーとして見えます',
    ],
    tests: `check('idle', describePhase('idle'), '待機中')
check('acquiring', describePhase('acquiring'), '取得中')
check('displaying', describePhase('displaying'), '表示中')
check('complete', describePhase('complete'), '完了')
check('error', describePhase('error'), 'エラー')`,
    solution: `type PipelinePhase =
  | 'idle'
  | 'identifying'
  | 'acquiring'
  | 'composing'
  | 'cropping'
  | 'displaying'
  | 'complete'
  | 'error'

function describePhase(phase: PipelinePhase): string {
  switch (phase) {
    case 'idle':
      return '待機中'
    case 'identifying':
      return '識別中'
    case 'acquiring':
      return '取得中'
    case 'composing':
      return '合成中'
    case 'cropping':
      return '切り出し中'
    case 'displaying':
      return '表示中'
    case 'complete':
      return '完了'
    case 'error':
      return 'エラー'
    default: {
      const exhaustive: never = phase
      return exhaustive
    }
  }
}

console.log(describePhase('idle'))
`,
  },
  {
    id: 'pipeline-reading',
    title: '11. パイプラインを読む',
    level: '上級',
    lang: 'ts',
    explanation: `
## 関数の連鎖として読む

\`core/src/pipeline.ts:168\` の \`buildPrintableModelUnsafe\` は、建物と地形を取得してから書き出すまでを一直線に並べた関数です。処理は「関数を順に呼ぶだけ」で、各ステップがデータの形を少しずつ変えます。

\`\`\`ts
// core/src/pipeline.ts:174
const components: RawMesh[] = []
for (const mesh of buildingMeshes) {
  const welded = weldVertices(mesh)
  components.push(...splitConnectedComponents(welded))
}
const uniqueComponents = dedupeComponents(components)
\`\`\`

## フロー図

\`\`\`
buildBuildingMeshes / buildTerrainMesh   取得: 建物・地形の RawMesh を作る
        ↓
weldVertices                             溶接: 重複頂点を1つにまとめる
        ↓
splitConnectedComponents                 分割: つながった塊ごとに分ける
        ↓
dedupeComponents                         重複: 同じ形状の塊を1つに絞る
        ↓
alignFlatTerrainToBuildings              接地: 地形に合わせて建物を持ち上げる
        ↓
componentIntersectsBounds                抽出: 範囲外の塊を落とす
        ↓
capBuildingBottom                        キャップ: 建物の底を塞ぐ
        ↓
scaleRawMesh                             スケール: 縮尺を掛ける
        ↓
createManifoldFromMesh                   多様体: 水密で扱える表現にする
        ↓
unionMeshes                              結合: 全部を1つにまとめる
        ↓
exportTo3MF / exportMeshesToSTL          書き出し: ファイルのバイト列にする
\`\`\`

各ステップの入力と出力はどれも \`RawMesh\` ですが、意味が違います。「まだ溶接していない頂点」「分割済みの塊」「接地済み」「キャップ済み」と、同じ型でも状態が進みます。読むときは型だけを見て同じだと決めつけないこと。

## 純粋関数と副作用を分ける

幾何演算のうち、ブラウザにも I/O にも依存しない部分は \`core/src/pipelineCore.ts\` に集まっています。\`boundsToEngineXZ\`（\`pipelineCore.ts:13\`）は緯度経度の範囲をローカル座標に直す純粋関数、\`pointInTriangleXZ\`（\`pipelineCore.ts:30\`）は点が三角形の内側かを判定する純粋関数です。一方、ファイル取得や WASM の呼び出しは \`pipeline.ts\` 側の副作用として残ります。

## 読むコツ

型に注目し、各関数が**何を足す/削るか**を1行でメモしながら読みます。上のフロー図がそのメモです。これが作れれば「どこで何が起きるか」を把握できています。

## 課題

エディタ先頭のコメントに、範囲内判定の入出力例を書いています。\`inside\` と \`pickInside\` を実装してください。
`,
    starter: `interface Component {
  x: number
  z: number
}

interface Bounds2D {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

// 課題: 範囲内判定の純粋関数を2つ実装してください
//   1) inside(x, z, bounds):
//        点 (x, z) が bounds の内側（境界を含む）なら true
//        例: inside(5, 5, { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }) → true
//        例: inside(0, 10, { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }) → true（境界）
//        例: inside(11, 5, { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }) → false
//   2) pickInside(components, bounds):
//        内側の Component だけを残した「新しい配列」を返す（元の配列は変更しない）
//        例: pickInside([{ x: 5, z: 5 }, { x: 20, z: 5 }],
//                       { minX: 0, maxX: 10, minZ: 0, maxZ: 10 })
//            → [{ x: 5, z: 5 }]（x=20 は外側なので落ちる）

const components: Component[] = [
  { x: 1, z: 1 },
  { x: 5, z: 5 },
  { x: 20, z: 5 },
]

const bounds: Bounds2D = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }

function inside(x: number, z: number, area: Bounds2D): boolean {
  return false
}

function pickInside(items: Component[], area: Bounds2D): Component[] {
  return []
}

console.log(pickInside(components, bounds))
`,
    expected: '[{"x":1,"z":1},{"x":5,"z":5}]',
    hints: [
      '`inside` は x と z の両方を、それぞれ min 以上かつ max 以下で判定します',
      '境界を含めるので `>=` と `<=` を使います',
      '`pickInside` は `items.filter((c) => inside(c.x, c.z, area))` で新しい配列が得られます',
    ],
    tests: `check('内部の点', inside(5, 5, bounds), true)
check('境界の点', inside(0, 10, bounds), true)
check('外側の点', inside(11, 5, bounds), false)
check('内側だけ抽出', pickInside(components, bounds), [{ x: 1, z: 1 }, { x: 5, z: 5 }])
check('元の配列は変わらない', components.length, 3)`,
    solution: `interface Component {
  x: number
  z: number
}

interface Bounds2D {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const components: Component[] = [
  { x: 1, z: 1 },
  { x: 5, z: 5 },
  { x: 20, z: 5 },
]

const bounds: Bounds2D = { minX: 0, maxX: 10, minZ: 0, maxZ: 10 }

function inside(x: number, z: number, area: Bounds2D): boolean {
  return x >= area.minX && x <= area.maxX && z >= area.minZ && z <= area.maxZ
}

function pickInside(items: Component[], area: Bounds2D): Component[] {
  return items.filter((c) => inside(c.x, c.z, area))
}

console.log(pickInside(components, bounds))
`,
  },
  {
    id: 'machimoki-map',
    title: '12. machimoki 全体マップ',
    level: '上級',
    lang: 'ts',
    explanation: `
## 3層アーキテクチャ

machimoki は npm workspaces のモノレポで、責務を3つに分けています（README の Architecture セクション）。

\`\`\`
machimoki/
├── frontend/   UI と 3D プレビュー（React, Cesium, Three.js）
│                └ 重い幾何演算は禁止
├── core/       ヘッドレスなメッシュ生成・検証・CLI・API（Hono, manifold-3d）
│                └ ブラウザ専用 API への依存は禁止
└── worker/     Cloudflare Workers（静的配信と軽量プロキシ）
                 └ 重い演算は禁止
\`\`\`

依存の向きは README と AGENTS.md が明記しています。

- \`frontend → core\`（HTTP API 越し）
- \`worker → frontend/core\`（プロキシ）
- **逆方向の依存は禁止**

向きを守ると、core はブラウザなしで CLI からも動かせ、frontend は重い処理を core に投げられます。

## 主要なファイルと役割

| ファイル | 役割 |
|---|---|
| \`core/src/types.ts\` | \`Bounds\` / \`RawMesh\` / \`ExportOptions\` など全層で使う型 |
| \`core/src/pipelineCore.ts\` | ブラウザ・I/O・WASM 非依存の純粋幾何演算（座標変換・内外判定） |
| \`core/src/validate.ts\` | メッシュ検査。合否（pass/warning/fail）の判定 |
| \`core/src/api/server.ts\` | Hono の HTTP API。入力検証とデフォルト埋め |
| \`core/src/pipeline.ts\` | 取得 → 溶接 → … → 書き出しのオーケストレーション |
| \`core/src/manifoldOps.ts\` | manifold-3d によるブール結合・エクスポート |
| \`frontend/src/types/api.ts\` | API レスポンスの型（\`ValidationResult\` など） |
| \`frontend/src/lib/selectionBounds.ts\` | 選択範囲の生成と検証（判別共用体で結果を返す） |
| \`frontend/src/hooks/\` | 状態と副作用（カスタムフック）。計算は lib に逃がす |
| \`frontend/src/App.tsx\` | 画面の状態管理と配線 |
| \`worker/src/index.ts\` | カタログのプロキシと KV キャッシュ |

## 推奨読解順

\`core/types.ts\` → \`pipelineCore.ts\` → \`validate.ts\` → \`api/server.ts\` → \`pipeline.ts\` →（拾い読み）\`manifoldOps.ts\`

そのあと frontend: \`types/api.ts\` → \`lib/selectionBounds.ts\` → \`hooks/\` → \`App.tsx\`、最後に \`worker/src/index.ts\`。

型から入ると、以降の関数が何を受け取って何を返すかが先に分かります。

## ここまでのレッスンとの対応

| 学んだこと | 実コードでの出会い方 |
|---|---|
| ジェネリクス・ユーティリティ型 | core の型定義、\`Partial<ExportOptions>\` |
| \`unknown\` と型述語 | \`api/server.ts\` の外部入力検証 |
| 判別共用体 | \`selectionBounds.ts\` の成功/失敗結果 |
| 網羅する switch | \`PipelinePhase\` の表示切替 |
| 純粋関数の分離 | \`pipelineCore.ts\`、\`selectionLogic.ts\` |
| 関数の連鎖 | \`pipeline.ts\` のオーケストレーション |

## 用語集

- **LOD**: Level of Detail。建物モデルの詳細度（lod1 は簡略、lod2 は屋根形状まで）
- **3MF**: 3D プリント向けの XML ベース形式。色や単位を持てる
- **STL**: 三角形の羅列だけの古い形式。色は持てない
- **RawMesh**: 頂点座標と面インデックスの組。まだ水密とは限らない生データ
- **シェル**: 閉じた表面のまとまり。1つなら単一シェル、複数だと warning
- **水密**: 面の隙間がなく、体積を持って扱えること

## 課題

ここまでで学んだ「型で場合分けする」「依存の向きを守る」を、パスの層判定として確認します。エディタ先頭のコメントに \`layerOf\` と \`canDependOn\` の仕様表を書いています。実装してください。
`,
    starter: `// 課題: パスの層判定と、依存してよい向きの判定を実装してください
//
// layerOf(path): 先頭ディレクトリで層を判定する
//   'frontend/src/App.tsx' → 'frontend'
//   'core/src/validate.ts' → 'core'
//   'worker/src/index.ts'  → 'worker'
//   'README.md'            → 'unknown'（上記以外）
//
// canDependOn(from, to): 依存してよい向きだけ true
//   | from \\ to | frontend | core  | worker |
//   |------------|----------|-------|--------|
//   | frontend   |  false   | true  | false  |
//   | core       |  false   | false | false  |
//   | worker     |  true    | true  | false  |
//   | unknown    |  false   | false | false  |
//   （同レイヤー・不明な層はすべて false）

type Layer = 'frontend' | 'core' | 'worker' | 'unknown'

function layerOf(path: string): Layer {
  return 'unknown'
}

function canDependOn(from: string, to: string): boolean {
  return false
}

console.log(layerOf('frontend/src/App.tsx'), canDependOn('worker', 'core'))
`,
    expected: 'frontend true',
    hints: [
      '`path.split("/")[0]` で先頭ディレクトリを取り出せます',
      '`layerOf` は取り出した値が3つのどれかならそれを返し、それ以外は `unknown` にします',
      '`canDependOn` は `from` が frontend なら to は core だけ、worker なら frontend か core のときだけ true です',
    ],
    tests: `check('frontend の層', layerOf('frontend/src/App.tsx'), 'frontend')
check('core の層', layerOf('core/src/validate.ts'), 'core')
check('worker の層', layerOf('worker/src/index.ts'), 'worker')
check('未知の層', layerOf('README.md'), 'unknown')
check('frontend → core', canDependOn('frontend', 'core'), true)
check('worker → frontend', canDependOn('worker', 'frontend'), true)
check('worker → core', canDependOn('worker', 'core'), true)
check('core → frontend は禁止', canDependOn('core', 'frontend'), false)
check('同レイヤーは禁止', canDependOn('frontend', 'frontend'), false)`,
    solution: `type Layer = 'frontend' | 'core' | 'worker' | 'unknown'

function layerOf(path: string): Layer {
  const head = path.split('/')[0]
  if (head === 'frontend' || head === 'core' || head === 'worker') {
    return head
  }
  return 'unknown'
}

function canDependOn(from: string, to: string): boolean {
  if (from === 'frontend') {
    return to === 'core'
  }
  if (from === 'worker') {
    return to === 'frontend' || to === 'core'
  }
  return false
}

console.log(layerOf('frontend/src/App.tsx'), canDependOn('worker', 'core'))
`,
  },
  {
    id: 'build-export-options',
    title: '13. 総合演習: buildExportOptions',
    level: '上級',
    lang: 'ts',
    explanation: `
## デフォルト埋めと検証

\`core/src/api/server.ts\` では、リクエストの \`terrainThickness\` を検証し、他の項目にデフォルトを入れています。

\`\`\`ts
const terrainThickness = parseNumber(record.terrainThickness)
if (terrainThickness === null || terrainThickness <= 0) {
  return { ok: false, error: 'Missing or invalid terrainThickness' }
}

const flattenBottom = typeof record.flattenBottom === 'boolean' ? record.flattenBottom : true
const format = parseFormat(record.format) ?? '3mf'
const upAxis = parseUpAxis(record.upAxis) ?? 'z-up'
const scale = scaleParsed !== null && scaleParsed > 0 ? scaleParsed : 1
\`\`\`

\`Partial<ExportOptions>\` は「\`ExportOptions\` の一部だけが入っているかもしれない」型です。これを受け取って、デフォルトを埋めた完全な \`ExportOptions\` を返す関数を書きます。

## なぜ検証するのか

外部から来る入力は、必要な項目が欠けているかもしれません。境界で検証しておくと、以降の処理は「完全なデータ」だけを扱えます。

## 課題

エディタ先頭のコメントに、既定値と検証の仕様を書いています。\`buildExportOptions\` を実装してください。
`,
    starter: `type ExportFormat = '3mf' | 'stl' | 'machimoki'
type UpAxis = 'z-up' | 'y-up'

interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
  upAxis?: UpAxis
  scale?: number
}

// 課題: buildExportOptions(input) を実装してください
//   ・input は Partial<ExportOptions>（一部だけ入っているかもしれない）
//   ・terrainThickness が無い、または 0 以下なら throw new Error(...) する
//   ・残りはデフォルトで埋める: flattenBottom=true / format='3mf' / upAxis='z-up' / scale=1
//   ・input に指定がある項目はその値を使う（?? が使えます）
//   例: buildExportOptions({ terrainThickness: 10 })
//       → { terrainThickness: 10, flattenBottom: true, format: '3mf', upAxis: 'z-up', scale: 1 }
//   例: buildExportOptions({ terrainThickness: 25, format: 'stl' }).format → 'stl'

function buildExportOptions(input: Partial<ExportOptions>): ExportOptions {
  return {
    terrainThickness: input.terrainThickness ?? 0,
    flattenBottom: false,
    format: '3mf',
  }
}

console.log(buildExportOptions({ terrainThickness: 10 }))
`,
    expected: '{"terrainThickness":10,"flattenBottom":true,"format":"3mf","upAxis":"z-up","scale":1}',
    hints: [
      '`if (!input.terrainThickness || input.terrainThickness <= 0) throw new Error(...)` で検証できます',
      '`input.flattenBottom ?? true` で「指定があればそれ、無ければ既定値」になります',
      '`upAxis` と `scale` も既定値を入れてプロパティとして返します',
    ],
    tests: `check('既定の flattenBottom', buildExportOptions({ terrainThickness: 10 }).flattenBottom, true)
check('既定の format', buildExportOptions({ terrainThickness: 10 }).format, '3mf')
check('既定の upAxis', buildExportOptions({ terrainThickness: 10 }).upAxis, 'z-up')
check('指定した値を尊重', buildExportOptions({ terrainThickness: 25, format: 'stl' }).format, 'stl')
check('terrainThickness 未指定は例外', (() => { try { buildExportOptions({}); return 'no' } catch { return 'yes' } })(), 'yes')`,
    solution: `type ExportFormat = '3mf' | 'stl' | 'machimoki'
type UpAxis = 'z-up' | 'y-up'

interface ExportOptions {
  terrainThickness: number
  flattenBottom: boolean
  format: ExportFormat
  upAxis?: UpAxis
  scale?: number
}

function buildExportOptions(input: Partial<ExportOptions>): ExportOptions {
  if (!input.terrainThickness || input.terrainThickness <= 0) {
    throw new Error('terrainThickness は必須です')
  }
  return {
    terrainThickness: input.terrainThickness,
    flattenBottom: input.flattenBottom ?? true,
    format: input.format ?? '3mf',
    upAxis: input.upAxis ?? 'z-up',
    scale: input.scale ?? 1,
  }
}

console.log(buildExportOptions({ terrainThickness: 10 }))
`,
  },
]
