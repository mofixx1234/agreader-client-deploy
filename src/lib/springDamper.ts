/** Ressort amorti (souple, type flipbook) pour un suivi type physique. */
export function springDamperStep(
  x: number,
  v: number,
  target: number,
  dt: number,
  stiffness = 140,
  damping = 18,
): { x: number; v: number } {
  const disp = x - target
  const a = -stiffness * disp - damping * v
  const v2 = v + a * dt
  const x2 = x + v2 * dt
  return { x: x2, v: v2 }
}
