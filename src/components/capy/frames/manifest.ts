import type { FrameMeta } from './types'

/**
 * Số đo từng khung hình trong `public/images/capy/`: kích thước ảnh, điểm neo ngang `ax` (tâm áo),
 * hệ số tỉ lệ `s` để đầu các khung cùng cỡ, và `bar` (vị trí mép thanh tìm kiếm đã cắt) của khung đẩy ô.
 */
export const FRAME_META = {
  idle1: { w: 91, h: 114, ax: 36.0, s: 1.0 },
  idle2: { w: 84, h: 113, ax: 36.3, s: 1.0 },
  idle3: { w: 96, h: 113, ax: 40.6, s: 1.0 },
  walk1: { w: 70, h: 112, ax: 30.5, s: 1.04 },
  walk2: { w: 72, h: 112, ax: 32.9, s: 1.04 },
  walk3: { w: 73, h: 112, ax: 33.1, s: 1.04 },
  walk4: { w: 72, h: 112, ax: 33.7, s: 1.04 },
  walk5: { w: 71, h: 113, ax: 33.3, s: 1.04 },
  walk6: { w: 72, h: 112, ax: 33.8, s: 1.04 },
  walk7: { w: 69, h: 111, ax: 31.6, s: 1.04 },
  walk8: { w: 69, h: 111, ax: 31.3, s: 1.04 },
  run1: { w: 80, h: 106, ax: 37.4, s: 1.161 },
  run2: { w: 78, h: 106, ax: 34.2, s: 1.161 },
  run3: { w: 76, h: 106, ax: 34.1, s: 1.161 },
  run4: { w: 75, h: 106, ax: 34.0, s: 1.161 },
  run5: { w: 68, h: 107, ax: 28.9, s: 1.161 },
  turn1: { w: 80, h: 114, ax: 38.5, s: 1.0 },
  turn2: { w: 77, h: 113, ax: 35.0, s: 1.0 },
  turn3: { w: 74, h: 115, ax: 31.3, s: 1.0 },
  phone1: { w: 74, h: 111, ax: 32.1, s: 1.083 },
  phone2: { w: 72, h: 109, ax: 28.4, s: 1.083 },
  phone3: { w: 67, h: 109, ax: 27.5, s: 1.083 },
  phone4: { w: 72, h: 109, ax: 27.1, s: 1.083 },
  jump1: { w: 68, h: 99, ax: 32.0, s: 1.3 },
  jump3: { w: 68, h: 84, ax: 32.0, s: 1.3 },
  land4: { w: 68, h: 82, ax: 29.3, s: 1.3 },
  sit1: { w: 75, h: 91, ax: 34.5, s: 1.161 },
  sit2: { w: 69, h: 85, ax: 31.1, s: 1.161 },
  sit3: { w: 69, h: 96, ax: 29.5, s: 1.161 },
  sit4: { w: 70, h: 104, ax: 31.3, s: 1.161 },
  push1: { w: 86, h: 93, ax: 30.2, s: 1.204, bar: [34, 61, 92, 90] },
  push2: { w: 79, h: 63, ax: 31.5, s: 1.204, bar: [-37, 57, 96, 86] },
  push3: { w: 92, h: 87, ax: 35.2, s: 1.204, bar: [34, 59, 134, 82] },
  push4: { w: 86, h: 88, ax: 30.9, s: 1.204, bar: [32, 60, 132, 84] },
  selfie1: { w: 81, h: 96, ax: 32.7, s: 1.182 },
  selfie2: { w: 79, h: 96, ax: 31.7, s: 1.182 },
  selfie3: { w: 77, h: 96, ax: 31.5, s: 1.182 },
  selfie4: { w: 80, h: 101, ax: 35.5, s: 1.182 },
  selfie5: { w: 71, h: 98, ax: 29.0, s: 1.182 },
  cheer4: { w: 69, h: 92, ax: 32.6, s: 1.15 },
  cheer5: { w: 81, h: 88, ax: 34.5, s: 1.15 },
  nod1: { w: 77, h: 101, ax: 34.3, s: 1.2 },
  nod2: { w: 75, h: 102, ax: 34.2, s: 1.2 },
  nod3: { w: 78, h: 99, ax: 35.1, s: 1.2 },
  nod4: { w: 89, h: 98, ax: 34.1, s: 1.2 },
  wave1: { w: 71, h: 82, ax: 31.1, s: 1.25 },
  wave2: { w: 67, h: 82, ax: 30.9, s: 1.25 },
  wave3: { w: 65, h: 82, ax: 29.8, s: 1.25 },
  wave4: { w: 74, h: 84, ax: 34.6, s: 1.25 },
  doze1: { w: 107, h: 77, ax: 32.9, s: 1.15 },
  doze2: { w: 86, h: 54, ax: 33.4, s: 1.15 },
  doze3: { w: 80, h: 54, ax: 33.0, s: 1.15 }
} as const satisfies Record<string, FrameMeta>

export type FrameName = keyof typeof FRAME_META

/** Mọi khóa của `FRAME_META` đều là `FrameName` theo định nghĩa, nên ép kiểu ở đây là an toàn. */
export const FRAME_NAMES = Object.keys(FRAME_META) as FrameName[]

export function frameUrl(name: FrameName): string {
  return `/images/capy/${name}.webp`
}
