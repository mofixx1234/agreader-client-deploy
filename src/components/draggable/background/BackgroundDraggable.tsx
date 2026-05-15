import { useEffect, useState } from 'react'
import { useEditorCustomization } from '../EditorCustomizationContext'
import { DraggablePanel } from '../shared/DraggablePanel'
import { SaveCloseFooter, Tabs } from '../shared/FormControls'
import { backgroundEditorPresets } from './backgroundEditorAssets'
import { BackgroundImageUpload } from './BackgroundImageUpload'

const colors = ['#ffffff', '#000000', '#8b6ff0', '#52f20c', '#ff5558', '#fff082', '#e7e7e7', '#f164d7', '#3289d9', '#707d8a']

export function BackgroundDraggable({ onClose }: { onClose: () => void }) {
  const { customization, isSaving, saveBackground, uploadBackgroundImage } =
    useEditorCustomization()
  const [activeTab, setActiveTab] = useState(0)
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [backgroundImage, setBackgroundImage] = useState('')

  useEffect(() => {
    setBackgroundColor(customization?.appearance.backgroundColor ?? '#ffffff')
    setBackgroundImage(customization?.appearance.backgroundImage ?? '')
  }, [customization?.appearance.backgroundColor, customization?.appearance.backgroundImage])

  const save = () => {
    void saveBackground({
      backgroundColor: backgroundColor.trim() || null,
      backgroundImage: backgroundImage.trim() || null,
    }).then(() => onClose())
  }

  const presetSelected = (src: string) => backgroundImage === src

  const handleBackgroundFile = (file: File) => {
    void uploadBackgroundImage(file)
  }

  return (
    <DraggablePanel
      title="Background"
      onClose={onClose}
      widthClass="w-[720px]"
      defaultPosition={{ x: 375, y: 120 }}
      footer={<SaveCloseFooter onClose={onClose} onSave={save} isSaving={isSaving} />}
    >
      <Tabs
        tabs={['Image', 'Color', 'Style']}
        active={activeTab}
        onActiveChange={setActiveTab}
      />

      {activeTab === 0 && (
        <div className="space-y-5 px-8 py-7">
          <p className="text-center text-xs text-gray-500">
            Téléversez une image, choisissez un fond proposé ou saisissez une URL. PNG, JPG ou
            WebP (max. 5 Mo).
          </p>
          <BackgroundImageUpload
            previewUrl={backgroundImage}
            disabled={isSaving}
            onUpload={handleBackgroundFile}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                !backgroundImage.trim()
                  ? 'border-gray-950 bg-gray-950 text-white ring-2 ring-gray-950/20'
                  : 'border-gray-300 bg-white text-gray-800 hover:border-gray-500'
              }`}
              onClick={() => setBackgroundImage('')}
            >
              Aucune image
            </button>
          </div>
          <div className="grid max-h-[min(37vh,22rem)] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3">
            {backgroundEditorPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                aria-label={`Fond ${preset.label}`}
                aria-pressed={presetSelected(preset.src)}
                className={`group relative aspect-[4/3] overflow-hidden rounded-lg border-2 bg-gray-100 transition-shadow ${
                  presetSelected(preset.src)
                    ? 'border-gray-950 ring-2 ring-gray-950/25'
                    : 'border-transparent hover:border-gray-400'
                }`}
                onClick={() => setBackgroundImage(preset.src)}
              >
                <img
                  src={preset.src}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 text-left text-[10px] font-medium leading-tight text-white line-clamp-2">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>
          {/* <Field label="Image (URL)">
            <TextInput
              placeholder="https://… ou laisser vide"
              value={backgroundImage}
              onChange={(event) => setBackgroundImage(event.target.value)}
            />
          </Field> */}
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4 px-8 py-9">
          <div className="flex flex-wrap justify-center gap-5">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`h-10 w-10 border shadow-sm ${
                  backgroundColor.toLowerCase() === color
                    ? 'border-gray-950 ring-2 ring-gray-950/20'
                    : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Choisir la couleur ${color}`}
                onClick={() => setBackgroundColor(color)}
              />
            ))}
          </div>
          <input
            className="h-12 w-full rounded-md border border-gray-300 px-14 text-sm outline-none focus:border-gray-950"
            value={backgroundColor}
            onChange={(event) => setBackgroundColor(event.target.value)}
          />
        </div>
      )}

      {activeTab === 2 && (
        <div className="px-8 py-12 text-center text-sm text-gray-500">
          Styles d’arrière-plan avancés — à venir.
        </div>
      )}
    </DraggablePanel>
  )
}
