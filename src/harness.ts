// 採点用のハーネス。Monaco に依存しない純粋な文字列モジュール
// （lessons.test.ts からも読み込んで構文チェックする）

export const GRADE_PREFIX = '__GRADE__'

/** ユーザーコードの前に差し込む。テストは check(name, actual, expected) を呼ぶだけ */
export const HARNESS = `const __norm = (value) => JSON.stringify(value, (_key, item) =>
  item && typeof item === 'object' && !Array.isArray(item)
    ? Object.fromEntries(Object.keys(item).sort().map((key) => [key, item[key]]))
    : item);

const __results = [];

function check(name, actual, expected) {
  const got = __norm(actual);
  const want = __norm(expected);
  __results.push({ name: String(name), ok: got === want, got: String(got), want: String(want) });
}`

/** ユーザーコードとテストの後ろに差し込む */
export const REPORT = `console.log('${GRADE_PREFIX}' + JSON.stringify(__results));`

export interface CheckResult {
  name: string
  ok: boolean
  got: string
  want: string
}

export function parseGrade(lines: string[]): CheckResult[] | null {
  const line = lines.find((text) => text.startsWith(GRADE_PREFIX))
  if (!line) return null
  try {
    return JSON.parse(line.slice(GRADE_PREFIX.length)) as CheckResult[]
  } catch {
    return null
  }
}
