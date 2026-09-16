import * as monaco from 'monaco-editor/editor'
import 'monaco-editor/languages/definitions/typescript/register'
import {
  ModuleKind,
  ScriptTarget,
  typescriptDefaults,
} from 'monaco-editor/languages/features/typescript/register'
import TsWorker from 'monaco-editor/languages/features/typescript/ts.worker?worker'
import EditorWorker from 'monaco-editor/editor/editor.worker?worker'

// Monaco は worker を自分で生成するため、Vite の ?worker インポートを渡す
;(globalThis as { MonacoEnvironment?: unknown }).MonacoEnvironment = {
  getWorker(_workerId: string, label: string): Worker {
    if (label === 'typescript' || label === 'javascript') return new TsWorker()
    return new EditorWorker()
  },
}

// mode: machimoki の tsconfig.json に合わせて strict を有効にする
typescriptDefaults.setCompilerOptions({
  target: ScriptTarget.ES2020,
  module: ModuleKind.ESNext,
  // 実行環境（module worker）と同じく「全ファイルをモジュール」として扱う。
  // これが無いとトップレベル await が「モジュールではありません」という
  // 誤ったエラーとして表示される（3 = ModuleDetectionKind.Force）
  moduleDetection: 3,
  strict: true,
  allowNonTsExtensions: true,
})

// 採点用の非表示モデルでは型チェックを走らせない（onlyVisible）
typescriptDefaults.setDiagnosticsOptions({
  noSemanticValidation: false,
  noSyntaxValidation: false,
  onlyVisible: true,
})

export interface EditorApi {
  model: monaco.editor.ITextModel
  getValue: () => string
  setValue: (value: string) => void
  onMarkers: (callback: (markers: monaco.editor.IMarker[]) => void) => void
  layout: () => void
  setWordWrap: (on: boolean) => void
}

export function createEditor(
  container: HTMLElement,
  initialValue: string,
  handlers: { onChange: (code: string) => void; onRun: () => void },
): EditorApi {
  const model = monaco.editor.createModel(
    initialValue,
    'typescript',
    monaco.Uri.parse('file:///lesson.ts'),
  )
  const editor = monaco.editor.create(container, {
    model,
    theme: 'vs-dark',
    automaticLayout: true,
    fontSize: 14,
    tabSize: 2,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    // 折り返しはモバイル幅のみ。デスクトップは従来どおり横スクロール。
    wordWrap: window.matchMedia('(max-width: 768px)').matches ? 'on' : 'off',
    padding: { top: 8, bottom: 8 },
  })

  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, handlers.onRun)
  editor.onDidChangeModelContent(() => handlers.onChange(model.getValue()))

  let markerTimer: ReturnType<typeof setTimeout> | undefined
  const onMarkers = (callback: (markers: monaco.editor.IMarker[]) => void): void => {
    monaco.editor.onDidChangeMarkers(() => {
      clearTimeout(markerTimer)
      markerTimer = setTimeout(
        () => callback(monaco.editor.getModelMarkers({ resource: model.uri })),
        200,
      )
    })
  }

  return {
    model,
    getValue: () => model.getValue(),
    setValue: (value: string) => model.setValue(value),
    onMarkers,
    layout: () => editor.layout(),
    setWordWrap: (on: boolean) => editor.updateOptions({ wordWrap: on ? 'on' : 'off' }),
  }
}
