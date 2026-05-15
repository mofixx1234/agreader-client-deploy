import { useEffect, useState } from 'react'
import { useEditorCustomization } from '../EditorCustomizationContext'
import { DraggablePanel } from '../shared/DraggablePanel'
import { SaveCloseFooter, Toggle } from '../shared/FormControls'
import type {
  PageDisposition,
  PageEffect,
} from '../../../api/services/custom-document.service'
import {
  defaultPageTurnSettings,
  mergePageTurnSettings,
  type PageTurnSettingKey,
  type PageTurnSettings,
} from '../../../lib/pageTurnSettings'

/** Ordre : d’abord les profils calqués sur turnjs4/samples (basic, magazine, docs, double-page). */
const pageEffects: { label: string; value: PageEffect }[] = [
  { label: 'Basique (échantillon basic)', value: 'notebook' },
  { label: 'Magazine (échantillon magazine)', value: 'magazine' },
  { label: 'Documentation (échantillon docs)', value: 'book' },
  { label: 'Double page (échantillon double-page)', value: 'album' },
  { label: 'Curseur', value: 'slider' },
  { label: 'Cartes', value: 'cards' },
  { label: 'Coverflow', value: 'coverflow' },
  { label: 'Une page', value: 'one_page' },
]

const pageDispositions: { label: string; value: PageDisposition }[] = [
  { label: 'Adaptatif', value: 'adaptive' },
  { label: 'Toujours double page', value: 'always_double_page' },
  { label: 'Toujours une page', value: 'always_single_page' },
]

const leftToggles: { key: PageTurnSettingKey; label: string }[] = [
  { key: 'soundOnTurn', label: 'Son au changement de page' },
  { key: 'pageEdges', label: 'Bords des pages' },
  { key: 'rtlRead', label: 'Lecture de droite à gauche' },
]

const rightToggles: { key: PageTurnSettingKey; label: string }[] = [
  { key: 'showPageDepth', label: 'Profondeur des pages' },
  { key: 'showPageShadow', label: 'Ombre des pages' },
  { key: 'roundedCorners', label: 'Coins arrondis' },
]

export function PageEffectDraggable({ onClose }: { onClose: () => void }) {
  const { customization, isSaving, savePageEffect } = useEditorCustomization()
  const [pageEffect, setPageEffect] = useState<PageEffect>('notebook')
  const [pageDisposition, setPageDisposition] =
    useState<PageDisposition>('adaptive')
  const [turnOpts, setTurnOpts] = useState<PageTurnSettings>(() => ({
    ...defaultPageTurnSettings,
  }))

  useEffect(() => {
    setPageEffect(customization?.appearance.pageEffect ?? 'notebook')
    setPageDisposition(customization?.appearance.pageDisposition ?? 'adaptive')
    setTurnOpts(mergePageTurnSettings(customization?.appearance.pageTurnSettings))
  }, [
    customization?.appearance.pageDisposition,
    customization?.appearance.pageEffect,
    customization?.appearance.pageTurnSettings,
  ])

  const setTurn = (key: PageTurnSettingKey, value: boolean) => {
    setTurnOpts((prev) => ({ ...prev, [key]: value }))
  }

  const save = () => {
    void savePageEffect({
      pageEffect,
      pageDisposition,
      pageTurnSettings: { ...turnOpts },
    }).then(() => onClose())
  }

  return (
    <DraggablePanel
      title="Effet des pages"
      onClose={onClose}
      widthClass="w-[750px]"
      defaultPosition={{ x: 490, y: 90 }}
      footer={<SaveCloseFooter onClose={onClose} onSave={save} isSaving={isSaving} />}
    >
      <div className="space-y-8 px-11 py-8">
        <div className="space-y-2">
          <select
            aria-label="Effet de retournement des pages"
            className="h-12 w-full rounded-md border border-gray-300 bg-white px-4 text-sm outline-none focus:border-gray-950"
            value={pageEffect}
            onChange={(event) => setPageEffect(event.target.value as PageEffect)}
          >
            {pageEffects.map((effect) => (
              <option key={effect.value} value={effect.value}>
                {effect.label}
              </option>
            ))}
          </select>
          <p className="text-xs leading-relaxed text-gray-500">
            La prévisualisation utilise la page{' '}
            <span className="whitespace-nowrap">turnjs4/samples/editor-dynamic</span>. Les quatre premiers
            profils reprennent les mêmes réglages Turn.js que les échantillons basic, magazine, docs et
            double-page du dossier <span className="whitespace-nowrap">turnjs4/samples</span>.
          </p>
        </div>
        <div className="grid gap-7 md:grid-cols-2">
          <div className="space-y-6">
            {leftToggles.map((row) => (
              <Toggle
                key={row.key}
                label={row.label}
                checked={turnOpts[row.key]}
                onChange={(checked) => setTurn(row.key, checked)}
              />
            ))}
          </div>
          <div className="space-y-6">
            {rightToggles.map((row) => (
              <Toggle
                key={row.key}
                label={row.label}
                checked={turnOpts[row.key]}
                onChange={(checked) => setTurn(row.key, checked)}
              />
            ))}
            <Toggle
              label="Centrer en mode une page"
              checked={turnOpts.centerWhenSingle}
              onChange={(checked) => setTurn('centerWhenSingle', checked)}
            />
          </div>
        </div>
        <button
          type="button"
          className="text-sm font-medium text-gray-950 underline underline-offset-4"
        >
          Moins d’options
        </button>
        <fieldset className="space-y-4">
          <legend className="text-sm text-gray-500">Disposition des pages</legend>
          <div className="flex flex-wrap gap-8 text-sm">
            {pageDispositions.map((option) => (
              <label key={option.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="page-disposition"
                  checked={pageDisposition === option.value}
                  onChange={() => setPageDisposition(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </DraggablePanel>
  )
}
