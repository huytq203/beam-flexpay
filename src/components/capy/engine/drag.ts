import { clamp } from './runtime'

const HALF_WIDTH = 27

/** Một lần nắm kéo Capy: nhớ độ lệch con trỏ so với tâm và tính vị trí, độ nghiêng theo vận tốc. */
export class Drag {
  moved = false
  private lastX: number
  private velocity = 0
  private readonly dx: number
  private readonly dy: number

  constructor(clientX: number, clientY: number, x: number, y: number) {
    this.dx = clientX - x
    this.dy = clientY - y
    this.lastX = clientX
  }

  move(clientX: number, clientY: number, width: number, height: number) {
    this.velocity = this.velocity * 0.7 + (clientX - this.lastX) * 0.3
    this.lastX = clientX
    this.moved = true
    return {
      x: clamp(clientX - this.dx, HALF_WIDTH, width - HALF_WIDTH),
      y: clamp(clientY - this.dy, 0, height),
      spin: clamp(this.velocity * 0.04, -0.4, 0.4)
    }
  }
}
