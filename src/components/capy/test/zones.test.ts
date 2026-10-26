import { describe, expect, it } from 'vitest'
import {
  FORBIDDEN_SELECTOR,
  intersectsForbidden,
  limitTravel,
  pushOutOfZones,
  type Box
} from '../engine/zones'

const zone: Box = { left: 300, right: 400, top: 100, bottom: 160 }

describe('intersectsForbidden', () => {
  it('chồng lên vùng cấm hoặc sát trong biên thì true', () => {
    expect(
      intersectsForbidden({ left: 350, right: 420, top: 120, bottom: 200 }, [
        zone
      ])
    ).toBe(true)
    expect(
      intersectsForbidden({ left: 250, right: 297, top: 100, bottom: 160 }, [
        zone
      ])
    ).toBe(true)
  })
  it('xa vùng cấm thì false', () => {
    expect(
      intersectsForbidden({ left: 100, right: 200, top: 100, bottom: 160 }, [
        zone
      ])
    ).toBe(false)
    expect(
      intersectsForbidden({ left: 350, right: 420, top: 300, bottom: 360 }, [
        zone
      ])
    ).toBe(false)
  })
})

describe('pushOutOfZones', () => {
  it('đưa ra phía gần hơn, ngoài vùng cấm', () => {
    const pushedLeft = pushOutOfZones(320, 54, [zone])
    expect(pushedLeft + 27).toBeLessThanOrEqual(zone.left)
    const pushedRight = pushOutOfZones(390, 54, [zone])
    expect(pushedRight - 27).toBeGreaterThanOrEqual(zone.right)
  })
  it('đã ở ngoài thì giữ nguyên', () => {
    expect(pushOutOfZones(100, 54, [zone])).toBe(100)
  })
})

describe('pushOutOfZones với các vùng liền nhau', () => {
  const row: Box[] = [
    { left: 328, right: 473, top: 89, bottom: 141 },
    { left: 473, right: 644, top: 89, bottom: 141 },
    { left: 644, right: 763, top: 89, bottom: 141 }
  ]
  const outside = (x: number, zones: readonly Box[]) =>
    zones.every((z) => x + 27 <= z.left - 6 || x - 27 >= z.right + 6)

  it('gộp ba ô liền nhau thành một dải, không kẹt giữa ô này và ô kia', () => {
    for (const start of [300, 340, 440, 470, 500, 600, 700, 760]) {
      const result = pushOutOfZones(start, 54, row)
      expect(outside(result, row), `bắt đầu ${start} ra ${result}`).toBe(true)
    }
  })

  it('chỉ chọn phía nằm trong khoảng nền khi một phía vượt biên', () => {
    const result = pushOutOfZones(600, 54, row, 6, [56, 736])
    expect(result).toBeLessThanOrEqual(328 - 6 - 27)
    expect(result).toBeGreaterThanOrEqual(56)
  })
})

describe('FORBIDDEN_SELECTOR', () => {
  it('khớp nhãn data-capy, hộp thoại và ô đang gõ', () => {
    document.body.innerHTML =
      '<span data-capy="no">1</span><div role="dialog"></div><div class="ant-modal"></div><div id="plain"></div>'
    const hits = document.querySelectorAll(FORBIDDEN_SELECTOR)
    expect(hits).toHaveLength(3)
    expect(document.getElementById('plain')?.matches(FORBIDDEN_SELECTOR)).toBe(
      false
    )
  })
})

describe('limitTravel', () => {
  it('đi sang phải gặp vùng cấm thì dừng sát trước nó', () => {
    const limit = limitTravel(100, 600, 54, [zone])
    expect(limit + 27).toBeLessThanOrEqual(zone.left)
    expect(limit).toBeGreaterThan(100)
  })
  it('đi sang trái gặp vùng cấm thì dừng sát sau nó', () => {
    const limit = limitTravel(600, 100, 54, [zone])
    expect(limit - 27).toBeGreaterThanOrEqual(zone.right)
    expect(limit).toBeLessThan(600)
  })
  it('không có vùng cấm trên đường thì giữ nguyên điểm đến', () => {
    expect(limitTravel(100, 250, 54, [zone])).toBe(250)
    expect(limitTravel(500, 700, 54, [zone])).toBe(700)
  })
  it('đang đứng trong vùng cấm vẫn đi ra được', () => {
    expect(limitTravel(350, 700, 54, [zone])).toBe(700)
    expect(limitTravel(350, 100, 54, [zone])).toBe(100)
  })
})
