import { describe, expect, it } from 'vitest'
import { pickPlatformBelow, type Platform } from '../engine/platforms'

const platforms: Platform[] = [
  { y: 100, lo: 50, hi: 400, only: [60, 300] },
  { y: 200, lo: 50, hi: 400 },
  { y: 300, lo: 50, hi: 400 },
  { y: 900, lo: 0, hi: 1000 }
]

describe('pickPlatformBelow', () => {
  it('lấy nền gần nhất bên dưới chân', () => {
    expect(pickPlatformBelow(platforms, 150, 200)).toBe(1)
    expect(pickPlatformBelow(platforms, 250, 200)).toBe(2)
  })
  it('bỏ qua nền ở trên chân', () => {
    expect(pickPlatformBelow(platforms, 350, 200)).toBe(3)
  })
  it('nền có only chỉ tính khi x nằm trong khoảng', () => {
    expect(pickPlatformBelow(platforms, 90, 200)).toBe(0)
    expect(pickPlatformBelow(platforms, 90, 380)).toBe(1)
  })
  it('không còn nền bên dưới thì trả nền cuối cùng', () => {
    expect(pickPlatformBelow(platforms, 5000, 200)).toBe(3)
  })
  it('chân lọt trong dung sai vẫn đứng được trên nền đó', () => {
    expect(pickPlatformBelow(platforms, 205, 200)).toBe(1)
  })
})
