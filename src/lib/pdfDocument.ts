import { getDocument, type PDFDocumentLoadingTask, type PDFDocumentProxy } from 'pdfjs-dist'
import { configurePdfWorker } from './pdfWorker'

configurePdfWorker()

export function loadPdf(url: string): PDFDocumentLoadingTask {
  return getDocument({
    url,
    useSystemFonts: true,
  })
}

export type { PDFDocumentProxy }
