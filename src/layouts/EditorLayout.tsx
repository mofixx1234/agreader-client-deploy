import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { AppNavbar } from '../components/AppNavbar'
import { EditorSidebar, type EditorToolId } from '../components/EditorSidebar'
import { EditorPreview } from '../components/EditorPreview'
import { EditorDraggablePanels, isDraggableTool } from '../components/draggable/EditorDraggablePanels'
import { EditorCustomizationProvider } from '../components/draggable/EditorCustomizationContext'
import { ShareModal } from '../components/modals/ShareModal'
import { useDocuments } from '../api/hooks/useDocuments'

export function EditorLayout() {
  const { id: routeDocumentId } = useParams<{ id: string }>()
  const documentId = routeDocumentId ?? ''
  const { usePages, useDetails } = useDocuments()
  const pagesQuery = usePages(documentId)
  const detailsQuery = useDetails(documentId)

  const [toolsOpen, setToolsOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [activeTool, setActiveTool] = useState<EditorToolId | null>(null)

  const closeTools = () => setToolsOpen(false)
  const openTool = (id: EditorToolId) => {
    closeTools()
    if (isDraggableTool(id)) setActiveTool(id)
  }
  const openShare = () => {
    closeTools()
    setShareOpen(true)
  }

  useEffect(() => {
    if (!toolsOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setToolsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [toolsOpen])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = () => {
      if (mq.matches) setToolsOpen(false)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  if (!routeDocumentId) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppNavbar variant="editor" tone="editor" active="edit" />
        <div className="flex flex-1 items-center justify-center bg-gray-100 px-4 text-center">
          <p className="text-sm text-gray-700">Identifiant de document manquant dans l’URL.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppNavbar variant="editor" tone="editor" active="edit" />
      <EditorCustomizationProvider documentId={documentId}>
        <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
          <div className="hidden shrink-0 lg:block">
            <EditorSidebar onShareClick={openShare} onItemClick={openTool} />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 lg:hidden">
              <button
                type="button"
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-950 shadow-sm transition-colors hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
                aria-expanded={toolsOpen}
                aria-controls="editor-tools-drawer"
                aria-label={toolsOpen ? 'Fermer les outils' : 'Ouvrir les outils du flipbook'}
                onClick={() => setToolsOpen((o) => !o)}
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5 shrink-0 text-gray-800" aria-hidden />
                Outils du flipbook
              </button>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
              {(detailsQuery.data?.originalName || documentId) && (
                <div className="shrink-0 border-b border-gray-200 bg-gray-50/80 px-3 py-2 sm:px-4">
                  <h1 className="truncate text-sm font-semibold text-gray-900">
                    {detailsQuery.data?.originalName ?? 'Document'}
                  </h1>
                  {typeof detailsQuery.data?.pageCount === 'number' && (
                    <p className="truncate text-xs text-gray-500">
                      {detailsQuery.data.pageCount} page{detailsQuery.data.pageCount > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
              <EditorPreview
                pages={pagesQuery.data?.pages ?? []}
                isPending={pagesQuery.isPending}
                isError={pagesQuery.isError}
                error={pagesQuery.error}
                documentStatus={pagesQuery.data?.status}
                expectedPageCount={pagesQuery.data?.pageCount ?? null}
                onRetry={() => pagesQuery.refetch()}
                pdfUrl={detailsQuery.data?.pdfUrl ?? null}
                downloadFileName={detailsQuery.data?.originalName ?? null}
              />
            </div>
          </div>
        </div>

        {/* Drawer outils — mobile / tablette (< lg) */}
        <div
          className={`fixed inset-0 top-[60px] z-[35] lg:hidden ${toolsOpen ? '' : 'pointer-events-none'}`}
          aria-hidden={!toolsOpen}
        >
          <button
            type="button"
            className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ease-out ${
              toolsOpen ? 'opacity-100' : 'opacity-0'
            }`}
            aria-label="Fermer les outils"
            tabIndex={toolsOpen ? 0 : -1}
            onClick={closeTools}
          />
          <aside
            id="editor-tools-drawer"
            inert={!toolsOpen}
            className={`absolute bottom-0 left-0 top-0 flex w-[min(20rem,90vw)] max-w-[260px] flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 ease-out ${
              toolsOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Outils du flipbook"
          >
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2.5">
              <span className="text-sm font-semibold text-gray-900">Outils</span>
              <button
                type="button"
                className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/25"
                aria-label="Fermer"
                onClick={closeTools}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <EditorSidebar
                embedded
                className="border-r-0"
                onShareClick={openShare}
                onItemClick={openTool}
              />
            </div>
          </aside>
        </div>
        <EditorDraggablePanels activeTool={activeTool} onClose={() => setActiveTool(null)} />
      </EditorCustomizationProvider>
      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  )
}
