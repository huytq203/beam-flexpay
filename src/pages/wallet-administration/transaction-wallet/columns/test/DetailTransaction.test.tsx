import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DetailTransaction from '../../DetailTransaction'

const mocks = vi.hoisted(() => ({
  useDetailTransaction: vi.fn()
}))

vi.mock('../../hooks/useDetailTransaction', () => ({
  default: mocks.useDetailTransaction
}))

const transaction = {
  id: 'journal-id',
  journalCode: 'JRN-001',
  transactionCode: 'TXN-001',
  status: 'POSTED',
  transactionType: 'CASH_OUT',
  sourceDomain: 'USER_WALLET',
  from: {
    id: 'user-id',
    username: '0901234567',
    displayName: 'Nguyễn Văn A',
    type: 'USER'
  },
  to: {
    id: null,
    username: null,
    displayName: 'VPB',
    type: 'BANK'
  },
  amount: 100_000,
  grossAmount: 105_000,
  feeAmount: 5_000,
  currency: 'VND',
  feeCalculationId: 'fee-calculation-id',
  paymentMethod: 'BANK_TRANSFER',
  bankCode: 'VPB',
  bankRefId: 'BANK-REF-001',
  maskedAccount: '****0011',
  transactionId: 'gl-transaction-id',
  reversesJournalId: null,
  reversedByJournalId: null,
  description: 'Rút tiền về ngân hàng',
  failureReason: null,
  details: {},
  createdAt: '2026-08-18T10:00:00',
  postedAt: '2026-08-18T10:00:05',
  archivedAt: null,
  completedAt: '2026-08-18T10:00:05',
  frozen: false,
  freeze: null
}

describe('DetailTransaction', () => {
  beforeEach(() => {
    mocks.useDetailTransaction.mockReturnValue({
      getTransactionById: transaction,
      profit: {
        userFeeTotal: 5_000,
        userFeeBreakdown: [{
          componentType: 'TRANSACTION_FEE',
          fixedAmount: 2_000,
          percentage: 3,
          baseValue: 100_000,
          percentageFee: 3_000,
          calculatedFee: 5_000
        }],
        feeBreakdownAvailable: true,
        feePolicyName: 'Phí rút tiền tiêu chuẩn',
        feePolicyValidFrom: '2026-08-01T00:00:00',
        providerCost: null,
        providerCostAvailable: false,
        grossProfit: 5_000,
        grossProfitLabel: 'Lợi nhuận gộp (chưa trừ chi phí NCC)'
      },
      moneyFlow: [{
        sequence: 1,
        step: 'Ghi nhận số tiền giao dịch',
        debitAccount: 'USER_WALLET_VND (0901234567)',
        creditAccount: 'SYS_BANK_SETTLEMENT_VND',
        amount: 100_000,
        occurredAt: '2026-08-18T10:00:04'
      }],
      customer: {
        userId: 'user-id',
        username: '0901234567',
        fullName: 'Nguyễn Văn A',
        walletAccountId: 'wallet-id',
        walletGlCode: 'USER_WALLET_VND',
        walletStatus: 'ACTIVE',
        walletEnabled: true,
        tier: 'STANDARD',
        ekycStatus: 'VERIFIED'
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn()
    })
  })

  it('ghép dữ liệu detail 360 vào phí, luồng tiền và hồ sơ khách hàng', () => {
    renderWithProviders(
      <MessageProvider>
        <DetailTransaction />
      </MessageProvider>
    )

    expect(screen.getByText('Phí rút tiền tiêu chuẩn')).toBeInTheDocument()
    expect(screen.getByText('TRANSACTION_FEE')).toBeInTheDocument()
    expect(screen.getByText('USER_WALLET_VND (0901234567)')).toBeInTheDocument()
    expect(screen.getByText('SYS_BANK_SETTLEMENT_VND')).toBeInTheDocument()
    expect(screen.getAllByText('Nguyễn Văn A')).toHaveLength(2)
    expect(screen.getByText('VERIFIED')).toBeInTheDocument()
    expect(screen.getByText('****0011')).toBeInTheDocument()
    expect(screen.getByText('Lợi nhuận gộp (chưa trừ chi phí NCC)')).toBeInTheDocument()
  })

  it('hiển thị ví nhận thay cho tài khoản ngân hàng khi nạp tiền', () => {
    mocks.useDetailTransaction.mockReturnValue({
      getTransactionById: {
        ...transaction,
        transactionType: 'CASH_IN',
        maskedAccount: '****0011',
        to: {
          id: 'wallet-id',
          username: '0962341913',
          displayName: '0962341913',
          type: 'USER'
        }
      },
      profit: undefined,
      moneyFlow: [],
      customer: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn()
    })

    renderWithProviders(
      <MessageProvider>
        <DetailTransaction />
      </MessageProvider>
    )

    expect(screen.getByText('Ví thụ hưởng:')).toBeInTheDocument()
    expect(screen.getAllByText('0962341913')).not.toHaveLength(0)
    expect(screen.queryByText('****0011')).not.toBeInTheDocument()
  })

  it('không bịa chi phí hoặc hồ sơ khi backend chưa trả profit và customer', () => {
    mocks.useDetailTransaction.mockReturnValue({
      getTransactionById: transaction,
      profit: undefined,
      moneyFlow: [],
      customer: undefined,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: vi.fn()
    })

    renderWithProviders(
      <MessageProvider>
        <DetailTransaction />
      </MessageProvider>
    )

    expect(screen.getByText(/API chưa cung cấp chi tiết cấu phần phí/)).toBeInTheDocument()
    expect(screen.getByText(/API chưa cung cấp chi phí nhà cung cấp/)).toBeInTheDocument()
    expect(screen.getByText(/API chưa cung cấp hồ sơ khách hàng tổng hợp/)).toBeInTheDocument()
  })
})
