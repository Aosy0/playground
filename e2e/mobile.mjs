// Code Atlas のモバイル表示検証（Playwright / ヘッドレス, 390x844 / タッチ）
// 前提: 開発サーバーが http://localhost:5174 で起動していること
// 実行: npm run e2e:mobile
// 範囲: タブ切替 / 実行・判定後の結果タブ遷移 / その他メニュー / 一覧シート / デスクトップ回帰

import { chromium } from 'playwright'

const BASE = 'http://localhost:5174/'
const results = []
const record = (name, pass, extra = '') => {
  results.push({ name, pass: Boolean(pass), extra })
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}${extra ? ' :: ' + extra : ''}`)
}

const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})
const pageErrors = []
page.on('pageerror', (error) => pageErrors.push(String(error)))
page.on('console', (message) => {
  if (message.type() === 'error') pageErrors.push('console: ' + message.text())
})
page.on('dialog', (dialog) => void dialog.accept())

const waitFor = async (fn, label, timeout = 60000) => {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    if (await fn()) return true
    await page.waitForTimeout(200)
  }
  record(`タイムアウト: ${label}`, false)
  return false
}
const visible = (selector) => page.locator(selector).first().isVisible()

// --- モバイル: ランディング ---
await page.goto(BASE, { waitUntil: 'load' })
await page.waitForSelector('#landing.active .tier-card', { timeout: 30000 })
record('モバイル: ランディングが表示される', await visible('.tier-card'))

// --- レッスン画面へ ---
await page.locator('.tier-card[data-tier="intro"] .tier-start').click()
await page.waitForSelector('.monaco-editor', { timeout: 60000 })
await page.waitForTimeout(500)
record('モバイル: タブバーが表示される', await visible('#mobile-tabs'))
record('モバイル: 一覧ボタンが表示される', await visible('#list-open'))
record('モバイル: 初期表示はコードタブ', (await visible('#code-pane')) && !(await visible('#explanation')) && !(await visible('#side')))
const editorBox = await page.locator('.monaco-editor').first().boundingBox()
record('モバイル: エディタが十分な高さで表示される', Boolean(editorBox && editorBox.height >= 300), editorBox ? `h=${Math.round(editorBox.height)}` : 'none')

// --- 未実行の結果タブ: 空状態の案内（プレースホルダ）---
await page.locator('#tab-result').tap()
await page.waitForTimeout(300)
const placeholders = await page.evaluate(() => ({
  console: String(getComputedStyle(document.getElementById('console'), '::after').content),
  results: String(getComputedStyle(document.getElementById('results'), '::after').content),
}))
record(
  'モバイル: 未実行の結果タブに空状態の案内が出る',
  placeholders.console.includes('出力はありません') && placeholders.results.includes('まだ判定していません'),
  JSON.stringify(placeholders),
)
await page.locator('#tab-code').tap()
await page.waitForTimeout(200)

// --- タブ切替 ---
await page.locator('#tab-explanation').tap()
await page.waitForTimeout(200)
record('モバイル: 解説タブで解説のみ表示', (await visible('#explanation')) && !(await visible('#code-pane')))
await page.locator('#tab-code').tap()
await page.waitForTimeout(300)
const editorBox2 = await page.locator('.monaco-editor').first().boundingBox()
record('モバイル: コードタブ復帰時にエディタが表示される', (await visible('#code-pane')) && Boolean(editorBox2 && editorBox2.height >= 300), editorBox2 ? `h=${Math.round(editorBox2.height)}` : 'none')

// --- 実行 → 結果タブ自動遷移 + 出力 ---
await page.locator('#run').tap()
const ranOk = await waitFor(async () => (await page.locator('#console .line').count()) > 0, '実行出力')
record('モバイル: 実行で出力が出る', ranOk)
record('モバイル: 実行後に結果タブへ自動遷移', (await page.locator('#tab-result').getAttribute('aria-selected')) === 'true' && (await visible('#side')))
const summaryText = (await page.locator('#summary').innerText()) ?? ''
record(
  'モバイル: 結果サマリーが更新される',
  !summaryText.includes('まだ実行していません') && /型エラーが\d+件|実行が終わりました|全問正解|不正解/.test(summaryText),
  summaryText,
)

// --- 判定 → バッジ表示 ---
await page.locator('#tab-code').tap()
await page.waitForTimeout(200)
await page.locator('.monaco-editor .view-lines').first().tap()
await page.keyboard.press('Control+a')
await page.keyboard.insertText('const broken = 1')
await page.waitForTimeout(600)
await page.locator('#check').tap()
const badgeOk = await waitFor(async () => !(await page.locator('#result-badge').isHidden()), 'NGバッジ')
record('モバイル: 判定NGで結果タブにバッジが出る', badgeOk, await page.locator('#result-badge').innerText().catch(() => ''))

// --- その他メニュー ---
await page.locator('#tab-code').tap()
await page.waitForTimeout(200)
await page.locator('#more').tap()
await page.waitForTimeout(200)
record('モバイル: その他メニューが開く', (await visible('#more-menu')) && (await visible('#hint')) && (await visible('#solution')) && (await visible('#reset')))
await page.locator('#hint').tap()
await page.waitForTimeout(300)
record('モバイル: ヒントで解説タブへ遷移しヒントが表示される', (await visible('#explanation')) && ((await page.locator('#explanation').innerText()) ?? '').includes('ヒント'))

// --- レッスン一覧シート ---
await page.locator('#list-open').tap()
await page.waitForTimeout(300)
record('モバイル: 一覧シートが開く', (await visible('#lesson-list')) && (await visible('#list-close')) && (await visible('#sheet-backdrop')))
const focusInSheet = await page.evaluate(() => document.activeElement?.classList.contains('lesson-item') || document.activeElement?.id === 'list-close')
record('モバイル: シート表示時にフォーカスが入る', focusInSheet)
const before = await page.locator('#lesson-title').innerText()
await page.locator('#lesson-list .lesson-item').nth(2).tap()
await page.waitForTimeout(500)
const after = await page.locator('#lesson-title').innerText()
record('モバイル: シートから別レッスンへ切替できる', before !== after && !(await visible('#sheet-backdrop')), `${before} -> ${after}`)
record('モバイル: シートを閉じると一覧ボタンへフォーカスが戻る', (await page.evaluate(() => document.activeElement?.id)) === 'list-open')
record('モバイル: 解説タブでのレッスン切替は解説のまま', await visible('#explanation'))

// --- 結果タブからレッスン切替時は結果(前レッスンの残骸)を引き継がない ---
await page.locator('#tab-code').tap()
await page.waitForTimeout(200)
await page.locator('#run').tap()
await waitFor(async () => (await page.locator('#tab-result').getAttribute('aria-selected')) === 'true', '結果タブへの再遷移')
await page.locator('#list-open').tap()
await page.waitForTimeout(300)
await page.locator('#lesson-list .lesson-item').nth(3).tap()
await page.waitForTimeout(500)
record('モバイル: 結果タブから切替時はコードタブへ戻る', await visible('#code-pane'))

// --- デスクトップ回帰（1600x900） ---
const desktop = await browser.newPage({ viewport: { width: 1600, height: 900 } })
await desktop.goto(BASE + '#/ts/intro/basics-hello', { waitUntil: 'load' })
await desktop.waitForSelector('.monaco-editor', { timeout: 60000 })
await desktop.waitForTimeout(500)
const css = await desktop.evaluate(() => ({
  codePane: getComputedStyle(document.getElementById('code-pane')).display,
  moreMenu: getComputedStyle(document.getElementById('more-menu')).display,
  moreBtn: getComputedStyle(document.getElementById('more')).display,
  summary: getComputedStyle(document.getElementById('summary-panel')).display,
  tabs: getComputedStyle(document.getElementById('mobile-tabs')).display,
  listOpen: getComputedStyle(document.getElementById('list-open')).display,
  hint: getComputedStyle(document.getElementById('hint')).display,
  consoleAfter: String(getComputedStyle(document.getElementById('console'), '::after').content),
}))
record(
  'デスクトップ: 既存レイアウトが維持される',
  css.codePane === 'contents' && css.moreMenu === 'contents' && css.moreBtn === 'none' &&
    css.summary === 'none' && css.tabs === 'none' && css.listOpen === 'none' && css.hint !== 'none' &&
    css.consoleAfter === 'none',
  JSON.stringify(css),
)
const widthOk = await desktop.evaluate(() => {
  const main = document.querySelector('#lesson-view main')
  return getComputedStyle(main).gridTemplateColumns.split(' ').length >= 5
})
record('デスクトップ: mainが5カラムグリッドのまま', widthOk)

// 長い行の折り返しは「視覚行数」で判定する（Monacoのスクロール幅は仮想化のため当てにならない）
const wrapProbe = async (p) => {
  await p.locator('.monaco-editor .view-lines').first().click()
  await p.keyboard.press('Control+a')
  await p.keyboard.insertText(`const long = '${'A'.repeat(240)}'`)
  await p.waitForTimeout(1200)
  return p.evaluate(() => {
    const lines = [...document.querySelectorAll('.monaco-editor .view-lines > .view-line')]
    return { visualLines: lines.length, hasLong: lines.some((l) => l.textContent.includes('AAAA')) }
  })
}
const desktopWrap = await wrapProbe(desktop)
record(
  'デスクトップ: 長い行は折り返さない（横スクロール維持）',
  desktopWrap.hasLong && desktopWrap.visualLines === 1,
  JSON.stringify(desktopWrap),
)

await desktop.goto(BASE + '#/ts/intro/basics-hello', { waitUntil: 'load' })
await desktop.waitForSelector('.monaco-editor', { timeout: 60000 })
await desktop.waitForTimeout(800)
const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
})
await mobile.goto(BASE + '#/ts/intro/basics-hello', { waitUntil: 'load' })
await mobile.waitForSelector('.monaco-editor', { timeout: 60000 })
await mobile.waitForTimeout(800)
const mobileWrap = await wrapProbe(mobile)
record(
  'モバイル: 長い行は折り返す（横スクロールなし）',
  mobileWrap.hasLong && mobileWrap.visualLines > 1,
  JSON.stringify(mobileWrap),
)

// ブレークポイントをまたぐリサイズ（スマホ縦→横など）でも折返し設定が追従する
await mobile.setViewportSize({ width: 1200, height: 844 })
await mobile.waitForTimeout(1000)
const resized = await mobile.evaluate(() => {
  const lines = [...document.querySelectorAll('.monaco-editor .view-lines > .view-line')]
  return { visualLines: lines.length, hasLong: lines.some((l) => l.textContent.includes('AAAA')) }
})
record(
  'デスクトップ幅へリサイズすると折り返さない',
  resized.hasLong && resized.visualLines === 1,
  JSON.stringify(resized),
)

record('ブラウザのJSエラーなし', pageErrors.length === 0, pageErrors.join(' / '))

await browser.close()
const failed = results.filter((r) => !r.pass)
console.log(`\n--- 結果: ${results.length - failed.length}/${results.length} PASS ---`)
if (failed.length > 0) {
  console.log('FAILED:')
  for (const f of failed) console.log(`- ${f.name} ${f.extra}`)
  process.exit(1)
}
