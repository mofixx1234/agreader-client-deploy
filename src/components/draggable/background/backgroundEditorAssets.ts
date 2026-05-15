/**
 * Images locales pour le sélecteur d’arrière-plan (éditeur).
 * Les URLs sont résolues au build par Vite.
 */
const modules = import.meta.glob<{ default: string }>(
  '../../../assets/background-editor/*',
  { eager: true },
)

export type BackgroundEditorPreset = {
  id: string
  src: string
  label: string
}

function labelFromPath(path: string): string {
  const base = path.replace(/^.*\//, '').replace(/\.[^.]+$/, '')
  return base.replace(/[-_]+/g, ' ')
}

export const backgroundEditorPresets: BackgroundEditorPreset[] = Object.entries(modules)
  .map(([path, module]) => ({
    id: path,
    src: module.default,
    label: labelFromPath(path),
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'fr'))
