import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CursorArrowRaysIcon,
  EyeIcon,
  LinkIcon,
  PencilSquareIcon,
  ShareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DocumentIcon } from "@heroicons/react/24/solid";

import { documentService } from "../api/services/document.service";
import type { DocumentItem } from "../api/services/document.service";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

type MenuRowProps = {
  Icon: SvgIcon;
  label: string;
  onClick?: () => void;
  to?: string;
};

function MenuRow({ Icon, label, onClick, to }: MenuRowProps) {
  const className =
    "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] text-gray-700 transition hover:bg-gray-100";

  if (to) {
    return (
      <Link to={to} className={`${className} no-underline`}>
        <Icon className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      <Icon className="h-4 w-4 shrink-0 text-gray-600" aria-hidden />
      {label}
    </button>
  );
}

type DashboardFlipbookCardProps = {
  doc: DocumentItem;
  formatDocDate: (iso: string) => string;
  selected: boolean;
  onToggleSelect: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
};

export function DashboardFlipbookCard({
  doc,
  formatDocDate,
  selected,
  onToggleSelect,
  onDelete,
  isDeleting,
}: DashboardFlipbookCardProps) {
  const [menuDismissed, setMenuDismissed] = useState(false);
  const editorPath = `/editor/${doc.documentId}`;
  const publicPath = `/public/${doc.documentId}`;

  const getPublicDocumentUrl = async (): Promise<string | null> => {
    await documentService.publicView(doc.documentId);
    return `${window.location.origin}${publicPath}`;
  };

  const copyFlipbookLink = async () => {
    try {
      const url = await getPublicDocumentUrl();
      if (!url) {
        toast.info("Aucun lien public disponible pour ce document");
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papiers");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const shareFlipbookLink = async () => {
    try {
      const url = await getPublicDocumentUrl();
      if (!url) {
        toast.info("Aucun lien public disponible pour ce document");
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: doc.originalName,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Lien public copié (partage non supporté sur ce navigateur)");
    } catch {
      toast.error("Impossible de partager ce lien");
    }
  };

  const openPreview = () => {
    const url = doc.pdfUrl ?? doc.sourceUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else toast.info("Aperçu indisponible pour ce document");
  };

  return (
    <div
      className={`group/card relative flex min-w-0 w-full flex-col border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] transition hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] ${
        selected ? "border-[#ff3301] ring-2 ring-[#ff3301]/25" : "border-gray-200"
      }`}
      onMouseLeave={() => setMenuDismissed(false)}
    >
      <div className="relative z-0 flex min-h-0 flex-col group-hover/card:pointer-events-none">
        <p
          className="mb-2 truncate text-[13px] font-medium leading-tight text-gray-800"
          title={doc.originalName}
        >
          {formatDocDate(doc.createdAt)}
        </p>

        <div className="flex aspect-[3/4] w-full shrink-0 items-center justify-center overflow-hidden rounded border border-gray-200 bg-gray-50">
          {doc.coverUrl ? (
            <img
              src={doc.coverUrl}
              alt={doc.originalName}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <DocumentIcon className="h-10 w-10 text-gray-400" aria-hidden />
          )}
        </div>

        <div className="mt-3 flex flex-col gap-1.5 border-t border-gray-100 pt-3">
          <p
            className="line-clamp-2 text-[11px] font-medium leading-snug text-gray-700"
            title={doc.originalName}
          >
            {doc.originalName}
          </p>
          <div className="flex items-center justify-between gap-2 text-[10px] text-gray-500">
            <span className="truncate capitalize">{doc.status}</span>
            <span className="shrink-0 tabular-nums">{doc.pageCount ?? 0} p.</span>
          </div>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute inset-0 z-10 flex flex-col rounded-[inherit] bg-white p-2 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition-opacity duration-150 ease-out group-hover/card:pointer-events-auto group-hover/card:opacity-100 ${
          menuDismissed ? "!pointer-events-none !opacity-0" : ""
        }`}
        role="menu"
        aria-label={`Actions pour ${doc.originalName}`}
      >
        <div className="flex justify-end border-b border-gray-100 pb-5">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Fermer le menu"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMenuDismissed(true);
            }}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pt-1">
          {/* <MenuRow Icon={CloudIcon} label="Paramètres de publication" to={editorPath} /> */}
          <MenuRow Icon={PencilSquareIcon} label="Éditeur" to={editorPath} />
          <MenuRow Icon={EyeIcon} label="Aperçu" onClick={openPreview} />
          <MenuRow Icon={ShareIcon} label="Partager" onClick={shareFlipbookLink} />
          <MenuRow Icon={LinkIcon} label="Copier le lien" onClick={copyFlipbookLink} />
          <MenuRow
            Icon={TrashIcon}
            label={isDeleting ? "Suppression…" : "Supprimer"}
            onClick={() => {
              if (isDeleting) return;
              if (
                !window.confirm(
                  `Supprimer « ${doc.originalName} » ? Cette action est irréversible.`,
                )
              ) {
                return;
              }
              onDelete();
            }}
          />
          <MenuRow Icon={CursorArrowRaysIcon} label="Sélectionner" onClick={onToggleSelect} />
        </nav>
      </div>
    </div>
  );
}
