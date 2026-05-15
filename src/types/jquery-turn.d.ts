/// <reference types="jquery" />

/** Turn.js : méthodes sur les collections jQuery. */
interface JQuery<TElement = HTMLElement> {
  turn(options: Record<string, unknown>): this
  turn(method: 'page', page: number): this
  turn(method: 'page'): number
  turn(method: 'next' | 'previous' | 'stop'): this
  turn(method: string, ...args: unknown[]): unknown
}
