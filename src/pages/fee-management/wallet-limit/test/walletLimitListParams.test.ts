import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import { WALLET_LIMIT_DEFAULT_PAGE_SIZE } from '../constants/walletLimit.constants'
import { EMPTY_WALLET_LIMIT_FILTERS } from '../types/walletLimitList.types'
import {
  buildWalletLimitListParams,
  toVietnamDayEndIso,
  toVietnamDayStartIso
} from '../utils/walletLimit.listParams'

describe('buildWalletLimitListParams', () => {
  it('bỏ mọi giá trị rỗng, chỉ giữ phân trang', () => {
    const params = buildWalletLimitListParams(
      { ...EMPTY_WALLET_LIMIT_FILTERS, targetKeyword: '   ' },
      1,
      WALLET_LIMIT_DEFAULT_PAGE_SIZE
    )

    expect(params).toStrictEqual({
      page: 1,
      size: WALLET_LIMIT_DEFAULT_PAGE_SIZE
    })
  })

  it('trim từ khóa và giữ các giá trị lọc đã chọn', () => {
    const params = buildWalletLimitListParams(
      {
        scopeType: 'WALLET',
        targetKeyword: ' 0912 ',
        transactionType: 'WITHDRAWAL',
        status: 'LOCKED',
        bankCode: 'VCB',
        paymentMethod: 'LINKED_ACCOUNT'
      },
      3,
      50
    )

    expect(params).toStrictEqual({
      page: 3,
      size: 50,
      scopeType: 'WALLET',
      targetKeyword: '0912',
      transactionType: 'WITHDRAWAL',
      status: 'LOCKED',
      bankCode: 'VCB',
      paymentMethod: 'LINKED_ACCOUNT'
    })
  })

  it('đổi ngày thành đầu ngày và cuối ngày theo giờ Việt Nam', () => {
    const params = buildWalletLimitListParams(
      {
        ...EMPTY_WALLET_LIMIT_FILTERS,
        createdFrom: dayjs('2026-10-01'),
        createdTo: dayjs('2026-10-01')
      },
      1,
      20
    )

    expect(params.createdFrom).toBe('2026-09-30T17:00:00.000Z')
    expect(params.createdTo).toBe('2026-10-01T16:59:59.999Z')
  })
})

describe('mốc ngày theo giờ Việt Nam', () => {
  it('không phụ thuộc giờ trong ngày của giá trị chọn', () => {
    const date = dayjs('2026-10-01T23:30:00')

    expect(toVietnamDayStartIso(date)).toBe('2026-09-30T17:00:00.000Z')
    expect(toVietnamDayEndIso(date)).toBe('2026-10-01T16:59:59.999Z')
  })

  it('xử lý đúng ngày cuối tháng và cuối năm', () => {
    expect(toVietnamDayEndIso(dayjs('2026-12-31'))).toBe(
      '2026-12-31T16:59:59.999Z'
    )
    expect(toVietnamDayStartIso(dayjs('2027-01-01'))).toBe(
      '2026-12-31T17:00:00.000Z'
    )
  })
})
