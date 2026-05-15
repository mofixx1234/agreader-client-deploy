import { useEffect, useRef, useState } from 'react'
import { PhotoIcon } from '@heroicons/react/24/outline'
import { useEditorCustomization } from '../EditorCustomizationContext'
import { DraggablePanel } from '../shared/DraggablePanel'
import { Field, SaveCloseFooter, TextInput, Toggle } from '../shared/FormControls'
import type { LogoPosition } from '../../../api/services/custom-document.service'

const logoPositions: { label: string; value: LogoPosition }[] = [
  { label: 'Top left', value: 'top_left' },
  { label: 'Top center', value: 'top_center' },
  { label: 'Top right', value: 'top_right' },
  { label: 'Center left', value: 'center_left' },
  { label: 'Center', value: 'center' },
  { label: 'Center right', value: 'center_right' },
  { label: 'Bottom left', value: 'bottom_left' },
  { label: 'Bottom center', value: 'bottom_center' },
  { label: 'Bottom right', value: 'bottom_right' },
]

export function LogoDraggable({ onClose }: { onClose: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { customization, isSaving, saveLogoSettings, uploadLogo } = useEditorCustomization()
  const [logoLinkUrl, setLogoLinkUrl] = useState('')
  const [showLogo, setShowLogo] = useState(true)
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('top_left')
  const [logoSize, setLogoSize] = useState('')
  const [logoOpacity, setLogoOpacity] = useState(1)

  useEffect(() => {
    setLogoLinkUrl(customization?.appearance.logoLinkUrl ?? '')
    setShowLogo(Boolean(customization?.appearance.logoImage))
    setLogoPosition(customization?.appearance.logoPosition ?? 'top_left')
    setLogoSize(
      customization?.appearance.logoSize == null
        ? ''
        : String(customization.appearance.logoSize),
    )
    setLogoOpacity(customization?.appearance.logoOpacity ?? 1)
  }, [
    customization?.appearance.logoImage,
    customization?.appearance.logoLinkUrl,
    customization?.appearance.logoOpacity,
    customization?.appearance.logoPosition,
    customization?.appearance.logoSize,
  ])

  const save = () => {
    const parsedLogoSize = logoSize.trim() === '' ? null : Number(logoSize)
    const normalizedLogoSize =
      parsedLogoSize == null || Number.isNaN(parsedLogoSize)
        ? null
        : Math.max(0, Math.floor(parsedLogoSize))

    void saveLogoSettings({
      logoLinkUrl: logoLinkUrl.trim() || null,
      logoPosition,
      logoSize: normalizedLogoSize,
      logoOpacity: Math.min(1, Math.max(0, logoOpacity)),
      logoImage: showLogo ? undefined : null,
    }).then(() => onClose())
  }

  const handleFileChange = (file: File | undefined) => {
    if (!file) return
    setShowLogo(true)
    void uploadLogo(file)
  }

  return (
    <DraggablePanel
      title="Logo"
      onClose={onClose}
      widthClass="w-[640px]"
      footer={<SaveCloseFooter onClose={onClose} onSave={save} isSaving={isSaving} />}
    >
      <div className="space-y-6 px-10 py-8">
        <div className="flex items-center gap-5 rounded-lg border border-dashed border-gray-300 p-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-gray-100">
            {customization?.appearance.logoImage ? (
              <img
                src={customization.appearance.logoImage}
                alt="Logo du flipbook"
                className="h-full w-full rounded-md object-contain"
              />
            ) : (
              <PhotoIcon className="h-9 w-9 text-gray-500" />
            )}
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(event) => handleFileChange(event.target.files?.[0])}
            />
            <button
              className="rounded-md border border-gray-950 px-5 py-2 text-sm font-medium hover:bg-gray-950 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              disabled={isSaving}
              onClick={() => inputRef.current?.click()}
            >
              {isSaving ? 'Uploading...' : 'Upload logo'}
            </button>
            <p className="mt-2 text-xs text-gray-500">PNG, JPG ou WebP. Fond transparent recommandé.</p>
          </div>
        </div>
        <Field label="Logo link">
          <TextInput
            placeholder="https://"
            value={logoLinkUrl}
            onChange={(event) => setLogoLinkUrl(event.target.value)}
          />
        </Field>
        <Field label="Position">
          <select
            className="min-h-9 rounded-md border border-gray-300 bg-white px-2.5 text-xs font-normal text-gray-950 outline-none focus:border-gray-950"
            value={logoPosition}
            onChange={(event) => setLogoPosition(event.target.value as LogoPosition)}
          >
            {logoPositions.map((position) => (
              <option key={position.value} value={position.value}>
                {position.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Size (px)">
          <TextInput
            type="number"
            min={0}
            step={1}
            value={logoSize}
            onChange={(event) => setLogoSize(event.target.value)}
          />
        </Field>
        <Field label={`Opacity (${Math.round(logoOpacity * 100)}%)`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={logoOpacity}
            onChange={(event) => setLogoOpacity(Number(event.target.value))}
          />
        </Field>
        <Toggle label="Show logo in reader" checked={showLogo} onChange={setShowLogo} />
      </div>
    </DraggablePanel>
  )
}
