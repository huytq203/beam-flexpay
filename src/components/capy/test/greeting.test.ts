import { describe, expect, it } from 'vitest'
import { buildGreeting, dayPeriod, givenName } from '../engine/greeting'

const fakeT = (key: string, options?: Record<string, string>): string =>
  `${key}|${JSON.stringify(options ?? {})}`

describe('givenName', () => {
  it('lấy chữ cuối của họ tên', () => {
    expect(givenName('Trần Huy')).toBe('Huy')
    expect(givenName('Nguyễn Thị Lan Anh')).toBe('Anh')
  })
  it('tên một từ giữ nguyên, trống cho chuỗi rỗng', () => {
    expect(givenName('Admin')).toBe('Admin')
    expect(givenName('   ')).toBe('')
    expect(givenName('')).toBe('')
  })
})

describe('dayPeriod', () => {
  it.each([
    [0, 'morning'],
    [10, 'morning'],
    [11, 'noon'],
    [13, 'noon'],
    [14, 'afternoon'],
    [17, 'afternoon'],
    [18, 'evening'],
    [23, 'evening']
  ])('giờ %i thuộc %s', (hour, period) => {
    expect(dayPeriod(hour)).toBe(period)
  })
})

describe('buildGreeting', () => {
  it('có tên: ba mẫu đều mang tên', () => {
    expect(buildGreeting(fakeT, 'Huy', 9, () => 0)).toContain(
      'capy.greet.timed'
    )
    expect(buildGreeting(fakeT, 'Huy', 9, () => 0.4)).toContain(
      'capy.greet.plain'
    )
    expect(buildGreeting(fakeT, 'Huy', 9, () => 0.99)).toContain(
      'capy.greet.cheer'
    )
    expect(buildGreeting(fakeT, 'Huy', 9, () => 0)).toContain('"name":"Huy"')
  })
  it('truyền đúng buổi trong ngày vào mẫu có buổi', () => {
    const text = buildGreeting(fakeT, 'Huy', 15, () => 0)
    expect(text).toContain('capy.period.afternoon')
  })
  it('không có tên: dùng mẫu không tên, không có chữ undefined', () => {
    for (const roll of [0, 0.4, 0.99]) {
      const text = buildGreeting(fakeT, '', 9, () => roll)
      expect(text).toContain('anon')
      expect(text).not.toContain('undefined')
      expect(text).not.toContain('"name"')
    }
  })
  it('random bằng 1 không vượt chỉ số', () => {
    expect(buildGreeting(fakeT, 'Huy', 9, () => 1)).toContain(
      'capy.greet.cheer'
    )
  })
})
