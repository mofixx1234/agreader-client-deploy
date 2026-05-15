import { toast } from 'react-toastify'
import { DraggablePanel } from '../shared/DraggablePanel'
import { Field, SaveCloseFooter, TextArea, TextInput, Toggle } from '../shared/FormControls'

export function TitleDraggable({ onClose }: { onClose: () => void }) {
  const handleSave = () => {
    toast.info('Enregistrement côté serveur : bientôt disponible.')
    onClose()
  }

  return (
    <DraggablePanel
      title="Flipbook Settings"
      onClose={onClose}
      footer={<SaveCloseFooter onClose={onClose} onSave={handleSave} />}
    >
      <div className="space-y-5 px-10 py-8">
        <Field label="Title">
          <TextInput />
        </Field>
        <Field label="Subtitle">
          <TextInput />
        </Field>
        <Field label="Description">
          <TextArea rows={3} />
        </Field>
        <div className="pl-0 sm:pl-[136px]">
          <Toggle label="Show titles on the flipbook's background." defaultChecked />
        </div>
        <Field label="Private notes">
          <TextArea rows={2} />
        </Field>
      </div>
    </DraggablePanel>
  )
}
