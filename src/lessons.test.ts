// レッスンデータの整合性チェック（依存ゼロ・Node 24 のTS実行で動く）
//   npm run check
import assert from 'node:assert/strict'
import ts from 'typescript'
import { HARNESS, REPORT, parseGrade } from './harness.ts'
import { LANGUAGES } from './languages.ts'
import { LEVELS } from './lessons/types.ts'
import { lessons } from './lessons/index.ts'

function syntaxErrors(code: string, label: string): string[] {
  const output = ts.transpileModule(code, {
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  })
  return (output.diagnostics ?? [])
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => `${label}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, ' ')}`)
}

assert.ok(lessons.length > 0, 'レッスンが1件もありません')

const ids = new Set<string>()
for (const lesson of lessons) {
  assert.ok(lesson.id.length > 0, 'id が空のレッスンがあります')
  assert.ok(!ids.has(lesson.id), `id が重複しています: ${lesson.id}`)
  ids.add(lesson.id)

  assert.ok(lesson.title.length > 0, `${lesson.id}: title が空です`)
  assert.ok(LEVELS.includes(lesson.level), `${lesson.id}: level が不正です`)
  assert.ok(
    LANGUAGES.some((l) => l.id === lesson.lang),
    `${lesson.id}: lang が不正です`,
  )
  assert.ok(lesson.explanation.length > 0, `${lesson.id}: explanation が空です`)
  assert.ok(lesson.starter.length > 0, `${lesson.id}: starter が空です`)
  assert.ok(lesson.expected.length > 0, `${lesson.id}: expected が空です`)

  const errors = [
    ...syntaxErrors(lesson.starter, `${lesson.id} starter`),
    ...syntaxErrors(lesson.solution ?? '', `${lesson.id} solution`),
    ...syntaxErrors(lesson.tests ?? '', `${lesson.id} tests`),
  ]
  assert.deepEqual(errors, [], errors.join('\n'))

  if (lesson.tests) {
    // 採点コードは「ハーネス + ユーザーコード + テスト」の連結で実行されるため、
    // その形で構文が通ることも確認する
    const combined = `${HARNESS}\n${lesson.solution ?? lesson.starter}\n${lesson.tests}\n${REPORT}`
    assert.deepEqual(syntaxErrors(combined, `${lesson.id} (採点)`), [])
  }
}

// report() の出力を parseGrade が読めること
const sample = parseGrade(['__GRADE__[{"name":"a","ok":true,"got":"1","want":"1"}]'])
assert.ok(sample && sample.length === 1 && sample[0].ok, 'parseGrade が採点結果を読めません')
assert.equal(parseGrade(['ログ']), null)

console.log(`OK: ${lessons.length} レッスン`)
