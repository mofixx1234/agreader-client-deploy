import { useEffect, useState } from 'react'
import { useEditorCustomization } from '../EditorCustomizationContext'
import { DraggablePanel } from '../shared/DraggablePanel'
import { SaveCloseFooter, Tabs, Toggle } from '../shared/FormControls'
import type {
  CustomDocumentPermissions,
} from '../../../api/services/custom-document.service'

const controls = [
  ['Download', 'allowDownload'],
  ['Share', 'allowShare'],
  ['Print', 'allowPrint'],
  ['Full screen', 'allowFullscreen'],
  ['Prev / next page', 'allowPrevNext'],
  ['Zoom button', 'allowZoom'],
  ['First page', 'allowFirstPage'],
  ['Last page', 'allowLastPage'],
  ['Search text', 'allowSearchText'],
] as const

export function ControlsDraggable({ onClose }: { onClose: () => void }) {
  const { customization, isSaving, saveControls } = useEditorCustomization()
  const [permissions, setPermissions] = useState<CustomDocumentPermissions>({
    allowDownload: true,
    allowShare: true,
    allowPrint: true,
    allowFullscreen: true,
    allowPrevNext: true,
    allowZoom: true,
    allowFirstPage: true,
    allowLastPage: true,
    allowSearchText: false,
  })

  useEffect(() => {
    if (customization?.permissions) setPermissions(customization.permissions)
  }, [customization?.permissions])

  const save = () => {
    void saveControls(permissions).then(() => onClose())
  }

  return (
    <DraggablePanel
      title="Controls"
      onClose={onClose}
      widthClass="w-[750px]"
      defaultPosition={{ x: 505, y: 110 }}
      footer={<SaveCloseFooter onClose={onClose} onSave={save} isSaving={isSaving} />}
    >
      <Tabs tabs={['Show / Hide', 'Style', 'Navigation']} />
      <div className="grid gap-x-10 gap-y-8 px-11 py-9 sm:grid-cols-2 lg:grid-cols-3">
        {controls.map(([label, key]) => (
          <Toggle
            key={key}
            label={label}
            checked={permissions[key]}
            onChange={(checked) =>
              setPermissions((current) => ({
                ...current,
                [key]: checked,
              }))
            }
          />
        ))}
      </div>
    </DraggablePanel>
  )
}
