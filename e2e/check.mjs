// Code Atlas の動作検証（Playwright / ヘッドレス）
// 前提: 開発サーバーが http://localhost:5174 で起動していること
// 実行: npm run e2e
// 範囲: ランディング（難易度選択・進捗移行）→ レッスン画面（実行/判定/型エラー/中断/復元）→ 全レッスンの解答判定

import { chromium } from 'playwright'

const BASE = 'http://localhost:5174/'
const results = []
const record = (name, pass, extra = '') => {
  results.push({ name, pass: Boolean(pass), extra })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } })
const pageErrors = []
page.on('pageerror', (error) => pageErrors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') pageErrors.push('console: ' + message.text())
})
page.on('dialog', (dialog) => void dialog.accept())

const waitFor = async (fn, label, timeout = 60000) => {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await fn()) return
    await page.waitForTimeout(200)
  }
  throw new Error(`タイムアウト: ${label}`)
}

/** ページ内の式を評価して真になるまで待つ（innerText は NBSP を含む点に注意） */
const waitForPage = (expression, label, timeout = 60000) =>
  waitFor(() => page.evaluate(expression), label, timeout)

// Monaco はトークン間の空白を U+00A0 で描画するため正規化して比較する
const editorText = async () =>
  (await page.locator('.view-lines').first().innerText()).replace(/\u00a0/g, ' ')

const hasEditorText = (needle) => () => editorText().then((text) => text.includes(needle))

const setEditor = async (code) => {
  await page.locator('.monaco-editor .view-lines').click()
  await page.keyboard.press('Control+a')
  await page.keyboard.insertText(code)
  await page.waitForTimeout(400)
}

const clickButton = (name) => page.getByRole('button', { name }).click()

// 0) ランディング: 表示・CSS・難易度カード・続きから
await page.goto(BASE, { waitUntil: 'load' })
await page.waitForSelector('#landing.active .tier-card', { timeout: 30000 })
record('ランディングページが表示される', true)
record('旧タグラインが表示されていない', (await page.locator('.landing-tagline').count()) === 0)

// CSS が JS ではなく HTML から読み込まれている（先に当たっている）
const bodyBackground = await page.evaluate(
  () => getComputedStyle(document.body).backgroundColor,
)
record('CSSが適用されている', bodyBackground === 'rgb(10, 15, 22)', bodyBackground)

const tierCount = await page.locator('.tier-card').count()
record('難易度カードが3枚表示される', tierCount === 3, String(tierCount))
record(
  '「続きから」が表示される',
  await page.locator('.lang-card[data-lang="ts"] .continue-btn').isVisible(),
)

// 言語アコーディオン: 折りたたみ → 再展開（ページ遷移しない）
const langCard = page.locator('.lang-card[data-lang="ts"]')
await langCard.locator('.lang-toggle').click()
await page.waitForTimeout(200)
const collapsed =
  (await page.locator('.lang-card[data-lang="ts"] .tier-card[data-tier="intro"]').isHidden()) &&
  (await langCard.locator('.lang-toggle').getAttribute('aria-expanded')) === 'false' &&
  (await page.evaluate(() => location.hash)) === ''
record('言語ヘッダーで折りたたみできる（ハッシュは変わらない）', collapsed)
await langCard.locator('.lang-toggle').click()
await page.waitForTimeout(200)
record(
  '再展開できる',
  await page.locator('.lang-card[data-lang="ts"] .tier-card[data-tier="intro"]').isVisible(),
)

// 1) 旧キー（ts-playground-progress）からの進捗移行
await page.evaluate(() => {
  localStorage.removeItem('playground-progress:ts')
  localStorage.setItem(
    'ts-playground-progress',
    JSON.stringify({ code: {}, done: ['basic-annotations'] }),
  )
})
await page.reload({ waitUntil: 'load' })
await page.waitForSelector('#landing.active .tier-card', { timeout: 30000 })
const migratedCount = await page.evaluate(
  () => document.querySelector('.tier-card[data-tier="basic"] .progress-count')?.textContent ?? '',
)
record('旧キーの進捗が言語スコープキーへ移行される', migratedCount === '1/6', migratedCount)
await page.evaluate(() => {
  localStorage.removeItem('playground-progress:ts')
  localStorage.removeItem('ts-playground-progress')
})
await page.reload({ waitUntil: 'load' })
await page.waitForSelector('#landing.active .tier-card', { timeout: 30000 })

// 2) 「はじめる」でレッスン画面へ（初回遷移の表示を含む）
await page.locator('.tier-card[data-tier="intro"] .tier-start').click()
await page.waitForSelector('.monaco-editor', { timeout: 60000 })
record('「はじめる」でレッスン画面が開く', true)
await waitFor(hasEditorText('greet'), '入門1本目の starter', 30000)
const headerTitle = (await page.locator('#lesson-title').innerText()).replace(/\u00a0/g, ' ')
const explanationText = await page.locator('#explanation').innerText()
record(
  '初回遷移でレッスン名・解説・初期コードが表示される',
  headerTitle.includes('値と表示') && explanationText.includes('型'),
  `${headerTitle} / 解説${explanationText.length}文字`,
)

// 3) 実行: 出力行が出る
await clickButton(/実行/)
await waitForPage(
  "(document.querySelectorAll('#console .line').length ?? 0) > 0",
  '実行の出力',
)
record('実行で console.log の出力が出る', true)
await waitForPage("document.querySelector('#status')?.innerText === ''", 'ステータス復帰', 30000)
record('実行後にステータスが待機に戻る', true)

// 4) 判定: 未実装のままなので不正解になる
await clickButton('判定')
await waitForPage(
  "(document.querySelector('#results')?.querySelectorAll('.result.ng').length ?? 0) > 0",
  '未実装コードの判定',
)
record('判定: 未実装コードで ❌ が表示される', true)

// 5) ハッシュ直リンク（#/ts/advanced）
await page.evaluate(() => {
  location.hash = '#/ts/advanced'
})
await waitFor(hasEditorText('function first'), '上級の直リンク', 30000)
record('#/ts/advanced の直リンクで上級の1本目が開く', true)

// 6) 入門1本目へ戻る（サイドバー）
await page.getByRole('button', { name: /1\. 値と表示/ }).click()
await waitFor(hasEditorText('greet'), '入門1本目へ戻る', 15000)
record('サイドバーから別のレッスンへ切り替えられる', true)

// 7) 型エラーが一覧に出る（型の不一致が実際に検出されることまで確認する）
await setEditor("const lat: number = 'abc'\n")
await page
  .waitForFunction(
    () => (document.querySelector('#diagnostics')?.innerText ?? '').includes('not assignable'),
    null,
    { timeout: 60000 },
  )
  .then(() => record('型エラーが一覧に表示される', true))
  .catch(async () => {
    const text = await page.locator('#diagnostics').innerText()
    record('型エラーが一覧に表示される', false, text.replace(/\u00a0/g, ' ').slice(0, 90))
  })

// 8) 無限ループが3秒で中断される
await setEditor('while (true) {}\n')
await clickButton(/実行/)
await waitForPage(
  "(document.querySelector('#console')?.innerText ?? '').includes('実行を中断しました')",
  'タイムアウト中断',
  20000,
)
record('無限ループが3秒で中断される', true)

// 9) 例外がエラーとして表示される
await setEditor('notDefined()\n')
await clickButton(/実行/)
await waitForPage(
  "(document.querySelector('#console')?.innerText ?? '').includes('notDefined')",
  '例外表示',
  20000,
)
record('例外がエラーとして表示される', true)

// 10) レッスン切り替え（初級2のオブジェクトと interface）
await page.getByRole('button', { name: /2\. オブジェクトと interface/ }).click()
await waitFor(hasEditorText('interface Bounds'), 'レッスン2の初期コード', 15000)
record('レッスン一覧から切り替えられる', true)

// 11) 解答例ボタン（モーダル表示 → 自分のコードは残る → 反映で読み込み → 戻せる）
await clickButton('解答例')
await page.waitForSelector('#solution-modal:not([hidden])', { timeout: 15000 })
record('解答例ボタンで解答例モーダルが開く', true)
const beforeApply = await editorText()
record(
  '解答例の表示だけでは自分のコードが消えない',
  beforeApply.includes('interface Bounds') && !beforeApply.includes('west: 139.69'),
  beforeApply.slice(0, 60),
)
await clickButton('エディタに反映する')
await waitFor(hasEditorText('west: 139.69'), '解答の読み込み', 15000)
record('解答例ボタンで解答例が読み込まれる', true)
await clickButton('解答例')
await clickButton('自分のコードに戻す')
await waitFor(
  async () => {
    const text = await editorText()
    return text.includes('interface Bounds') && !text.includes('west: 139.69')
  },
  '自分のコードに戻す',
  15000,
)
record('解答例から自分のコードに戻せる', true)
// 12) のリセット検証用にもう一度解答を反映しておく
await clickButton('解答例')
await clickButton('エディタに反映する')
await waitFor(hasEditorText('west: 139.69'), '解答の再読み込み', 15000)

// 12) リセット
await clickButton('リセット')
await waitFor(
  async () => {
    const text = await editorText()
    return text.includes('interface Bounds') && !text.includes('west: 139.69')
  },
  'リセット',
  15000,
)
record('リセットで初期コードに戻る', true)

// 13) 判定: レッスン2の未完成コードは不正解になる
await clickButton('判定')
await waitForPage(
  "(document.querySelector('#results')?.querySelectorAll('.result.ng').length ?? 0) > 0",
  'レッスン2の判定',
)
record('判定: 未完成コードで ❌ が表示される', true)

// 14) コードの自動保存（リロード後も残る）
await page.getByRole('button', { name: /1\. 型注釈とプリミティブ/ }).click()
await setEditor('const lat: number = 35.6812\nconst lon: number = 139.7671\n\nconsole.log(lat, lon)\n')
await page.waitForTimeout(600)
await page.reload({ waitUntil: 'load' })
await page.waitForSelector('.monaco-editor', { timeout: 60000 })
await waitFor(hasEditorText('35.6812'), 'リロード後の復元', 30000)
record('リロード後もコードが保存されている', true)

// 15) 全レッスン: 解答を読み込んで判定 → 全問正解になること
const lessonCount = await page.locator('#lesson-list button').count()
const failures = []
const diagnosticFailures = []
for (let index = 0; index < lessonCount; index += 1) {
  const item = page.locator('#lesson-list button').nth(index)
  const name = (await item.innerText()).replace(/\u00a0/g, ' ').trim()
  await item.click()
  await page.waitForTimeout(400)
  await clickButton('解答例')
  await clickButton('エディタに反映する')
  await page.waitForTimeout(1200)
  const diagnosticsText = (await page.locator('#diagnostics').innerText())
    .replace(/\u00a0/g, ' ')
    .trim()
  if (diagnosticsText.length > 0) diagnosticFailures.push(`${name}: ${diagnosticsText.split('\n')[0]}`)
  await clickButton('判定')
  await page
    .waitForFunction(
      () => {
        const results = document.querySelector('#results')
        if (!results || results.children.length === 0) return false
        const consoleText = document.querySelector('#console')?.innerText ?? ''
        return consoleText.includes('全問正解') || results.querySelectorAll('.result.ng').length > 0
      },
      null,
      { timeout: 60000 },
    )
    .catch(() => {})
  const ok = await page.locator('#results .result.ok').count()
  const ng = await page.locator('#results .result.ng').count()
  const won = (await page.locator('#console').innerText()).includes('全問正解')
  if (ng > 0 || ok === 0 || !won) failures.push(`${name} (ok=${ok} ng=${ng} won=${won})`)
}
record(`全${lessonCount}レッスン: 解答の判定が全問正解`, failures.length === 0, failures.join(' / '))
record(
  `全${lessonCount}レッスン: 解答に型エラーが無い`,
  diagnosticFailures.length === 0,
  diagnosticFailures.join(' / '),
)

// 16) 全レッスンの完了がトップページの進捗に反映される
await page.evaluate(() => {
  location.hash = '#/'
})
await page.waitForSelector('#landing.active .tier-card', { timeout: 30000 })
const progressCounts = await page.$$eval('.tier-card .progress-count', (els) =>
  els.map((el) => el.textContent ?? ''),
)
const allComplete =
  progressCounts.length === 3 &&
  progressCounts.every((text) => {
    const [done, total] = text.split('/').map(Number)
    return done > 0 && done === total
  })
record('全レッスンの完了がトップページの進捗に反映される', allComplete, progressCounts.join(', '))

// 17) レッスン内容が更新されたら、古い保存コードではなく最新の starter を表示する
await page.evaluate(() => {
  const raw = localStorage.getItem('playground-progress:ts') ?? '{"code":{},"done":[]}'
  const store = JSON.parse(raw)
  store.code['basic-annotations'] = { code: 'const lat: number = 0.0\n', base: 'STALE' }
  localStorage.setItem('playground-progress:ts', JSON.stringify(store))
  location.hash = '#/ts/basic/basic-annotations'
})
await page.reload({ waitUntil: 'load' })
await page.waitForSelector('.monaco-editor', { timeout: 60000 })
await waitFor(hasEditorText('add'), '古い保存コードの破棄', 30000)
record('内容更新後は古い保存コードを無視してstarterを表示する', true)

await page.screenshot({ path: 'screenshots/playground.png' })
record('ブラウザのJSエラーなし', pageErrors.length === 0, pageErrors.join(' | ').slice(0, 300))

console.log('\n--- 結果 ---')
for (const item of results) {
  console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}${item.extra ? ' :: ' + item.extra : ''}`)
}
await browser.close()
process.exit(results.every((item) => item.pass) ? 0 : 1)
