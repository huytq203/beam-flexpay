import { describe, expect, it } from 'vitest'
import {
  describeSettlementError,
  toSettlementQuery,
  validateSettlementFilters
} from '../utils/settlementItem.utils'

const SUB = '3fa85f64-5717-4562-b3fc-2c963f66afa7'

describe('kiểm tra bộ lọc mục quyết toán', () => {
  it('chỉ đòi đủ hai ngày, paidTo không trước paidFrom và tối đa 92 ngày', () => {
    expect(validateSettlementFilters({})).toBe('dates')
    expect(validateSettlementFilters({ subMerchantId: SUB })).toBe('dates')
    expect(validateSettlementFilters({ paidFrom: '2026-10-01' })).toBe('dates')
    expect(
      validateSettlementFilters({
        paidFrom: '01/10/2026',
        paidTo: '2026-10-02'
      })
    ).toBe('dates')
    expect(
      validateSettlementFilters({
        paidFrom: '2026-10-05',
        paidTo: '2026-10-01'
      })
    ).toBe('range')
    // 92 ngày gồm hai đầu là hợp lệ, 93 ngày thì không.
    expect(
      validateSettlementFilters({
        paidFrom: '2026-01-01',
        paidTo: '2026-04-02'
      })
    ).toBeUndefined()
    expect(
      validateSettlementFilters({
        paidFrom: '2026-01-01',
        paidTo: '2026-04-03'
      })
    ).toBe('span')
  })

  it('không cần Sub và Merchant; có thì truyền đi', () => {
    expect(toSettlementQuery({ subMerchantId: SUB })).toBeUndefined()
    expect(
      toSettlementQuery({ paidFrom: '2026-10-01', paidTo: '2026-10-02' })
    ).toEqual({
      merchantId: undefined,
      subMerchantId: undefined,
      paidFrom: '2026-10-01',
      paidTo: '2026-10-02'
    })
    expect(
      toSettlementQuery({
        merchantId: 'master-1',
        subMerchantId: SUB,
        paidFrom: '2026-10-01',
        paidTo: '2026-10-02'
      })
    ).toMatchObject({ merchantId: 'master-1', subMerchantId: SUB })
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
