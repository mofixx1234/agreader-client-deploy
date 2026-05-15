import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const bookDir = path.dirname(fileURLToPath(import.meta.url))

/** Mini-app statique : Turn.js + PDF (dossier `turni-test/`). */
export default defineConfig({
  root: path.join(bookDir, 'turni-test'),
  resolve: {
    dedupe: ['jquery'],
  },
  optimizeDeps: {
    include: ['jquery', 'turn.js', 'pdfjs-dist'],
  },
})
