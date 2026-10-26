import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ANIMATIONS } from '../frames/animations'
import { FRAME_META } from '../frames/manifest'

describe('khung hình và hoạt cảnh của Capy', () => {
  it('mọi khung trong hoạt cảnh đều có số đo', () => {
    for (const [name, anim] of Object.entries(ANIMATIONS)) {
      for (const frame of anim.frames) {
        expect(FRAME_META, `${name} dùng khung ${frame}`).toHaveProperty(frame)
      }
    }
  })

  it('số đo hợp lệ và có file ảnh tương ứng', () => {
    for (const [name, meta] of Object.entries(FRAME_META)) {
      expect(meta.w, name).toBeGreaterThan(0)
      expect(meta.h, name).toBeGreaterThan(0)
      expect(meta.s, name).toBeGreaterThan(0)
      expect(
        existsSync(resolve('public/images/capy', `${name}.webp`)),
        name
      ).toBe(true)
    }
  })

  it('fps dương và độ dài chuỗi đúng thiết kế', () => {
    for (const anim of Object.values(ANIMATIONS))
      expect(anim.fps).toBeGreaterThan(0)
    expect(ANIMATIONS.walk.frames).toHaveLength(8)
    expect(ANIMATIONS.run.frames).toHaveLength(5)
  })

  it('không dùng hai khung ngã bị lỗi', () => {
    expect(Object.keys(FRAME_META).some((n) => n.startsWith('fall'))).toBe(
      false
    )
  })
})
