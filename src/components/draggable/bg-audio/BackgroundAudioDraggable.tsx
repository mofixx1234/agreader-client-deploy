import { SpeakerWaveIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { DraggablePanel } from '../shared/DraggablePanel'
import { SaveCloseFooter, Toggle } from '../shared/FormControls'

export function BackgroundAudioDraggable({ onClose }: { onClose: () => void }) {
  const handleSave = () => {
    toast.info('Enregistrement côté serveur : bientôt disponible.')
    onClose()
  }

  return (
    <DraggablePanel
      title="Background Audio"
      onClose={onClose}
      widthClass="w-[620px]"
      footer={<SaveCloseFooter onClose={onClose} onSave={handleSave} />}
    >
      <div className="space-y-6 px-10 py-8">
        <div className="flex items-center gap-5 rounded-lg border border-dashed border-gray-300 p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
            <SpeakerWaveIcon className="h-8 w-8 text-gray-500" />
          </div>
          <div>
            <button type="button" className="rounded-md border border-gray-950 px-5 py-2 text-sm font-medium hover:bg-gray-950 hover:text-white">
              Upload audio
            </button>
            <p className="mt-2 text-xs text-gray-500">MP3 recommended for the flipbook reader.</p>
          </div>
        </div>
        <Toggle label="Autoplay background audio" />
        <Toggle label="Loop audio" defaultChecked />
        <Toggle label="Show audio control" defaultChecked />
      </div>
    </DraggablePanel>
  )
}
