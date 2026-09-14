/** 学習対象の言語。追加するときはここに1行足し、各レッスンに lang を設定する */
export const LANGUAGES = [
  {
    id: 'ts',
    label: 'TypeScript',
    desc: 'JavaScript に型を足した言語です。型の基本から、実コードを読むための応用まで段階的に学びます。',
  },
] as const

export type LanguageId = (typeof LANGUAGES)[number]['id']
