/* Design memo: routing + lazy Monaco + landing with tier cards.
   Existing lesson logic preserved; sidebar now grouped by difficulty levels. */

import { marked } from 'marked'
import type { EditorApi } from './editor.ts'
import { compileModel, compileSource, runJs, type RunnerMessage } from './runner.ts'
import { GRADE_PREFIX, HARNESS, REPORT, parseGrade } from './harness.ts'
import { lessons } from './lessons/index.ts'
import { clearCode, getDoneIds, getSavedCode, markDone, saveCode } from './progress.ts'
import { LANGUAGES, type LanguageId } from './languages.ts'
import type { Level } from './lessons/types.ts'

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T

// --- Tier mapping ---
const LEVEL_TO_KEY: Record<Level, TierKey> = {
  '入門': 'intro',
  '初級': 'basic',
  '上級': 'advanced',
}

const KEY_TO_LEVEL: Record<TierKey, Level> = {
  intro: '入門',
  basic: '初級',
  advanced: '上級',
}

type TierKey = 'intro' | 'basic' | 'advanced'

// --- DOM refs ---
const landingEl = $('landing')
const lessonViewEl = $('lesson-view')
const lessonListEl = $('lesson-list')
const lessonTitleEl = $('lesson-title')
const statusEl = $('status')
const explanationEl = $('explanation')
const editorHost = $('editor')
const consoleEl = $('console')
const diagnosticsEl = $('diagnostics')
const resultsEl = $('results')
const expectedEl = $('expected')
const runButton = $<HTMLButtonElement>('run')
const checkButton = $<HTMLButtonElement>('check')
const hintButton = $<HTMLButtonElement>('hint')
const solutionButton = $<HTMLButtonElement>('solution')
const resetButton = $<HTMLButtonElement>('reset')
const solutionModal = $('solution-modal')
const solutionCodeEl = $('solution-code')
const solutionApplyButton = $<HTMLButtonElement>('solution-apply')
const solutionRestoreButton = $<HTMLButtonElement>('solution-restore')
const solutionCloseButton = $<HTMLButtonElement>('solution-close')
const langSectionsContainer = $<HTMLDivElement>('lang-sections')

// --- State ---
const completed = new Map<LanguageId, Set<string>>(
  LANGUAGES.map((lang) => [lang.id, new Set(getDoneIds(lang.id))]),
)
let editor: EditorApi | null = null
let currentIndex = -1
let hintIndex = 0
let running: { kill: () => void } | null = null
let grading = false
let gradeSeen = false
let loading = true
// 解答例の反映前に退避した自分のコード。反映時に保存を抑止しているため
// localStorage 側にも自分のコードが残るが、復元はこの退避から行う。
let solutionBackup: { key: string; code: string } | null = null

const currentLesson = () => lessons[currentIndex]
const currentKey = (): string => `${currentLesson().lang}:${currentLesson().id}`

// --- Routing ---
function parseRoute(hash: string): { view: 'landing' } | { view: 'tier'; tier: TierKey } | { view: 'lesson'; tier: TierKey; lessonId: string } {
  const path = hash.replace(/^#/, '').replace(/^\/+|\/+$/g, '')
  if (!path || path === '/') return { view: 'landing' }

  const parts = path.split('/')
  if (!LANGUAGES.some((lang) => lang.id === parts[0])) return { view: 'landing' }

  const tier = parts[1]
  if (!tier || !['intro', 'basic', 'advanced'].includes(tier)) return { view: 'landing' }

  if (parts.length === 2) return { view: 'tier', tier: tier as TierKey }
  if (parts.length === 3) return { view: 'lesson', tier: tier as TierKey, lessonId: parts[2] }
  return { view: 'landing' }
}

function switchView(view: 'landing' | 'lesson') {
  landingEl.classList.toggle('active', view === 'landing')
  lessonViewEl.classList.toggle('active', view === 'lesson')
  if (editor && view === 'lesson') {
    editor.layout()
  }
}

// --- Landing ---
const TIER_DEFS: { key: TierKey; title: string; desc: string }[] = [
  { key: 'intro', title: '入門', desc: 'プログラミングが初めての人向け。変数、条件分岐、配列から始めます。' },
  { key: 'basic', title: '初級', desc: '他の言語を知っている人向け。TypeScriptの型システムの基本を学びます。' },
  { key: 'advanced', title: '上級', desc: '型の応用と、machimokiの実際のコードを読む演習です。全体マップもこちら。' },
]

function renderLanding(): void {
  langSectionsContainer.innerHTML = ''

  for (const lang of LANGUAGES) {
    const langLessons = lessons.filter((l) => l.lang === lang.id)
    const doneSet = completed.get(lang.id) ?? new Set<string>()

    const section = document.createElement('section')
    section.className = 'lang-card'
    section.dataset.lang = lang.id

    const totalDone = langLessons.filter((l) => doneSet.has(l.id)).length

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = 'lang-toggle'
    toggle.setAttribute('aria-expanded', 'true')
    toggle.setAttribute('aria-controls', `lang-panel-${lang.id}`)

    const label = document.createElement('span')
    label.className = 'lang-label'
    label.textContent = lang.label

    const summary = document.createElement('span')
    summary.className = 'lang-summary'
    summary.textContent = `${totalDone}/${langLessons.length} 完了`

    const mark = document.createElement('span')
    mark.className = 'lang-mark'
    mark.setAttribute('aria-hidden', 'true')

    toggle.append(label, summary, mark)

    const panel = document.createElement('div')
    panel.className = 'lang-panel'
    panel.id = `lang-panel-${lang.id}`

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true'
      toggle.setAttribute('aria-expanded', String(!expanded))
      panel.hidden = expanded
    })

    const langDesc = document.createElement('p')
    langDesc.className = 'lang-desc'
    langDesc.textContent = lang.desc
    panel.append(langDesc)

    for (const def of TIER_DEFS) {
      const tierLessons = langLessons.filter((l) => LEVEL_TO_KEY[l.level] === def.key)
      if (tierLessons.length === 0) continue
      const tierDone = tierLessons.filter((l) => doneSet.has(l.id)).length

      const card = document.createElement('article')
      card.className = 'tier-card'
      card.dataset.tier = def.key

      const meta = document.createElement('div')
      meta.className = 'tier-meta'

      const h2 = document.createElement('h2')
      h2.textContent = def.title

      const p = document.createElement('p')
      p.className = 'tier-desc'
      p.textContent = def.desc

      const progress = document.createElement('div')
      progress.className = 'tier-progress'
      const countSpan = document.createElement('span')
      countSpan.className = 'progress-count'
      countSpan.textContent = `${tierDone}/${tierLessons.length}`
      const labelSpan = document.createElement('span')
      labelSpan.className = 'progress-label'
      labelSpan.textContent = ' 完了'
      progress.append(countSpan, labelSpan)

      meta.append(h2, p, progress)

      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'tier-start'
      btn.textContent = 'はじめる'
      btn.addEventListener('click', () => {
        location.hash = `#/${lang.id}/${def.key}`
      })

      card.append(meta, btn)
      panel.append(card)
    }

    const firstIncomplete = langLessons.find((l) => !doneSet.has(l.id))
    if (firstIncomplete) {
      const continueBtn = document.createElement('button')
      continueBtn.type = 'button'
      continueBtn.className = 'continue-btn'
      continueBtn.dataset.lang = lang.id
      continueBtn.textContent = '続きから'
      continueBtn.addEventListener('click', () => {
        const idx = lessons.findIndex((l) => l.id === firstIncomplete.id)
        if (idx >= 0) navigateToLesson(idx)
      })
      panel.append(continueBtn)
    }

    section.append(toggle, panel)
    langSectionsContainer.append(section)
  }
}

// --- Editor lazy init ---
async function initEditorIfNeeded(): Promise<void> {
  if (editor) return
  const { createEditor } = await import('./editor.ts')
  editor = createEditor(editorHost, '', {
    onChange: (code) => {
      if (loading) return
      const lesson = currentLesson()
      saveCode(lesson.lang, lesson.id, code, lesson.starter)
    },
    onRun: () => void run(),
  })

  editor.onMarkers((markers) => {
    diagnosticsEl.replaceChildren(
      ...markers.map((marker) => {
        const item = document.createElement('li')
        item.className = 'diag'
        const where = document.createElement('span')
        where.className = 'where'
        where.textContent = `${marker.startLineNumber}行目: `
        item.append(where, document.createTextNode(marker.message))
        return item
      }),
    )
  })
}

// --- Lesson list with tier headings ---
function renderLessonList(): void {
  lessonListEl.innerHTML = ''
  let currentTier: Level | '' = ''

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    if (lesson.level !== currentTier) {
      currentTier = lesson.level
      const heading = document.createElement('div')
      heading.className = 'tier-heading'
      heading.textContent = currentTier
      heading.dataset.tier = LEVEL_TO_KEY[currentTier]
      lessonListEl.append(heading)
    }

    const done = completed.get(lesson.lang)?.has(lesson.id) ?? false
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'lesson-item'
    button.classList.toggle('active', i === currentIndex)
    button.classList.toggle('done', done)
    button.textContent = `${done ? '✅' : '　'} ${lesson.title}`
    button.addEventListener('click', () => navigateToLesson(i))
    lessonListEl.append(button)
  }
}

function navigateToLesson(index: number): void {
  const lesson = lessons[index]
  const tierKey = LEVEL_TO_KEY[lesson.level]
  location.hash = `#/${lesson.lang}/${tierKey}/${lesson.id}`
}

function activateLesson(index: number): void {
  currentIndex = index
  hintIndex = 0
  solutionBackup = null
  solutionModal.hidden = true
  const lesson = currentLesson()

  loading = true
  lessonTitleEl.textContent = lesson.title
  explanationEl.innerHTML = marked.parse(lesson.explanation) as string
  expectedEl.textContent = lesson.expected
  if (!editor) throw new Error('Editor not initialized')
  editor.setValue(getSavedCode(lesson.lang, lesson.id, lesson.starter) ?? lesson.starter)
  loading = false

  clearOutput()
  resultsEl.replaceChildren()
  renderLessonList()
}

// --- Runner / output ---
function appendOutput(text: string, kind: 'log' | 'error' = 'log'): void {
  const line = document.createElement('div')
  line.className = `line ${kind}`
  line.textContent = text
  consoleEl.append(line)
  consoleEl.scrollTop = consoleEl.scrollHeight
}

function clearOutput(): void {
  consoleEl.replaceChildren()
}

function setBusy(busy: boolean): void {
  runButton.disabled = busy
  checkButton.disabled = busy
  statusEl.textContent = busy ? '実行中…' : ''
}

function renderGrade(line: string): void {
  gradeSeen = true
  const results = parseGrade([line])
  resultsEl.replaceChildren()
  if (!results) return

  for (const result of results) {
    const item = document.createElement('li')
    item.className = `result ${result.ok ? 'ok' : 'ng'}`
    item.textContent = `${result.ok ? '✅' : '❌'} ${result.name}`
    if (!result.ok) {
      const detail = document.createElement('div')
      detail.className = 'detail'
      detail.textContent = `期待: ${result.want} / 実際: ${result.got}`
      item.append(detail)
    }
    resultsEl.append(item)
  }

  if (results.length > 0 && results.every((result) => result.ok)) {
    const lesson = currentLesson()
    markDone(lesson.lang, lesson.id)
    completed.get(lesson.lang)?.add(lesson.id)
    renderLessonList()
    appendOutput('🎉 全問正解です！')
  }
}

function handleMessage(message: RunnerMessage): void {
  switch (message.t) {
    case 'log':
      if (message.s.startsWith(GRADE_PREFIX)) renderGrade(message.s)
      else appendOutput(message.s)
      return
    case 'error':
      appendOutput(message.s, 'error')
      return
    case 'uncaught':
      appendOutput(message.s, 'error')
      running?.kill()
      running = null
      setBusy(false)
      return
    case 'done':
      running = null
      setBusy(false)
      if (grading && !gradeSeen) {
        appendOutput('判定できませんでした（テストの実行前にエラーで終了した可能性があります）', 'error')
      }
      grading = false
      return
  }
}

async function run(): Promise<void> {
  if (running || !editor) return
  grading = false
  clearOutput()
  setBusy(true)
  try {
    const js = await compileModel(editor.model)
    running = runJs(js, handleMessage)
  } catch (error) {
    appendOutput(error instanceof Error ? error.message : String(error), 'error')
    setBusy(false)
  }
}

async function check(): Promise<void> {
  if (running || !editor) return
  const lesson = currentLesson()
  if (!lesson.tests) {
    appendOutput('このレッスンには自動判定がありません。「実行」で動作を確認してください。')
    return
  }

  grading = true
  gradeSeen = false
  resultsEl.replaceChildren()
  clearOutput()
  setBusy(true)
  try {
    const source = `${HARNESS}\n${editor.getValue()}\n${lesson.tests}\n${REPORT}`
    const js = await compileSource(source)
    running = runJs(js, handleMessage)
  } catch (error) {
    appendOutput(error instanceof Error ? error.message : String(error), 'error')
    setBusy(false)
  }
}

function showHint(): void {
  const hints = currentLesson().hints ?? []
  if (hintIndex >= hints.length) {
    appendOutput('ヒントは以上です。')
    return
  }
  const hint = hints[hintIndex]
  hintIndex += 1
  const block = document.createElement('p')
  block.className = 'hint'
  block.textContent = `💡 ヒント${hintIndex}: ${hint}`
  explanationEl.append(block)
  explanationEl.scrollTop = explanationEl.scrollHeight
}

function showSolution(): void {
  const solution = currentLesson().solution
  if (!solution) {
    appendOutput('このレッスンには解答例がありません。')
    return
  }
  solutionCodeEl.textContent = solution
  solutionRestoreButton.hidden = solutionBackup?.key !== currentKey()
  solutionModal.hidden = false
  solutionCloseButton.focus()
}

function closeSolution(): void {
  solutionModal.hidden = true
}

function applySolution(): void {
  const solution = currentLesson().solution
  if (!solution || !editor) return
  if (editor.getValue() !== solution) {
    if (!confirm('解答例をエディタに読み込みます。自分のコードにはいつでも戻せます。よろしいですか？')) return
    solutionBackup = { key: currentKey(), code: editor.getValue() }
    loading = true
    editor.setValue(solution)
    loading = false
  }
  closeSolution()
}

function restoreMyCode(): void {
  if (!editor || solutionBackup?.key !== currentKey()) return
  loading = true
  editor.setValue(solutionBackup.code)
  loading = false
  solutionBackup = null
  closeSolution()
}

function reset(): void {
  if (!confirm('このレッスンのコードを初期状態に戻します。よろしいですか？')) return
  if (!editor) return
  loading = true
  editor.setValue(currentLesson().starter)
  loading = false
  clearCode(currentLesson().lang, currentLesson().id)
  clearOutput()
  resultsEl.replaceChildren()
}

// --- Resizable splitters ---
const NAV_MIN = 160
const NAV_MAX = 480
const SIDE_MIN = 240
const SIDE_MAX = 640
const EXP_MIN = 80
const EDITOR_MIN = 120
const PANEL_MIN = 60
const KEY_STEP = 10
const GUTTER = 6

const clamp = (v: number, min: number, max: number): number => Math.min(Math.max(v, min), max)

function setupSplitters(): void {
  const root = document.documentElement
  let raf = 0
  const scheduleLayout = (): void => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      editor?.layout()
    })
  }
  const setVar = (name: string, px: number): void => {
    root.style.setProperty(name, `${Math.round(px)}px`)
  }
  const getVarPx = (name: string): number => parseFloat(getComputedStyle(root).getPropertyValue(name)) || 0

  const workEl = $('work')
  const toolbarEl = $('toolbar')
  const sideEl = $('side')

  // side内パネルがまだ minmax(0,1fr) の場合、初回ドラッグ時にpx化する
  const ensureSidePx = (): { h0: number; h1: number; h2: number; total: number } => {
    const total = sideEl.getBoundingClientRect().height - GUTTER * 3
    let h0 = getVarPx('--side-h0')
    let h1 = getVarPx('--side-h1')
    let h2 = getVarPx('--side-h2')
    if (!h0 || !h1 || !h2) {
      h0 = total / 4
      h1 = total / 4
      h2 = total / 4
      setVar('--side-h0', h0)
      setVar('--side-h1', h1)
      setVar('--side-h2', h2)
      setVar('--side-h3', total - h0 - h1 - h2)
    }
    return { h0, h1, h2, total }
  }

  const applyDelta = (pane: string, delta: number): void => {
    if (pane === 'nav') {
      const nav = $('lesson-list').getBoundingClientRect().width
      const base = getVarPx('--nav-width') || nav
      setVar('--nav-width', clamp(base + delta, NAV_MIN, NAV_MAX))
    } else if (pane === 'side') {
      const w = sideEl.getBoundingClientRect().width
      const base = getVarPx('--side-width') || w
      // 右ガター: 右に動かす(delta>0)とsideが狭まる
      setVar('--side-width', clamp(base - delta, SIDE_MIN, SIDE_MAX))
    } else if (pane === 'exp') {
      const exp = $('explanation').getBoundingClientRect().height
      const base = getVarPx('--explanation-height') || exp
      const maxH = workEl.getBoundingClientRect().height
        - toolbarEl.getBoundingClientRect().height - GUTTER - EDITOR_MIN
      setVar('--explanation-height', clamp(base + delta, EXP_MIN, Math.max(EXP_MIN, maxH)))
    } else if (pane === 'side0') {
      const { h0, h1, h2, total } = ensureSidePx()
      const startH0 = getVarPx('--side-h0') || h0
      const curH1 = getVarPx('--side-h1') || h1
      const curH2 = getVarPx('--side-h2') || h2
      const nextH0 = clamp(startH0 + delta, PANEL_MIN, total - curH1 - curH2 - PANEL_MIN)
      setVar('--side-h0', nextH0)
      setVar('--side-h3', total - nextH0 - curH1 - curH2)
    } else if (pane === 'side1') {
      const { h0, h1, h2, total } = ensureSidePx()
      const curH0 = getVarPx('--side-h0') || h0
      const startH1 = getVarPx('--side-h1') || h1
      const curH2 = getVarPx('--side-h2') || h2
      const nextH1 = clamp(startH1 + delta, PANEL_MIN, total - curH0 - curH2 - PANEL_MIN)
      setVar('--side-h1', nextH1)
      setVar('--side-h3', total - curH0 - nextH1 - curH2)
    } else if (pane === 'side2') {
      const { h0, h1, h2, total } = ensureSidePx()
      const curH0 = getVarPx('--side-h0') || h0
      const curH1 = getVarPx('--side-h1') || h1
      const startH2 = getVarPx('--side-h2') || h2
      const nextH2 = clamp(startH2 + delta, PANEL_MIN, total - curH0 - curH1 - PANEL_MIN)
      setVar('--side-h2', nextH2)
      setVar('--side-h3', total - curH0 - curH1 - nextH2)
    }
    scheduleLayout()
  }

  document.querySelectorAll<HTMLElement>('.gutter').forEach((gutter) => {
    const pane = gutter.dataset.pane ?? ''
    const horizontal = gutter.classList.contains('gutter-horizontal')

    gutter.addEventListener('pointerdown', (e) => {
      e.preventDefault()
      gutter.setPointerCapture(e.pointerId)
      // ドラッグ開始時点の値をpx化して基準にする（相対delta方式の誤差蓄積を防ぐ）
      if (pane === 'nav') setVar('--nav-width', getVarPx('--nav-width') || $('lesson-list').getBoundingClientRect().width)
      if (pane === 'side') setVar('--side-width', getVarPx('--side-width') || sideEl.getBoundingClientRect().width)
      if (pane === 'exp') setVar('--explanation-height', getVarPx('--explanation-height') || $('explanation').getBoundingClientRect().height)
      if (pane === 'side1' || pane === 'side2') ensureSidePx()
      let lastX = e.clientX
      let lastY = e.clientY

      const onMove = (ev: PointerEvent): void => {
        const dx = ev.clientX - lastX
        const dy = ev.clientY - lastY
        lastX = ev.clientX
        lastY = ev.clientY
        applyDelta(pane, horizontal ? dx : dy)
      }
      const onUp = (): void => {
        gutter.removeEventListener('pointermove', onMove)
        gutter.removeEventListener('pointerup', onUp)
        gutter.removeEventListener('pointercancel', onUp)
        editor?.layout()
      }
      gutter.addEventListener('pointermove', onMove)
      gutter.addEventListener('pointerup', onUp)
      gutter.addEventListener('pointercancel', onUp)
    })

    gutter.addEventListener('keydown', (e) => {
      let delta = 0
      if (horizontal) {
        if (e.key === 'ArrowLeft') delta = -KEY_STEP
        else if (e.key === 'ArrowRight') delta = KEY_STEP
      } else {
        if (e.key === 'ArrowUp') delta = -KEY_STEP
        else if (e.key === 'ArrowDown') delta = KEY_STEP
      }
      if (!delta) return
      // 右ガターは左右が逆感覚にならないよう反転（→でside拡大）
      if (pane === 'side') delta = -delta
      e.preventDefault()
      applyDelta(pane, delta)
    })
  })
}

// --- Event bindings ---
runButton.addEventListener('click', () => void run())
checkButton.addEventListener('click', () => void check())
hintButton.addEventListener('click', showHint)
solutionButton.addEventListener('click', showSolution)
solutionApplyButton.addEventListener('click', applySolution)
solutionRestoreButton.addEventListener('click', restoreMyCode)
solutionCloseButton.addEventListener('click', closeSolution)
solutionModal.addEventListener('click', (e) => {
  if (e.target === solutionModal) closeSolution()
})
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !solutionModal.hidden) closeSolution()
})
resetButton.addEventListener('click', reset)

// --- Route handling ---
async function handleRoute(): Promise<void> {
  const route = parseRoute(location.hash)

  if (route.view === 'landing') {
    switchView('landing')
    renderLanding()
    return
  }

  const tierLevel = KEY_TO_LEVEL[route.tier]
  let targetIndex: number

  if (route.view === 'tier') {
    targetIndex = lessons.findIndex((l) => l.level === tierLevel)
    if (targetIndex < 0) targetIndex = 0
  } else {
    targetIndex = lessons.findIndex((l) => l.id === route.lessonId)
    if (targetIndex < 0) {
      targetIndex = lessons.findIndex((l) => l.level === tierLevel)
      if (targetIndex < 0) targetIndex = 0
    }
  }

  switchView('lesson')
  await initEditorIfNeeded()

  if (currentIndex !== targetIndex || !lessonViewEl.classList.contains('active')) {
    activateLesson(targetIndex)
  } else {
    renderLessonList()
  }
}

window.addEventListener('hashchange', () => void handleRoute())

// --- Init ---
setupSplitters()
handleRoute()
