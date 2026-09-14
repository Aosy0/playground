import { defineConfig } from 'vite'

// Nginx Proxy Manager 経由でアクセスされる想定のホスト名。
// 開発サーバー・プレビューともに、これ以外の Host ヘッダは拒否される。
const allowedHosts = [
  'localhost',
  '127.0.0.1',
  'playground.aosy.f5.si',
  '100.86.253.43',
]

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/monaco-editor')) return 'monaco'
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts,
  },
  preview: {
    host: '0.0.0.0',
    port: 4174,
    allowedHosts,
  },
})
