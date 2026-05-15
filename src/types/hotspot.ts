export type EditorHotspot = {
  id: string
  pageIndex: number
  /** 0–1, relatif à la page rendue */
  x: number
  y: number
  w: number
  h: number
  label?: string
}
