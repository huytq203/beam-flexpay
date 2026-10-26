import type { FramePlayer } from './player'
import type { CapyTuning } from './tuning'
import type { World } from './world'

export class Cancelled extends Error {}

/** Trạng thái một lần nắm kéo Capy: độ lệch con trỏ so với tâm, vận tốc ngang, đã kéo thật chưa. */
export interface DragState {
  readonly dx: number
  readonly dy: number
  lastX: number
  velocity: number
  moved: boolean
}

/** Những gì một hành động cần từ bộ máy. `epoch` đổi thì mọi hành động đang chạy bị huỷ. */
export interface Runtime {
  readonly player: FramePlayer
  readonly bodyWidth: number
  readonly feet: number
  readonly tuning: CapyTuning
  x: number
  y: number
  platform: number
  phoneOut: boolean
  world(): World
  put(x: number, y: number): void
  wait(ms: number, epoch: number): Promise<void>
  tween(ms: number, epoch: number, step: (k: number) => void): Promise<void>
  say(text: string | null, ms?: number): void
}

export const rand = (a: number, b: number): number =>
  a + Math.random() * (b - a)
export const pick = <T>(items: readonly T[]): T =>
  items[Math.floor(Math.random() * items.length)]
export const clamp = (value: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, value))
