import type { FrameName } from './manifest'

export interface Animation {
  readonly frames: readonly FrameName[]
  readonly fps: number
}

const seq = (prefix: string, count: number): FrameName[] =>
  Array.from({ length: count }, (_, i) => `${prefix}${i + 1}` as FrameName)

/** Mỗi hoạt cảnh là một chuỗi khung. Thêm khung mới: thả ảnh vào public, khai ở manifest, thêm tên vào đây. */
export const ANIMATIONS = {
  idle: {
    frames: [
      'idle1',
      'idle1',
      'idle1',
      'idle2',
      'idle1',
      'idle1',
      'idle3',
      'idle1'
    ],
    fps: 2.4
  },
  walk: { frames: seq('walk', 8), fps: 8 },
  run: { frames: seq('run', 5), fps: 9 },
  turnIn: { frames: ['turn1', 'turn2'], fps: 9 },
  turnOut: { frames: ['turn2', 'turn1'], fps: 9 },
  phoneOut: { frames: seq('phone', 4), fps: 6 },
  phoneIn: { frames: ['phone4', 'phone3', 'phone2', 'phone1'], fps: 7 },
  phoneLook: {
    frames: ['phone3', 'phone4', 'phone3', 'phone4', 'phone3'],
    fps: 2.2
  },
  takeoff: { frames: ['jump1'], fps: 1 },
  air: { frames: ['jump3'], fps: 1 },
  held: { frames: ['jump1', 'jump3'], fps: 5 },
  dizzy: { frames: ['land4'], fps: 1 },
  sit: { frames: ['sit1', 'sit2'], fps: 1.4 },
  standUp: { frames: ['sit3', 'sit4'], fps: 5 },
  push: { frames: seq('push', 4), fps: 4.5 },
  selfie: { frames: seq('selfie', 5), fps: 3 },
  bye: { frames: ['cheer4', 'cheer4', 'cheer5', 'cheer5'], fps: 3 },
  nod: { frames: seq('nod', 4), fps: 2 },
  doze: { frames: seq('doze', 3), fps: 1.6 },
  wave: { frames: seq('wave', 4), fps: 5 }
} as const satisfies Record<string, Animation>

export type AnimationName = keyof typeof ANIMATIONS
