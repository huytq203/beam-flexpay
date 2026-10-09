import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import {
  buildMerchantTransactionParams,
  getRowNumber
} from '../utils/merchantTransaction.utils'

const merchant = { id: 'm-1', code: 'MC01', name: 'Hoàng Long' }

describe('buildMerchantTransactionParams', () => {
  it('chưa chọn merchant thì lọc theo nguồn MERCHANT và không gửi partyId', () => {
    expect(buildMerchantTransactionParams({ keyword: '' }, 1, 10)).toEqual({
      page: 1,
      size: 10,
      sourceDomain: 'MERCHANT',
      includeSummary: true,
      partyId: undefined,
      keyword: undefined,
      transactionType: undefined,
      status: undefined,
      fromDate: undefined,
      toDate: undefined
    })
  })

  it('gắn partyId, sourceDomain, includeSummary và bỏ giá trị rỗng', () => {
    expect(
      buildMerchantTransactionParams(
        { merchant, keyword: '  FW26  ', status: 'POSTED' },
        2,
        20
      )
    ).toEqual({
      page: 2,
      size: 20,
      sourceDomain: 'MERCHANT',
      includeSummary: true,
      partyId: 'm-1',
      keyword: 'FW26',
      transactionType: undefined,
      status: 'POSTED',
      fromDate: undefined,
      toDate: undefined
    })
  })

  it('đổi khoảng ngày chọn sang đầu/cuối ngày dạng UTC không kèm múi giờ', () => {
    const params = buildMerchantTransactionParams(
      {
        merchant,
        keyword: '',
        fromDate: dayjs('2026-10-01'),
        toDate: dayjs('2026-10-09')
      },
      1,
      10
    )

    expect(params?.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    expect(params?.toDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/)
    expect(
      dayjs.utc(params?.fromDate).isBefore(dayjs.utc(params?.toDate))
    ).toBe(true)
  })
})

describe('getRowNumber', () => {
  it('tính số thứ tự theo trang và kích thước trang', () => {
    expect(getRowNumber(1, 10, 0)).toBe(1)
    expect(getRowNumber(3, 20, 4)).toBe(45)
  })
})
