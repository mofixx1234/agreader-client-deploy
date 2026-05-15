import { useCallback, useRef } from 'react'
import { toast } from 'react-toastify'
import { BeatLoader } from 'react-spinners'

import {
  XMarkIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/solid'

import { useDocuments } from '../api/hooks/useDocuments'

const UPLOAD_ACCEPT =
  [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ].join(",")

const ALLOWED_UPLOAD_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
])

type UploadModalProps = {
  open: boolean
  onClose: () => void
}

export function UploadModal({
  open,
  onClose,
}: UploadModalProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const { upload } = useDocuments()

  const onFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0]

      if (!file) return

      // VALIDATION TYPE
      if (!ALLOWED_UPLOAD_MIMES.has(file.type) && file.type !== '') {
        toast.error(
          'Format invalide : PDF, Word (.doc, .docx) ou Excel (.xls, .xlsx).',
        )
        return
      }

      // VALIDATION SIZE
      if (file.size > 80 * 1024 * 1024) {
        toast.error(
          'Fichier trop volumineux (max 80MB).',
        )
        return
      }

      try {
        await upload.mutateAsync(file)

        toast.success(
          'Document envoyé avec succès.',
        )

        onClose()
      } catch (error) {
        console.error(error)

        toast.error(
          'Erreur pendant l’upload du document.',
        )
      }
    },
    [upload, onClose],
  )

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 transition hover:bg-gray-100"
        >
          <XMarkIcon className="h-5 w-5 text-gray-500" />
        </button>

        {/* CONTENT */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
            <CloudArrowUpIcon className="h-10 w-10 text-red-500" />
          </div>

          <h2 className="mt-6 text-sm font-bold text-gray-900">
            Importer un document
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Déposez un PDF, un document Word ou une feuille Excel pour générer
            automatiquement un flipbook.
          </p>

          {/* DROPZONE */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              onFiles(e.dataTransfer.files)
            }}
            className="mt-8 flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 px-6 py-8 transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            {upload.isPending ? (
              <div className="flex flex-col items-center">
                <BeatLoader color="#ff3301" size={10} />

                <p className="mt-4 text-sm text-gray-500">
                  Upload en cours...
                </p>
              </div>
            ) : (
              <>
                <CloudArrowUpIcon className="h-14 w-14 text-gray-400" />

                <p className="mt-4 text-base font-medium text-gray-700">
                  Glissez-déposez votre fichier ici
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  ou cliquez pour sélectionner
                </p>
              </>
            )}
          </div>

          {/* HIDDEN INPUT */}
          <input
            ref={inputRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            className="hidden"
            onChange={(e) =>
              onFiles(e.target.files)
            }
          />

          <p className="mt-6 text-xs text-gray-400">
            PDF, Word ou Excel • Maximum 80MB
          </p>
        </div>
      </div>
    </div>
  )
}