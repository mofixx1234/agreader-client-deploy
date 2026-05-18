import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Connect } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const bookDir = fileURLToPath(new URL('.', import.meta.url))
const turnRoot = path.resolve(bookDir, 'turnjs4')

const MIME_BY_EXT: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
}

/** Sert `/turnjs4/*` hors `public/` (échantillons Turn.js) et copie dans `dist` au build */
/** Requêtes que Vite doit traiter lui-même (imports ESM depuis .jpg, etc.) — ne pas répondre en fichier brut */
function skipTurnjsMiddlewareForVite(url: string): boolean {
  const q = url.includes('?') ? url.slice(url.indexOf('?') + 1).split('#')[0] : ''
  if (!q) return false
  // ex. foo.jpg?import — le navigateur attend du JS module, pas l’image brute
  if (/\bimport\b/.test(q)) return true
  return false
}

function serveTurnjs4Book(): Connect.NextHandleFunction {
  return function turnjsMiddleware(req, res, next) {
    const fullUrl = req.url ?? ''
    if (skipTurnjsMiddlewareForVite(fullUrl)) return next()

    const pathname = decodeURIComponent(fullUrl.split('?')[0] ?? '')
    if (!pathname.startsWith('/turnjs4')) return next()

    let rel = pathname.replace(/^\/turnjs4\/?/, '')
    if (!rel) rel = ''

    const abs =
      path.extname(rel) === '' ? path.resolve(turnRoot, rel || '.', 'index.html') : path.resolve(turnRoot, rel)

    const normTurn = path.resolve(turnRoot) + path.sep
    const normAbs = path.normalize(abs)
    if (!normAbs.startsWith(normTurn) && normAbs !== path.resolve(turnRoot)) {
      res.statusCode = 403
      res.end()
      return
    }

    fs.stat(normAbs, (errStat, stat) => {
      if (errStat || !stat.isFile()) return next()
      fs.readFile(normAbs, (errRead, data) => {
        if (errRead) return next()
        const ext = path.extname(normAbs).toLowerCase()
        res.setHeader('Content-Type', MIME_BY_EXT[ext] ?? 'application/octet-stream')
        res.statusCode = 200
        res.end(data)
      })
    })
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'turnjs4-book-copy',
      configureServer(server) {
        server.middlewares.use(serveTurnjs4Book())
      },
      configurePreviewServer(server) {
        server.middlewares.use(serveTurnjs4Book())
      },
      writeBundle() {
        const dist = path.join(bookDir, 'dist')
        if (!fs.existsSync(dist)) return
        const outDir = path.join(dist, 'turnjs4')
        fs.rmSync(outDir, { recursive: true, force: true })
        fs.cpSync(turnRoot, outDir, { recursive: true })

        const requiredViewer = path.join(
          outDir,
          'samples',
          'editor-dynamic',
          'index.html',
        )
        if (!fs.existsSync(requiredViewer)) {
          throw new Error(`Turn.js viewer was not copied to ${requiredViewer}`)
        }
      },
    },
  ],
  resolve: {
    dedupe: ['jquery'],
  },
  optimizeDeps: {
    include: ['jquery', 'turn.js'],
  },
})
