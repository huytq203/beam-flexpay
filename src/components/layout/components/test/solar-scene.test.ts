import { describe, expect, it } from 'vitest'
import { getSolarScene, HANOI_COORDINATES } from '../solar-scene'

const HO_CHI_MINH = { latitude: 10.8231, longitude: 106.6297 }
const MORNING = new Date('2026-07-29T02:30:00Z')

describe('getSolarScene', () => {
  it('phơi ra toạ độ Hà Nội làm mặc định', () => {
    expect(HANOI_COORDINATES).toEqual({
      latitude: 21.0278,
      longitude: 105.8342
    })
  })

  it('dùng Hà Nội khi không truyền toạ độ', () => {
    expect(getSolarScene(MORNING)).toEqual(
      getSolarScene(MORNING, HANOI_COORDINATES)
    )
  })

  it('cho cảnh khác nhau giữa Hà Nội và TP.HCM', () => {
    expect(getSolarScene(MORNING).sunLeft).not.toBe(
      getSolarScene(MORNING, HO_CHI_MINH).sunLeft
    )
  })

  it('vẫn format nhãn giờ theo múi giờ Việt Nam bất kể toạ độ', () => {
    // 02:30 UTC = 09:30 giờ Việt Nam (UTC+7)
    expect(getSolarScene(MORNING).timeLabel).toBe('09:30:00')
    expect(getSolarScene(MORNING, HO_CHI_MINH).timeLabel).toBe('09:30:00')
  })

  it('nhận diện ban đêm ở Hà Nội lúc nửa đêm giờ Việt Nam', () => {
    // 17:00 UTC = 00:00 giờ Việt Nam ngày hôm sau
    expect(getSolarScene(new Date('2026-07-29T17:00:00Z')).isNight).toBe(true)
  })
})
