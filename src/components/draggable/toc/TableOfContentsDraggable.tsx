import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { toast } from 'react-toastify'
import { DraggablePanel } from '../shared/DraggablePanel'
import { SaveCloseFooter, Tabs, Toggle } from '../shared/FormControls'

export function TableOfContentsDraggable({ onClose }: { onClose: () => void }) {
  const handleSave = () => {
    toast.info('Enregistrement côté serveur : bientôt disponible.')
    onClose()
  }

  return (
    <DraggablePanel
      title="Table of contents"
      onClose={onClose}
      widthClass="w-[750px]"
      defaultPosition={{ x: 480, y: 115 }}
      footer={<SaveCloseFooter onClose={onClose} onSave={handleSave} />}
    >
      <Tabs tabs={['Controls', 'Table']} />
      <div className="space-y-8 px-20 py-8">
        <label className="grid items-center gap-4 text-sm font-semibold sm:grid-cols-[150px_1fr]">
          Thumbnail panel:
          <select className="h-12 rounded-md border border-gray-300 bg-white px-4 font-normal outline-none focus:border-gray-950">
            <option>Show page thumbnails</option>
            <option>Hide page thumbnails</option>
          </select>
        </label>
        <div className="grid gap-7 sm:grid-cols-[170px_1fr_1fr]">
          <span className="text-sm font-semibold">Table of contents:</span>
          <Toggle label="Panel" />
          <Toggle label="Tabs" />
          <span className="flex items-center gap-2 text-sm font-semibold">
            <InformationCircleIcon className="h-5 w-5" />
            Reader bookmarks:
          </span>
          <Toggle label="Panel" />
          <Toggle label="Tabs" />
        </div>
      </div>
    </DraggablePanel>
  )
}
