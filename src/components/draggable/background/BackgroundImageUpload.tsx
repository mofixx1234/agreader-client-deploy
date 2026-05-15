import { useRef, type ChangeEvent } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'

type BackgroundImageUploadProps = {
  /** URL affichée dans l’aperçu (fond actuel ou après téléversement) */
  previewUrl: string
  disabled?: boolean
  onUpload: (file: File) => void
}

export function BackgroundImageUpload({
  previewUrl,
  disabled = false,
  onUpload,
}: BackgroundImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    onUpload(file)
  }

  const hasPreview = Boolean(previewUrl.trim())

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50/80 px-4 py-5 sm:flex-row sm:justify-center">
      <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-white">
        {hasPreview ? (
          <img
            src={previewUrl}
            alt="Aperçu du fond"
            className="h-full w-full object-cover"
          />
        ) : (
          <PhotoIcon className="h-8 w-8 text-gray-400" aria-hidden />
        )}
      </div>
      <div className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleChange}
        />
        <button
          type="button"
          disabled={disabled}
          className="rounded-md border border-gray-950 bg-white px-4 py-2 text-sm font-medium text-gray-950 transition-colors hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => fileInputRef.current?.click()}
        >
          {disabled ? 'Envoi…' : 'Téléverser une image'}
        </button>
        <p className="max-w-xs text-xs text-gray-500">
          L’image est enregistrée sur le serveur et appliquée à la prévisualisation.
        </p>
      </div>
    </div>
  )
}
