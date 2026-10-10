import { describe, expect, it } from 'vitest'
import {
  buildCreateRefundRequest,
  formatRefundedAmount,
  getDisplayStatus,
  getPendingRefundAmount,
  readRefundFields,
  toHasRefundParam
} from '../dto/transactionRefund.dto'

const values = {
  requestedAmount: 50000,
  reason: 'Khách báo chuyển nhầm',
  sendNotification: true
}

describe('hiển thị hoàn tiền', () => {
  it('displayStatus ưu tiên hơn status, thiếu thì rơi về status', () => {
    expect(
      getDisplayStatus({ status: 'FAILED', displayStatus: 'FAILED_REFUND' })
    ).toBe('FAILED_REFUND')
    expect(getDisplayStatus({ status: 'FAILED', displayStatus: null })).toBe(
      'FAILED'
    )
    expect(getDisplayStatus({ status: 'POSTED' })).toBe('POSTED')
  })

  it('refundedAmount null hoặc vắng là "-", 0 là 0', () => {
    expect(
      formatRefundedAmount({ currency: 'VND' }, readRefundFields({}))
    ).toBe('-')
    expect(
      formatRefundedAmount(
        { currency: 'VND' },
        readRefundFields({ refundedAmount: null })
      )
    ).toBe('-')
    expect(
      formatRefundedAmount(
        { currency: 'VND' },
        readRefundFields({ refundedAmount: 0 })
      )
    ).toBe('0 VND')
    expect(
      formatRefundedAmount(
        { currency: 'VND' },
        readRefundFields({ refundedAmount: 1500000 })
      )
    ).toBe('1,500,000 VND')
  })

  it('chỉ báo Đang chờ hoàn khi lớn hơn 0', () => {
    expect(getPendingRefundAmount({ pendingRefundAmount: 0 })).toBeNull()
    expect(getPendingRefundAmount({ pendingRefundAmount: null })).toBeNull()
    expect(getPendingRefundAmount({ pendingRefundAmount: 30000 })).toBe(30000)
  })

  it('trường sai kiểu coi như chưa biết thay vì làm hỏng dòng', () => {
    expect(readRefundFields({ refundedAmount: 'x' })).toEqual({})
  })
})

describe('toHasRefundParam', () => {
  it('true/false/bỏ trống', () => {
    expect(toHasRefundParam('true')).toBe(true)
    expect(toHasRefundParam('false')).toBe(false)
    expect(toHasRefundParam('')).toBeUndefined()
    expect(toHasRefundParam(undefined)).toBeUndefined()
  })
})

describe('buildCreateRefundRequest', () => {
  it('dùng transactionId của wallet-core, không phải mã giao dịch', () => {
    const request = buildCreateRefundRequest(
      { transactionId: 'gl-1', transactionType: 'P2P_TRANSFER' },
      values
    )
    expect(request).toEqual({
      originalTransactionId: 'gl-1',
      requestedAmount: 50000,
      channel: 'TO_WALLET',
      reason: 'Khách báo chuyển nhầm',
      sendNotification: true,
      createdSource: 'ADMIN_PORTAL'
    })
  })

  it('nạp tiền khoá TO_BANK và gửi placeholder thụ hưởng', () => {
    expect(
      buildCreateRefundRequest(
        { transactionId: 'gl-1', transactionType: 'CASH_IN' },
        values
      )
    ).toMatchObject({
      channel: 'TO_BANK',
      beneficiaryBankCode: 'N/A',
      beneficiaryAccountNumber: 'N/A',
      beneficiaryAccountName: 'N/A'
    })
  })

  it('thiếu transactionId hoặc loại không hoàn được thì không dựng yêu cầu', () => {
    expect(
      buildCreateRefundRequest(
        { transactionId: null, transactionType: 'CASH_IN' },
        values
      )
    ).toBeNull()
    expect(
      buildCreateRefundRequest(
        { transactionId: 'gl-1', transactionType: 'REVERSAL' },
        values
      )
    ).toBeNull()
  })
})
