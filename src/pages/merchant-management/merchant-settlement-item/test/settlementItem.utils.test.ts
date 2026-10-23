import { describe, expect, it } from 'vitest'
import {
  describeSettlementError,
  toSettlementQuery,
  validateSettlementFilters
} from '../utils/settlementItem.utils'

const SUB = '3fa85f64-5717-4562-b3fc-2c963f66afa7'

describe('kiểm tra bộ lọc mục quyết toán', () => {
  it('đòi Sub, đủ hai ngày và paidTo không trước paidFrom', () => {
    expect(validateSettlementFilters({})).toBe('sub')
    expect(validateSettlementFilters({ subMerchantId: SUB })).toBe('dates')
    expect(
      validateSettlementFilters({ subMerchantId: SUB, paidFrom: '2026-10-01' })
    ).toBe('dates')
    expect(
      validateSettlementFilters({
        subMerchantId: SUB,
        paidFrom: '01/10/2026',
        paidTo: '2026-10-02'
      })
    ).toBe('dates')
    expect(
      validateSettlementFilters({
        subMerchantId: SUB,
        paidFrom: '2026-10-05',
        paidTo: '2026-10-01'
      })
    ).toBe('range')
    expect(
      validateSettlementFilters({
        subMerchantId: SUB,
        paidFrom: '2026-10-01',
        paidTo: '2026-10-01'
      })
    ).toBeUndefined()
  })

  it('chỉ tạo truy vấn khi bộ lọc hợp lệ', () => {
    expect(toSettlementQuery({ subMerchantId: SUB })).toBeUndefined()
    expect(
      toSettlementQuery({
        subMerchantId: SUB,
        paidFrom: '2026-10-01',
        paidTo: '2026-10-02'
      })
    ).toEqual({
      subMerchantId: SUB,
      paidFrom: '2026-10-01',
      paidTo: '2026-10-02'
    })
  })

  it('dịch lỗi theo message, bỏ qua detail tiếng Anh của 500', () => {
    const err = (message: string, detail = 'x') => ({
      status: 500,
      data: { message, detail }
    })
    expect(
      describeSettlementError(err('INTERNAL_SERVER_ERROR'), 'detail')
    ).toBe('Không thể tải chi tiết mục quyết toán.')
    expect(describeSettlementError(err('RESOURCE_NOT_FOUND'), 'detail')).toBe(
      'Mục quyết toán không tồn tại hoặc nằm ngoài phạm vi được gán cho bạn.'
    )
    expect(
      describeSettlementError(
        err('VALIDATION_ERROR', 'Ngày kết thúc không được trước ngày bắt đầu'),
        'list'
      )
    ).toBe('Ngày kết thúc không được trước ngày bắt đầu')
  })
})
