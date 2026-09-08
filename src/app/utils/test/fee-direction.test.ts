import { describe, expect, it } from 'vitest'
import {
  FeeDirection,
  filterServiceTypeLabels,
  getFeeDirection,
  getServiceTypesByDirection,
  isFeeDirection
} from '../fee-direction'

const LABELS = {
  EWALLET_DEPOSIT: 'Nạp tiền ví',
  EWALLET_WITHDRAWAL: 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL: 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL: 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK: 'Hoàn tiền',
  MERCHANT_VA_BILL_COLLECTION: 'Thu hộ VA',
  PAYOUT_BANK_TRANSFER: 'Chi hộ chuyển khoản ngân hàng'
}

/**
 * Chép nguyên `com.flexpay.fee.common.enums.ServiceType` của service phí. Test
 * này hỏng khi BE thêm giá trị mới mà FE chưa khai — đó là điều mong muốn.
 */
const BE_SERVICE_TYPES = [
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL',
  'EWALLET_TRANSFER_INTERNAL',
  'EWALLET_TRANSFER_EXTERNAL',
  'EWALLET_CASHBACK',
  'MERCHANT_VA_BILL_COLLECTION',
  'PAYOUT_BANK_TRANSFER'
]

describe('chiều tiền suy từ loại dịch vụ', () => {
  it('xếp nạp tiền và thu hộ vào đầu vào', () => {
    expect(getFeeDirection('EWALLET_DEPOSIT')).toBe(FeeDirection.IN)
    expect(getFeeDirection('MERCHANT_VA_BILL_COLLECTION')).toBe(FeeDirection.IN)
  })

  it('xếp rút tiền và chuyển liên ngân hàng vào đầu ra', () => {
    expect(getFeeDirection('EWALLET_WITHDRAWAL')).toBe(FeeDirection.OUT)
    expect(getFeeDirection('EWALLET_TRANSFER_EXTERNAL')).toBe(FeeDirection.OUT)
  })

  it('không xếp giao dịch không qua ngân hàng vào đầu vào hay đầu ra', () => {
    expect(getFeeDirection('EWALLET_TRANSFER_INTERNAL')).toBe(FeeDirection.INTERNAL)
    expect(getFeeDirection('EWALLET_CASHBACK')).toBe(FeeDirection.INTERNAL)
  })

  it('trả null cho loại dịch vụ lạ hoặc rỗng thay vì đoán bừa', () => {
    expect(getFeeDirection('SOMETHING_NEW')).toBeNull()
    expect(getFeeDirection(null)).toBeNull()
    expect(getFeeDirection(undefined)).toBeNull()
    expect(getFeeDirection('')).toBeNull()
  })

  it('xếp chi hộ ra ngân hàng vào đầu ra', () => {
    expect(getFeeDirection('PAYOUT_BANK_TRANSFER')).toBe(FeeDirection.OUT)
  })

  it('phủ hết ServiceType của BE — không bỏ sót giá trị nào', () => {
    const unclassified = BE_SERVICE_TYPES.filter(
      (serviceType) => getFeeDirection(serviceType) === null
    )
    expect(unclassified).toEqual([])
  })

  it('liệt kê đúng loại dịch vụ của một chiều', () => {
    expect(getServiceTypesByDirection(FeeDirection.OUT)).toEqual([
      'EWALLET_WITHDRAWAL',
      'EWALLET_TRANSFER_EXTERNAL',
      'PAYOUT_BANK_TRANSFER'
    ])
  })

  it('nhận diện giá trị chiều tiền hợp lệ', () => {
    expect(isFeeDirection('OUT')).toBe(true)
    expect(isFeeDirection('SIDEWAYS')).toBe(false)
    expect(isFeeDirection(null)).toBe(false)
  })
})

describe('lọc nhãn loại dịch vụ theo chiều', () => {
  it('chỉ giữ mục thuộc chiều đang chọn', () => {
    expect(filterServiceTypeLabels(LABELS, FeeDirection.IN)).toEqual({
      EWALLET_DEPOSIT: 'Nạp tiền ví',
      MERCHANT_VA_BILL_COLLECTION: 'Thu hộ VA'
    })
  })

  it('giữ nguyên toàn bộ khi chưa chọn chiều', () => {
    expect(filterServiceTypeLabels(LABELS, null)).toEqual(LABELS)
  })
})
