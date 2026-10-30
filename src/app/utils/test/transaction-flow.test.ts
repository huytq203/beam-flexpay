import { describe, expect, it } from 'vitest'
import {
  buildPersonalFlow,
  buildTransactionFlow,
  resolveFeeDeduction
} from '@utils/transaction-flow'

type FlowInput = Parameters<typeof buildTransactionFlow>[0]

const record = (over: Partial<FlowInput>): FlowInput => ({
  transactionType: 'P2P_TRANSFER',
  amount: 0,
  grossAmount: 0,
  feeAmount: 0,
  ...over
})

const NO_FLOW = { walletDebit: 0, walletCredit: 0, bankDebit: 0, bankCredit: 0 }

describe('buildTransactionFlow — 7 cột số tiền của danh sách giao dịch', () => {
  it('nạp tiền: bank trừ gốc + phí người chuyển, ví cộng đủ gốc', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'CASH_IN',
        amount: 1_000_000,
        grossAmount: 1_100_000,
        feeAmount: 100_000
      })
    )
    expect(flow).toEqual({
      principal: 1_000_000,
      senderFee: 100_000,
      receiverFee: 0,
      totals: { ...NO_FLOW, walletCredit: 1_000_000, bankDebit: 1_100_000 }
    })
  })

  it('rút tiền, feeBearer null (người chuyển chịu): yêu cầu = amount, ví trừ thêm phí', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'CASH_OUT',
        amount: 100_000,
        grossAmount: 102_000,
        feeAmount: 2_000
      })
    )
    expect(flow).toEqual({
      principal: 100_000,
      senderFee: 2_000,
      receiverFee: 0,
      totals: { ...NO_FLOW, walletDebit: 102_000, bankCredit: 100_000 }
    })
  })

  it('rút tiền, người nhận chịu: yêu cầu = grossAmount, bank nhận gốc − phí', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'CASH_OUT',
        feeBearer: 'RECEIVER',
        amount: 98_000,
        grossAmount: 100_000,
        feeAmount: 2_000
      })
    )
    expect(flow).toEqual({
      principal: 100_000,
      senderFee: 0,
      receiverFee: 2_000,
      totals: { ...NO_FLOW, walletDebit: 100_000, bankCredit: 98_000 }
    })
  })

  it('rút tiền, cả hai chịu: yêu cầu = amount + phí người nhận', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'CASH_OUT',
        feeBearer: 'BOTH',
        amount: 97_000,
        grossAmount: 101_000,
        feeAmount: 4_000,
        senderFeeAmount: 1_000,
        receiverFeeAmount: 3_000
      })
    )
    expect(flow).toEqual({
      principal: 100_000,
      senderFee: 1_000,
      receiverFee: 3_000,
      totals: { ...NO_FLOW, walletDebit: 101_000, bankCredit: 97_000 }
    })
  })

  it('chuyển tiền cả hai chịu phí: chỉ ghi ví người chuyển bị trừ', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'P2P_TRANSFER',
        grossAmount: 101_000,
        feeAmount: 5_000,
        feeBearer: 'BOTH',
        senderFeeAmount: 1_000,
        receiverFeeAmount: 4_000
      })
    )
    expect(flow).toEqual({
      principal: 100_000,
      senderFee: 1_000,
      receiverFee: 4_000,
      totals: { ...NO_FLOW, walletDebit: 101_000 }
    })
  })

  it('thanh toán ví: ví trừ gốc + phí người chuyển, không ghi phía nhận', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'MERCHANT_PAYMENT',
        amount: 1_000_000,
        grossAmount: 1_100_000,
        feeAmount: 100_000
      })
    )
    expect(flow.totals).toEqual({ ...NO_FLOW, walletDebit: 1_100_000 })
    expect(flow.senderFee).toBe(100_000)
  })

  it('loại giao dịch chưa có quy tắc: không đoán dòng tiền', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'UNKNOWN_TYPE',
        amount: 5_000,
        grossAmount: 5_000
      })
    )
    expect(flow.totals).toBeNull()
    expect(flow.principal).toBe(5_000)
  })
})

describe('buildPersonalFlow — lịch sử ví riêng', () => {
  const p2p = {
    amount: 96_000,
    transactionType: 'P2P_TRANSFER',
    grossAmount: 1_200_000,
    feeAmount: 300_000,
    feeBearer: 'BOTH',
    senderFeeAmount: 200_000,
    receiverFeeAmount: 100_000,
    from: { id: 'sender', username: null, displayName: null, type: 'USER' },
    to: { id: 'receiver', username: null, displayName: null, type: 'USER' }
  }

  it('ví người nhận: phí nhận + cộng ví gốc − phí nhận', () => {
    const flow = buildPersonalFlow(p2p, 'receiver')
    expect(flow).toMatchObject({
      principal: 1_000_000,
      fee: 100_000,
      walletFee: 100_000,
      bankFee: 0
    })
    expect(flow.totals).toMatchObject({ walletCredit: 900_000, walletDebit: 0 })
  })

  it('ví người chuyển: phí chuyển + trừ ví gốc + phí chuyển', () => {
    const flow = buildPersonalFlow(p2p, 'sender')
    expect(flow).toMatchObject({ fee: 200_000 })
    expect(flow.totals).toMatchObject({
      walletDebit: 1_200_000,
      walletCredit: 0
    })
  })

  it('nạp/rút: phí giao dịch là phí duy nhất của giao dịch', () => {
    const cashOut = buildPersonalFlow(
      {
        ...p2p,
        transactionType: 'CASH_OUT',
        amount: 1_000_000,
        grossAmount: 1_200_000,
        feeAmount: 200_000,
        feeBearer: null
      },
      'x'
    )
    expect(cashOut).toMatchObject({ fee: 200_000 })
    expect(cashOut.totals).toMatchObject({
      walletDebit: 1_200_000,
      bankCredit: 1_000_000
    })
  })
})

describe('resolveFeeDeduction — cột Phí trừ ví / Phí trừ bank', () => {
  const party = (type: string) => ({
    id: null,
    username: null,
    displayName: null,
    type
  })

  it('nạp tiền từ bank: phí vào Phí trừ bank', () => {
    expect(
      resolveFeeDeduction({
        ...record({
          transactionType: 'CASH_IN',
          amount: 100_000,
          grossAmount: 102_024,
          feeAmount: 2024,
          feeBearer: null
        }),
        from: party('BANK')
      })
    ).toEqual({ walletFee: 0, bankFee: 2024, walletSplit: null })
  })

  it('rút tiền từ ví: phí vào Phí trừ ví', () => {
    expect(
      resolveFeeDeduction({
        ...record({
          transactionType: 'CASH_OUT',
          amount: 100_000,
          grossAmount: 101_000,
          feeAmount: 1000
        }),
        from: party('USER')
      })
    ).toEqual({ walletFee: 1000, bankFee: 0, walletSplit: null })
  })

  it('chuyển tiền: phí trừ ví tách riêng người chuyển / người nhận', () => {
    expect(
      resolveFeeDeduction({
        ...record({
          grossAmount: 1_200_000,
          feeAmount: 300_000,
          feeBearer: 'BOTH',
          senderFeeAmount: 200_000,
          receiverFeeAmount: 100_000
        }),
        from: party('USER')
      })
    ).toEqual({
      walletFee: 300_000,
      bankFee: 0,
      walletSplit: { senderFee: 200_000, receiverFee: 100_000 }
    })
  })
})

/**
 * Lệnh chi hoàn tiền ra ngân hàng (REFUND_BANK_PAYOUT) là một lệnh rút: trừ ví, cộng bank — trước đây không có
 * trong bảng luồng nên màn Lịch sử rút tiền hiện "-0". Journal hoàn về ví (REFUND_WALLET_CREDIT) cộng ví như REVERSAL.
 */
describe('buildTransactionFlow — journal hoàn tiền', () => {
  it('lệnh chi hoàn ra ngân hàng trừ ví và cộng bank như rút tiền', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'REFUND_BANK_PAYOUT',
        amount: 10_203,
        grossAmount: 10_203,
        feeAmount: 0
      })
    )
    expect(flow.totals?.walletDebit).toBe(10_203)
    expect(flow.totals?.bankCredit).toBe(10_203)
  })

  it('hoàn về ví cộng ví', () => {
    const flow = buildTransactionFlow(
      record({
        transactionType: 'REFUND_WALLET_CREDIT',
        amount: 50_000,
        grossAmount: 50_000,
        feeAmount: 0
      })
    )
    expect(flow.totals?.walletCredit).toBe(50_000)
    expect(flow.totals?.walletDebit).toBe(0)
  })
})
