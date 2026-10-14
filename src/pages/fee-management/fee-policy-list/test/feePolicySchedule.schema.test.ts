import dayjs from 'dayjs'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { feePolicyScheduleSchema } from '../schemas/feePolicySchedule.schema'
import { toRunAtIso } from '../utils/feePolicySchedule'

const NOW = new Date('2026-10-14T03:00:00.000Z')
const FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSS'
const at = (offset: (d: dayjs.Dayjs) => dayjs.Dayjs) =>
  offset(dayjs(NOW)).format(FORMAT)

const parse = (runAt: string, reason = 'Hết chương trình khuyến mãi') =>
  feePolicyScheduleSchema.safeParse({ action: 'DEACTIVATE', runAt, reason })

const messageOf = (result: ReturnType<typeof parse>, path: string) =>
  result.success
    ? undefined
    : result.error.issues.find((i) => i.path[0] === path)?.message

describe('schema hẹn giờ khóa / mở chính sách phí', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })
  afterEach(() => vi.useRealTimers())

  it('chấp nhận thời điểm hợp lệ', () => {
    expect(parse(at((d) => d.add(2, 'hour'))).success).toBe(true)
  })

  it('từ chối thời điểm trong quá khứ', () => {
    expect(messageOf(parse(at((d) => d.subtract(1, 'hour'))), 'runAt')).toMatch(
      /ít nhất 1 phút/
    )
  })

  it('từ chối thời điểm cách hiện tại dưới 1 phút', () => {
    expect(messageOf(parse(at((d) => d.add(30, 'second'))), 'runAt')).toMatch(
      /ít nhất 1 phút/
    )
    expect(parse(at((d) => d.add(61, 'second'))).success).toBe(true)
  })

  it('từ chối thời điểm quá 1 năm', () => {
    expect(messageOf(parse(at((d) => d.add(366, 'day'))), 'runAt')).toMatch(
      /quá 1 năm/
    )
    expect(parse(at((d) => d.add(364, 'day'))).success).toBe(true)
  })

  it('từ chối thiếu thời điểm', () => {
    expect(messageOf(parse(''), 'runAt')).toBe('Vui lòng chọn thời điểm chạy')
  })

  it('từ chối lý do rỗng, toàn khoảng trắng hoặc quá 500 ký tự', () => {
    const runAt = at((d) => d.add(2, 'hour'))
    expect(messageOf(parse(runAt, ''), 'reason')).toBe('Vui lòng nhập lý do')
    expect(messageOf(parse(runAt, '   '), 'reason')).toBe('Vui lòng nhập lý do')
    expect(messageOf(parse(runAt, 'a'.repeat(501)), 'reason')).toMatch(/500/)
    expect(parse(runAt, 'a'.repeat(500)).success).toBe(true)
  })

  it('đổi giờ địa phương sang ISO instant', () => {
    const local = '2026-10-20T08:00:00.000'
    expect(toRunAtIso(local)).toBe(dayjs(local).toDate().toISOString())
    expect(toRunAtIso(local)).toMatch(/Z$/)
  })
})
