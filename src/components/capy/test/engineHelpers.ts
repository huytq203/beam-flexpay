import { vi } from 'vitest'
import { CapyEngine } from '../engine/CapyEngine'
import type { Canvas2dLike } from '../engine/player'

const ctx: Canvas2dLike = {
  setTransform: () => undefined,
  clearRect: () => undefined,
  translate: () => undefined,
  rotate: () => undefined,
  scale: () => undefined,
  drawImage: () => undefined
}

/** Phần tử giả có hình chữ nhật cố định qua `data-rect="trái,trên,rộng,cao"`. */
export function mockRects(): void {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const raw = this.getAttribute('data-rect')
      const [left, top, width, height] = raw
        ? raw.split(',').map(Number)
        : [0, 0, 0, 0]
      return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        x: left,
        y: top,
        toJSON: () => ({})
      }
    }
  )
}

export function addBlock(html: string): HTMLElement {
  const holder = document.createElement('div')
  holder.innerHTML = html
  const el = holder.firstElementChild as HTMLElement
  document.body.append(el)
  return el
}

export function makeEngine(greeting = () => 'Chào Huy!') {
  const bubbles: (string | null)[] = []
  const box = document.createElement('div')
  const engine = new CapyEngine({
    ctx,
    images: new Map(),
    box,
    canvasSize: 170,
    dpr: 1,
    greeting,
    onBubble: (text) => bubbles.push(text)
  })
  return { engine, bubbles, box }
}
