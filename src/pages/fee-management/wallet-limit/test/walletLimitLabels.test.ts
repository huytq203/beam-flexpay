import { WalletLimitTransactionType } from '@type/walletLimit.type'
import { describe, expect, it } from 'vitest'
import {
  getLimitHint,
  getLimitLabel,
  LIMIT_FIELD_LABELS,
  REGULAR_GROUP_MONTHLY_HINT,
  REGULAR_GROUP_MONTHLY_LABEL
} from '../constants/walletLimit.constants'

describe('nhãn hạn mức tháng dịch vụ thông thường', () => {
  it('dòng Tất cả ghi rõ phạm vi Chuyển tiền + Thanh toán và có ghi chú nạp/rút', () => {
    expect(
      getLimitLabel('normalMonthlyMaximum', WalletLimitTransactionType.ALL)
    ).toBe(REGULAR_GROUP_MONTHLY_LABEL)
    expect(
      getLimitHint('normalMonthlyMaximum', WalletLimitTransactionType.ALL)
    ).toBe(REGULAR_GROUP_MONTHLY_HINT)
  })

  it('dòng theo loại giữ nhãn cũ, không có ghi chú', () => {
    expect(
      getLimitLabel('normalMonthlyMaximum', WalletLimitTransactionType.DEPOSIT)
    ).toBe(LIMIT_FIELD_LABELS.normalMonthlyMaximum)
    expect(
      getLimitHint('normalMonthlyMaximum', WalletLimitTransactionType.DEPOSIT)
    ).toBeUndefined()
  })

  it('ô khác không đổi nhãn ở dòng Tất cả', () => {
    expect(getLimitLabel('dailyMaximum', WalletLimitTransactionType.ALL)).toBe(
      LIMIT_FIELD_LABELS.dailyMaximum
    )
  })
})
