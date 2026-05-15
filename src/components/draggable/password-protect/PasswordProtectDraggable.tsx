import { LockClosedIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'
import { DraggablePanel } from '../shared/DraggablePanel'
import { Field, SaveCloseFooter, TextInput, Toggle } from '../shared/FormControls'

export function PasswordProtectDraggable({ onClose }: { onClose: () => void }) {
  const handleSave = () => {
    toast.info('Enregistrement côté serveur : bientôt disponible.')
    onClose()
  }

  return (
    <DraggablePanel
      title="Password protect"
      onClose={onClose}
      widthClass="w-[600px]"
      footer={<SaveCloseFooter onClose={onClose} onSave={handleSave} />}
    >
      <div className="space-y-6 px-10 py-8">
        <div className="flex items-center gap-4 rounded-lg bg-gray-50 p-4">
          <LockClosedIcon className="h-7 w-7 text-gray-700" />
          <p className="text-sm text-gray-700">Protect reader access with a password.</p>
        </div>
        <Toggle label="Enable password protection" />
        <Field label="Password">
          <TextInput placeholder="Enter password" />
        </Field>
        <Field label="Message">
          <TextInput placeholder="Private flipbook" />
        </Field>
      </div>
    </DraggablePanel>
  )
}
