import { describe, expect, it } from 'vitest'
import { buildAuditDiff } from '../utils/auditDiff.utils'
import {
  fromUrlFilters,
  toFilterQuery,
  validateFilters
} from '../utils/auditLog.utils'

const filters = (patch: Partial<ReturnType<typeof fromUrlFilters>> = {}) => ({
  ...fromUrlFilters({}),
  ...patch
})

describe('buildAuditDiff', () => {
  it('so sánh từng trường của hai object, đánh dấu trường đổi', () => {
    const diff = buildAuditDiff('{"a":1,"b":"x"}', '{"a":2,"b":"x","c":true}')
    expect(diff).toEqual({
      kind: 'rows',
      rows: [
        { key: 'a', oldValue: '1', newValue: '2', changed: true },
        { key: 'b', oldValue: 'x', newValue: 'x', changed: false },
        { key: 'c', oldValue: null, newValue: 'true', changed: true }
      ]
    })
  })

  it('tạo mới (oldData null) vẫn dựng được bảng', () => {
    const diff = buildAuditDiff(null, '{"status":"ACTIVE"}')
    expect(diff).toEqual({
      kind: 'rows',
      rows: [
        { key: 'status', oldValue: null, newValue: 'ACTIVE', changed: true }
      ]
    })
  })

  it('mảng hoặc chuỗi không phải JSON giữ nguyên văn', () => {
    const array = buildAuditDiff('["A=R"]', '["A=R","B=R"]')
    expect(array.kind).toBe('raw')
    const broken = buildAuditDiff('not-json', null)
    expect(broken).toEqual({ kind: 'raw', oldText: 'not-json', newText: null })
  })

  it('cả hai null cho kết quả rỗng', () => {
    expect(buildAuditDiff(null, null)).toEqual({
      kind: 'raw',
      oldText: null,
      newText: null
    })
  })
})

describe('bộ lọc nhật ký', () => {
  it('bỏ giá trị lạ trên URL và chuỗi rỗng khi gửi BE', () => {
    const parsed = fromUrlFilters({
      action: 'HACK',
      occurredFrom: '2026-10-01',
      entityName: 'merchants'
    })
    expect(parsed.action).toBeUndefined()
    expect(parsed.occurredFrom).toBeUndefined()
    expect(toFilterQuery(parsed)).toEqual({
      actorUsername: undefined,
      actorId: undefined,
      action: undefined,
      entityName: 'merchants',
      entityId: undefined,
      occurredFrom: undefined,
      occurredTo: undefined
    })
  })

  it('chặn UUID sai và khoảng thời gian ngược', () => {
    expect(
      validateFilters(
        filters({
          actorId: 'abc',
          occurredFrom: '2026-10-02T00:00:00',
          occurredTo: '2026-10-01T23:59:59'
        })
      )
    ).toEqual({
      actorId: 'ID người thực hiện phải là UUID hợp lệ.',
      occurredTo: 'Thời điểm bắt đầu phải trước thời điểm kết thúc.'
    })
    expect(
      validateFilters(
        filters({ entityId: '7c9e6679-7425-40de-944b-e07fc1f90ae7' })
      )
    ).toEqual({})
  })
})
