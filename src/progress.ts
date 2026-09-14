import type { LanguageId } from './languages.ts'

/** 旧キー。新キーが空のときだけ一度きりの移行に使う */
const LEGACY_KEY = 'ts-playground-progress'

const key = (lang: LanguageId) => `playground-progress:${lang}`

/** 保存時の starter を記録しておき、レッスン内容が更新されたら破棄する */
interface Entry {
  code: string
  base: string
}

interface Store {
  code: Record<string, Entry>
  done: string[]
}

function read(lang: LanguageId): Store {
  try {
    let raw = localStorage.getItem(key(lang))
    if (!raw) {
      // 旧キーからの移行は TypeScript のときだけ。失敗しても既定値で続行する
      const legacy = lang === 'ts' ? localStorage.getItem(LEGACY_KEY) : null
      if (legacy) {
        localStorage.setItem(key(lang), legacy)
        raw = legacy
      }
    }
    if (!raw) return { code: {}, done: [] }
    const parsed = JSON.parse(raw) as { code?: Record<string, unknown>; done?: string[] }
    const code: Record<string, Entry> = {}
    for (const [id, value] of Object.entries(parsed.code ?? {})) {
      // 旧形式（string 直保存）は内容が古い可能性があるため捨てる
      if (value && typeof value === 'object' && 'code' in value && 'base' in value) {
        code[id] = value as Entry
      }
    }
    return { code, done: parsed.done ?? [] }
  } catch {
    return { code: {}, done: [] }
  }
}

function write(lang: LanguageId, store: Store): void {
  localStorage.setItem(key(lang), JSON.stringify(store))
}

/** starter が一致するときだけ保存されたコードを返す（レッスン更新時は初期コードに戻す） */
export function getSavedCode(lang: LanguageId, id: string, starter: string): string | null {
  const entry = read(lang).code[id]
  if (!entry || entry.base !== starter) return null
  return entry.code
}

export function saveCode(lang: LanguageId, id: string, code: string, starter: string): void {
  const store = read(lang)
  store.code[id] = { code, base: starter }
  write(lang, store)
}

export function clearCode(lang: LanguageId, id: string): void {
  const store = read(lang)
  delete store.code[id]
  write(lang, store)
}

export function getDoneIds(lang: LanguageId): string[] {
  return read(lang).done
}

export function markDone(lang: LanguageId, id: string): void {
  const store = read(lang)
  if (!store.done.includes(id)) {
    store.done.push(id)
    write(lang, store)
  }
}
