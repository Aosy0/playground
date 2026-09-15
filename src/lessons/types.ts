import type { LanguageId } from '../languages.ts'

export const LEVELS = ['入門', '初級', '上級'] as const
export type Level = (typeof LEVELS)[number]

export interface Lesson {
  /** 一意なID。localStorage の保存キーになる */
  id: string
  title: string
  /** 難易度 */
  level: Level
  /** 言語 */
  lang: LanguageId
  /** Markdown 形式の解説 */
  explanation: string
  /** エディタに最初に表示されるコード */
  starter: string
  /** solution適用時に出力欄へ出る期待表示（サイドバー「期待する出力」に表示） */
  expected: string
  /** 「ヒント」ボタンで1つずつ表示される */
  hints?: string[]
  /** 判定コード。HARNESS が用意する check(name, actual, expected) を呼ぶ */
  tests?: string
  /** 「解答例」ボタンでエディタに読み込むコード */
  solution?: string
}
