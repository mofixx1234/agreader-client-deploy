import { useParams } from "react-router-dom";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { EditorPreview } from "../components/EditorPreview";
import { useDocuments } from "../api/hooks/useDocuments";

export function PublicFlipbookPage() {
  const { id } = useParams<{ id: string }>();
  const documentId = id ?? "";
  const { usePublicView } = useDocuments();
  const publicQuery = usePublicView(documentId);

  if (!documentId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f3f3f3] px-4">
        <p className="text-sm text-gray-700">Lien public invalide.</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh min-h-0 flex-col bg-[#efefef]">
      <header className="shrink-0 border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between gap-3">
          <h1 className="truncate text-sm font-semibold text-gray-900">
            {publicQuery.data?.originalName ?? "Flipbook public"}
          </h1>
          <button
            type="button"
            onClick={() => publicQuery.refetch()}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Actualiser
          </button>
        </div>
      </header>

      <section className="flex min-h-0 w-full flex-1 flex-col">
        <EditorPreview
          pages={publicQuery.data?.pages ?? []}
          isPending={publicQuery.isPending}
          isError={publicQuery.isError}
          error={publicQuery.error}
          documentStatus={publicQuery.data?.status}
          expectedPageCount={publicQuery.data?.pageCount ?? null}
          onRetry={() => publicQuery.refetch()}
          pdfUrl={publicQuery.data?.pdfUrl ?? null}
          downloadFileName={publicQuery.data?.originalName ?? null}
          viewerPermissions={publicQuery.data?.permissions ?? null}
          viewerAppearance={publicQuery.data?.appearance ?? null}
        />
      </section>
    </main>
  );
}
