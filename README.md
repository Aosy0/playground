# コード読解 Playground（playground）

[machimoki](../machimoki) のコードを読めるようになるための、ブラウザ完結型の TypeScript 学習ツール。
トップページで難易度（入門 / 初級 / 上級）を選び、レッスンごとに「解説 → コードを書く → 実行 → 自動採点」ができる。
同じ研究室の仲間と共有する前提。

- 公開予定URL: `https://playground.aosy.f5.si`（Nginx Proxy Manager → Docker コンテナ）
- **サーバーでは一切コードを実行しない**。実行はすべて閲覧者のブラウザ内（Web Worker）で完結する

## カリキュラム

| 編 | 対象 | レッスン |
|---|---|---|
| 入門 | プログラミングが初めての人 | 1〜6: 値と表示 / 変数と計算 / 条件分岐 / 配列と繰り返し / 関数 / 総合演習 |
| 初級 | 他の言語経験者・TSは初めて | 1〜6: 型注釈 / interface / オプショナル / リテラル型とユニオン / 関数の型 / 絞り込み |
| 上級 | 初級修了者 | 1〜13: ジェネリクス / ユーティリティ型 / unknown と型述語 / 判別共用体と Result 型 / keyof とインデックスアクセス / クラスと Map・Set / async / React コンポーネントの読み方 / ValidationResult を読む / PipelinePhase を網羅する switch / パイプラインを読む / machimoki 全体マップ / 総合演習 |

上級の目標は、machimoki の主要フロー（範囲選択 → カタログ解決 → 建物・地形取得 → パイプライン → エクスポート → 検証）と
中核ファイルを読めるようになること。最後の「machimoki 全体マップ」に推奨読解順と用語集がある。

## 画面構成とURL

単一ページ（SPA）。ハッシュルーティングで共有可能。

- `#/` … トップページ（難易度選択・進捗・続きから）
- `#/ts/<tier>` … 難易度別のレッスン画面（`tier` = `intro` / `basic` / `advanced`）
- `#/ts/<tier>/<lesson-id>` … 個別レッスンへの直リンク

トップページの言語セクションはアコーディオンで、クリックするとその場で難易度カードが展開する（言語の選択でページ遷移しない）。
言語は URL 上 `ts` でスコープしている（将来 `py` などを追加できる）。言語の定義は `src/languages.ts`。
進捗の保存キーは `playground-progress:<lang>`（`ts` は旧 `ts-playground-progress` から一度だけ移行）。
Monaco エディタはレッスン画面に入ったときに遅延ロードする。

## 技術スタック

| 領域 | 採用 | 備考 |
|---|---|---|
| ビルド | Vite 8.3（Rolldown/Oxc）/ TypeScript 5.6 | Node 24 で動作確認 |
| エディタ | monaco-editor 0.56 | **型チェックが付いてくる**のが採用理由。CDNは使わず同梱。レッスン画面で遅延ロード |
| Markdown | marked 18 | 解説の描画のみ |
| 実行 | Blob の module Web Worker + 3秒タイムアウト | `worker.terminate()` で無限ループを止める |
| UI | フレームワークなし（素のTS + CSS Grid + ハッシュルーティング） | トップページ + レッスン画面の2ビュー |
| テスト | Node 24 のTSネイティブ実行 + `node:assert`（`npm run check`） | レッスンデータ整合性 |
| E2E | Playwright（`npm run e2e`） | ランディング動線 + 実ブラウザで全レッスンを検証 |

## ディレクトリ構成

```
playground/
├── index.html            トップページ + レッスン画面の骨組み
├── vite.config.ts        dev 5174 / preview 4174、allowedHosts に公開ドメインを登録
├── Dockerfile            本番: node でビルド → nginx で静的配信
├── nginx.conf            gzip 有効化、/assets/ は長期キャッシュ、try_files
└── src/
    ├── main.ts           ルーティング・ビュー切替・UI の配線（唯一のエントリ）
    ├── languages.ts      学習対象の言語レジストリ（LANGUAGES / LanguageId）
    ├── editor.ts         Monaco 初期化、worker 設定、コンパイラ設定、型エラー購読
    ├── runner.ts         TS→JS 変換、Worker 実行、タイムアウト
    ├── harness.ts        採点ハーネス（Monaco 非依存の純粋な文字列モジュール）
    ├── progress.ts       localStorage（レッスンごとのコード下書き・完了状態。言語スコープキー）
    ├── style.css
    ├── lessons/
    │   ├── types.ts            Lesson インターフェース（level: 入門/初級/上級）
    │   ├── part1-intro.ts      入門 1〜6
    │   ├── part2-basics.ts     初級 1〜6
    │   ├── part3-advanced.ts   上級 1〜7（型の応用）
    │   ├── part4-reading.ts    上級 8〜13（実践・読解）
    │   └── index.ts            4ファイルをこの順で結合
    └── lessons.test.ts   レッスンデータの整合性チェック
└── e2e/check.mjs         ブラウザ検証（devサーバーが起動している必要がある）
```

題材にしている実コード（**読み取り専用**。編集しない）:

- 型: `frontend/src/types/api.ts`、`frontend/src/types/pipeline.ts`
- core: `core/src/validate.ts`、`core/src/api/server.ts`、`core/src/pipeline.ts`、`core/src/pipelineCore.ts`
- frontend: `frontend/src/lib/selectionBounds.ts`、`frontend/src/lib/selectionLogic.ts`、`frontend/src/components/ParameterPanel.tsx`、`frontend/src/lib/previewBudget.ts`、`frontend/src/hooks/useMapLibreRectangleSelection.ts`
- worker: `worker/src/index.ts`
- 構成: machimoki の `README.md` / `AGENTS.md`

（パスは `../machimoki/` からの相対）

## 実行と採点の仕組み

### 「実行」ボタン
1. 表示中モデル（`file:///lesson.ts`）を Monaco 内蔵の TS サービスで JS に変換（`getEmitOutput`）
2. ブートストラップ（`console` を乗っ取り `postMessage` に変換 + 完了通知 + `//# sourceURL=main.ts`）と連結
3. Blob から **module worker** として実行し、ログを画面へ逐次転送
4. 3秒で `terminate()` →「実行を中断しました（無限ループの可能性）」

### 「判定」ボタン
1. 非表示モデル（`file:///grading.ts`）に `HARNESS + ユーザーコード + lesson.tests + REPORT` を連結してコンパイル
2. 同じ仕組みで実行し、`__GRADE__` 行を `parseGrade` で読んで ✅/❌ を表示
3. 全問正解なら `progress.ts` に完了を記録

### 型チェック
Monaco の診断を `onDidChangeMarkers` で購読して一覧表示する。採点用の非表示モデルは
`onlyVisible: true` により診断対象から除外している。

## 開発

```bash
npm install
npm run dev        # http://localhost:5174 （Tailscale からもアクセス可）
npm run build      # tsc --noEmit && vite build
npm run preview    # http://localhost:4174 （ビルド成果物の確認）
npm run check      # レッスンデータ整合性（Node 24 のTS実行 + assert）
npm run e2e        # 実ブラウザ検証（devサーバーの起動が必要）
```

## レッスンの追加・修正

`src/lessons/types.ts` の `Lesson` を満たすオブジェクトを `part1-intro` 〜 `part4-reading` のいずれかに追加する。
タイトルの番号は「編ごとの連番」（入門 1〜、初級 1〜、上級 1〜）にする。`lang` は `src/languages.ts` の定義に合わせる。

```ts
export interface Lesson {
  id: string          // 一意。localStorage のキーになるので変更しない
  title: string       // 例: '3. unknown と型述語'（編内の連番）
  level: '入門' | '初級' | '上級'
  lang: 'ts'          // 言語ID（src/languages.ts の LANGUAGES に定義）
  explanation: string // Markdown
  starter: string     // エディタの初期コード
  hints?: string[]
  tests?: string      // check(name, actual, expected) を呼ぶだけ
  solution?: string
}
```

### 執筆方針（重要）

1. **課題と入出力例は `starter` の先頭コメントに書く。** 解説（`explanation`）をスクロールしないと
   条件が分からない状態にしない。求められる対応表・既定値もコメントに書く。
2. **「値を書き換えるだけ」の穴埋め課題は禁止。** 関数やロジックを実装させる。
3. `explanation` は「なぜそう書くのか」の説明に集中させる（条件の置き場にしない）。
4. `id` は変えない（進捗の保存キー）。`title` の番号は編構成の変更に伴い振り直すことがある。
5. `starter` に構文エラーを入れない。型エラーは**意図したものだけ**にし、コメントで明示する。
6. `import` / `export` を `starter` / `tests` / `solution` に書かない（単一ファイルを Worker で実行するため）。
   トップレベル `await` は module worker なので使用可。
7. `tests` が参照する変数名・関数名は `starter` のコメントと一致させる（一致しないと採点が壊れる）。
8. `solution` は `tests` が全て通ること。
9. 浮動小数の誤差が出る比較は避ける（`check` は JSON 文字列比較）。
   オブジェクトを比較する場合は solution と期待値のキー順を揃える。

### 変更後に必ず実行する検証

```bash
npm run check      # データ整合性（構文・必須項目・ID重複・level・solution+tests の構文）
npx tsc --noEmit   # アプリ本体の型チェック
npm run e2e        # 実ブラウザ: ランディング動線/ハッシュ直リンク/進捗移行/実行/判定/型エラー/中断/復元 + 全レッスンの解答が全問正解・型エラー無し
```

`npm run e2e` は **全レッスンの解答を読み込んで判定し、全問正解かつ型エラーが出ないこと**まで確認する。
レッスンを追加したらこのテストが自動で対象に含める。

## デプロイ（Docker + Nginx Proxy Manager）

```bash
docker build -t playground .
docker run -d --name playground --network shared-network playground
```

Nginx Proxy Manager で `playground.aosy.f5.si` → コンテナの 80 番へ転送する。
`vite.config.ts` の `allowedHosts` に公開ドメインを入れておくこと（開発サーバー・preview 共通）。

- `npm run build` の成果物は完全な静的サイト（外部CDN参照なし）
- nginx 側で gzip を有効にしている（TSコンパイラの Worker が約7MBあるため）
- **開発サーバーをそのまま外部公開しない**。共有時は `npm run preview` か Docker を使う

## 実装上の注意・落とし穴

- **Monaco 0.56 で ESM パスが再編成された。** 公式ドキュメント（mainブランチ）は旧パスのままなので、
  そのまま真似すると解決できない（exports map の関係で `monaco-editor/esm/vs/...` は使えない）。
  実際に使うパスは `monaco-editor/editor`、`monaco-editor/languages/definitions/typescript/register`、
  `monaco-editor/languages/features/typescript/register`、`.../ts.worker?worker`、`editor/editor.worker?worker`。
- `monaco.languages.typescript` は 0.55 で非推奨。`register` モジュールから `typescriptDefaults` /
  `getTypeScriptWorker` を直接使う。
- コンパイラ設定は `target: ES2020` / `module: ESNext` / `strict: true` /
  **`moduleDetection: 3`（Force）**。最後の設定が無いと、トップレベル `await` に
  「モジュールではありません」という**誤った型エラー**が出る（実行環境は module worker なので実態と合わない）。
- `DiagnosticsOptions` のプロパティ名は `noSyntaxValidation`（`noSyntacticValidation` ではない）。
- **Monaco は描画時にトークン間の空白を U+00A0（NBSP）で出力する。** Playwright で
  `innerText` を普通の空白を含む文字列と比較すると一致しない。e2e では正規化済み。
- 実行を module worker にしているのは、ユーザーコードが `import` / `export` を書いても壊れないため。
- **Monaco は遅延ロード**（`editor.ts` を動的 import）。ビューは `.view` + `.active` クラスで切り替え、
  非表示中はサイズが 0 になるため、レッスン表示時に `editor.layout()` を呼ぶ。
- ルーティングは `main.ts` の `parseRoute` が担当（`#/` / `#/ts/<tier>` / `#/ts/<tier>/<id>`）。
  `currentIndex` は **-1 で初期化**している。0 にすると「最初のレッスンへ初回遷移したときに
  内容が表示されない」バグになる（`activateLesson` がスキップされるため）。
- e2e は body の背景色（ランディングの `#0a0f16` = `rgb(10, 15, 22)`）で CSS 適用を判定している。
  ランディングの配色を変えたらこの期待値も更新する。
- `playwright` は `1.61.1` に固定している（ローカルのブラウザキャッシュを再利用するため）。
  上げる場合は `npx playwright install chromium` が必要。
- Docker ビルドでは `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` を設定してブラウザを落とさない。

## 今後: 別言語（Python）を追加する場合

UI は言語非依存。`src/languages.ts` に `{ id: 'py', label: 'Python', desc: '言語の簡単な説明' }` を足し、Python のレッスン一式に `lang: 'py'` を設定すると、
トップページの言語アコーディオン・URL（`#/py/...`）・進捗キー（`playground-progress:py`）がそのまま使える。
差し替えるのは **`editor.ts` / `runner.ts` / `harness.ts` の3ファイル** だけ。採点フロー・Docker/nginx はそのまま使える。

- 実行エンジンは [Pyodide](https://pyodide.org/)（CPython の WASM 版）。npm パッケージ `pyodide` は約14MB
- **module worker が必須**（`importScripts()` の classic worker は非対応）
- `setStdout` / `setStderr` の `batched` ハンドラで出力を `postMessage` に流す
- 出力の停止は `worker.terminate()`。ただし Pyodide は起動に数秒かかるため、中断のたびに再起動コストがかかる
- 自己ホスト手順: `pyodide` + `vite-plugin-static-copy` を追加し、`optimizeDeps.exclude: ['pyodide']`、
  `loadPyodide({ indexURL })` でローカル配信する（`.whl` を同梱すれば完全オフライン）
- **COOP/COEP ヘッダは不要**（`SharedArrayBuffer` を使わないため、nginx の変更も不要）
- Monaco の Python は**シンタックスハイライトのみ**（TSのような型チェック・補完は無い）
- 対話的な `input()` は Worker では現実的でないため、レッスンは `input()` を使わない設計にする

その他の言語も同じ枠組みで扱える（SQL: sqlite-wasm、Lua/Ruby: WASMビルド など）。
