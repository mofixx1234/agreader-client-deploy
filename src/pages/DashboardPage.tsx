import { useMemo, useState } from "react";
import { DocumentIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";
import { toast } from "react-toastify";

import { DashboardFlipbookCard } from "../components/DashboardFlipbookCard";
import {
  DashboardToolbar,
  type DashboardDateSort,
} from "../components/DashboardToolbar";

import { useDocuments } from "../api/hooks/useDocuments";
import { useUploadModal } from "../contexts/UploadModalContext";

import type { DocumentItem } from "../api/services/document.service";

function formatDocDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function toDateInputValue(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function DashboardFlipbookCardSkeleton() {
  return (
    <div
      className="flex min-w-0 w-full animate-pulse flex-col border border-gray-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      <div className="mb-2 h-4 w-24 rounded bg-gray-200" />
      <div className="aspect-[3/4] w-full shrink-0 rounded border border-gray-100 bg-gray-100" />
      <div className="mt-3 flex flex-col gap-1.5 border-t border-gray-100 pt-3">
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-gray-200" />
          <div className="h-3 w-[85%] rounded bg-gray-200" />
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <div className="h-2.5 w-14 rounded bg-gray-200" />
          <div className="h-2.5 w-8 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function DashboardListRowSkeleton() {
  return (
    <li
      className="flex animate-pulse items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
      aria-hidden
    >
      <div className="h-11 w-11 shrink-0 rounded-xl bg-gray-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 max-w-md rounded bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-3 w-1 rounded bg-gray-100" />
          <div className="h-3 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </li>
  );
}

export function DashboardPage() {
  const [gridView, setGridView] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [dateSort, setDateSort] = useState<DashboardDateSort>("desc");
  const { open: openUpload } = useUploadModal();
  const { useList, deleteDocument } = useDocuments();
  const { data, isLoading, error } = useList();
  const documents: DocumentItem[] = data ?? [];
  const visibleDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return documents
      .filter((doc) => {
        const matchesSearch =
          query.length === 0 ||
          doc.originalName.toLowerCase().includes(query) ||
          doc.status.toLowerCase().includes(query) ||
          doc.mimeType.toLowerCase().includes(query);
        const matchesDate =
          selectedDate.length === 0 ||
          toDateInputValue(doc.createdAt) === selectedDate;
        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        const delta = aTime - bTime;
        return dateSort === "asc" ? delta : -delta;
      });
  }, [dateSort, documents, searchQuery, selectedDate]);
  const isEmpty = !isLoading && documents.length === 0;
  const hasNoResults =
    !isLoading && documents.length > 0 && visibleDocuments.length === 0;

  if (error) {
    return (
      <div className="p-10 text-center text-red-500">
        Failed to load documents
      </div>
    );
  }

  const handleDeleteDocument = (docId: string) => {
    deleteDocument.mutate(docId, {
      onSuccess: () => toast.success("Document supprimé"),
      onError: () =>
        toast.error("Impossible de supprimer le document. Réessayez."),
    });
  };

  const handleDeleteSelected = () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Supprimer ${ids.length} document${ids.length > 1 ? "s" : ""} ? Cette action est irréversible.`,
      )
    ) {
      return;
    }

    Promise.all(ids.map((id) => deleteDocument.mutateAsync(id)))
      .then(() => {
        setSelectedIds(new Set());
        toast.success(
          ids.length > 1 ? "Documents supprimés" : "Document supprimé",
        );
      })
      .catch(() =>
        toast.error(
          "Certaines suppressions ont échoué. Vérifiez la liste et réessayez.",
        ),
      );
  };

  return (
    <div className="flex w-full flex-col">
      <DashboardToolbar
        gridView={gridView}
        onToggleGrid={setGridView}
        selectedCount={selectedIds.size}
        onDeleteSelected={handleDeleteSelected}
        isDeleting={deleteDocument.isPending}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        dateSort={dateSort}
        onDateSortChange={setDateSort}
        flipbooksUsed={isLoading ? 0 : documents.length}
        visibleFlipbooks={isLoading ? 0 : visibleDocuments.length}
      />

      <div
        className="mx-auto w-full max-w-[1600px] px-3 py-4 sm:px-5 sm:py-5"
        aria-busy={isLoading}
        aria-label={isLoading ? "Chargement des documents" : undefined}
      >
        {isLoading ? (
          gridView ? (
            <div className="grid grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(200px,220px))]">
              {Array.from({ length: 8 }, (_, i) => (
                <DashboardFlipbookCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {Array.from({ length: 6 }, (_, i) => (
                <DashboardListRowSkeleton key={i} />
              ))}
            </ul>
          )
        ) : isEmpty ? (
          <div className="flex h-[78vh] items-center justify-center">
            <div className="w-full max-w-3xl rounded-3xl border border-gray-200 bg-white px-10 py-20 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
                  <DocumentIcon className="h-11 w-11 text-red-500" />
                </div>

                <h2 className="mt-8 text-xl font-bold text-gray-900">
                  Aucun document disponible
                </h2>

                <p className="mt-4 max-w-xl text-lg text-gray-500">
                  Commencez par importer votre premier document PDF pour créer
                  votre flipbook.
                </p>

                <button
                  onClick={openUpload}
                  className="mt-10 flex items-center gap-3 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600"
                >
                  <CloudArrowUpIcon className="h-5 w-5" />
                  Nouveau document
                </button>

                <p className="mt-8 text-sm text-gray-400">
                  Glissez-déposez un fichier PDF, DOCX, PPTX ou image
                </p>
              </div>
            </div>
          </div>
        ) : hasNoResults ? (
          <div className="flex h-[58vh] items-center justify-center">
            <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white px-8 py-12 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <DocumentIcon className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="mt-6 text-lg font-bold text-gray-900">
                Aucun resultat
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Aucun flipbook ne correspond a cette recherche ou a cette date.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDate("");
                }}
                className="mt-6 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
              >
                Reinitialiser les filtres
              </button>
            </div>
          </div>
        ) : gridView ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:[grid-template-columns:repeat(auto-fill,minmax(200px,220px))]">
              {visibleDocuments.map((doc) => (
                <DashboardFlipbookCard
                  key={doc.documentId}
                  doc={doc}
                  formatDocDate={formatDocDate}
                  selected={selectedIds.has(doc.documentId)}
                  onToggleSelect={() => {
                    setSelectedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(doc.documentId)) next.delete(doc.documentId);
                      else next.add(doc.documentId);
                      return next;
                    });
                  }}
                  onDelete={() => handleDeleteDocument(doc.documentId)}
                  isDeleting={
                    deleteDocument.isPending &&
                    deleteDocument.variables === doc.documentId
                  }
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <ul className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {visibleDocuments.map((doc) => (
                <li
                  key={doc.documentId}
                  className="flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                    <DocumentIcon className="h-7 w-7 text-red-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-800">
                      {doc.originalName}
                    </p>

                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {doc.status}
                      </span>

                      <span className="text-xs text-gray-300">•</span>

                      <span className="text-xs text-gray-500">
                        {doc.pageCount ?? 0} pages
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
