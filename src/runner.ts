import * as monaco from 'monaco-editor/editor'
import { getTypeScriptWorker } from 'monaco-editor/languages/features/typescript/register'

export type RunnerMessage =
  | { t: 'log'; s: string }
  | { t: 'error'; s: string }
  | { t: 'uncaught'; s: string }
  | { t: 'done' }

async function emit(model: monaco.editor.ITextModel): Promise<string> {
  const getClient = await getTypeScriptWorker()
  const client = await getClient(model.uri)
  const output = await client.getEmitOutput(model.uri.toString())
  const js = output.outputFiles.find((file) => file.name.endsWith('.js'))
  if (!js) throw new Error('コンパイル結果が空でした（構文エラーがある可能性があります）')
  return js.text
}

/** 表示中のモデル（＝エディタのコード）を JavaScript に変換する */
export function compileModel(model: monaco.editor.ITextModel): Promise<string> {
  return emit(model)
}

/** エディタに表示しないコード（採点用）を JavaScript に変換する */
export async function compileSource(source: string): Promise<string> {
  const uri = monaco.Uri.parse('file:///grading.ts')
  monaco.editor.getModel(uri)?.dispose()
  const model = monaco.editor.createModel(source, 'typescript', uri)
  try {
    return await emit(model)
  } finally {
    model.dispose()
  }
}

// Worker 側の前置き。ユーザーコードの行番号を保つため、行数ぶんだけ後で差し引く。
const BOOTSTRAP = `const __fmt = (value) => {
  if (typeof value === 'string') return value;
  if (value === null || typeof value !== 'object') return String(value);
  try { return JSON.stringify(value); } catch { return String(value); }
};
globalThis.console = {
  log: (...args) => postMessage({ t: 'log', s: args.map(__fmt).join(' ') }),
  info: (...args) => postMessage({ t: 'log', s: args.map(__fmt).join(' ') }),
  warn: (...args) => postMessage({ t: 'log', s: '[warn] ' + args.map(__fmt).join(' ') }),
  error: (...args) => postMessage({ t: 'error', s: args.map(__fmt).join(' ') }),
  debug: () => {},
};
self.addEventListener('unhandledrejection', (event) => {
  postMessage({ t: 'uncaught', s: 'Promise のエラー: ' + __fmt(event.reason) });
});`

const BOOTSTRAP_LINES = BOOTSTRAP.split('\n').length

export interface RunHandle {
  kill: () => void
}

export function runJs(
  js: string,
  onMessage: (message: RunnerMessage) => void,
  timeoutMs = 3000,
): RunHandle {
  const trailer = `setTimeout(() => postMessage({ t: 'done' }), 0);\n//# sourceURL=main.ts`
  const url = URL.createObjectURL(
    new Blob([`${BOOTSTRAP}\n${js}\n${trailer}`], { type: 'text/javascript' }),
  )
  // ユーザーコードが import/export を書いても壊れないよう module worker にする
  const worker = new Worker(url, { type: 'module' })

  let finished = false
  const finish = (message?: RunnerMessage): void => {
    if (finished) return
    finished = true
    clearTimeout(timer)
    worker.terminate()
    URL.revokeObjectURL(url)
    if (message) onMessage(message)
  }

  const timer = setTimeout(
    () =>
      finish({
        t: 'uncaught',
        s: `実行を中断しました（${timeoutMs / 1000}秒を超えました。無限ループの可能性があります）`,
      }),
    timeoutMs,
  )

  worker.onmessage = (event: MessageEvent<RunnerMessage>) => {
    const message = event.data
    // 完了通知も UI に流す（finish は worker の後始末だけを行う）
    if (message.t === 'done') finish(message)
    else onMessage(message)
  }

  worker.onerror = (event: ErrorEvent) => {
    const line = event.lineno ? event.lineno - BOOTSTRAP_LINES - 1 : 0
    const where = line > 0 ? `（${line}行目付近）` : ''
    finish({ t: 'uncaught', s: `${event.message || 'エラーが発生しました'}${where}` })
  }

  return { kill: () => finish() }
}
