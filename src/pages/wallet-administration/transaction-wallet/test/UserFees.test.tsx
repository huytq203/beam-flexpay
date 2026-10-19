import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import UserFees from '../components/UserFees'

const p2p = {
  transactionType: 'P2P_TRANSFER',
  amount: 9600,
  grossAmount: 10100,
  feeAmount: 500,
  feeBearer: 'BOTH',
  senderFeeAmount: 100,
  receiverFeeAmount: 400,
  currency: 'VND'
} as UnifiedContentJournal

describe('UserFees', () => {
  it('chuyển tiền cả hai bên chịu phí: badge và các dòng tổng', () => {
    render(
      <UserFees
        data={p2p}
        profit={{
          userFeeTotal: 500,
          userFeeBreakdown: [],
          feeBreakdownAvailable: false,
          feePolicyName: null,
          feePolicyValidFrom: null,
          providerCost: 250,
          providerCostAvailable: true,
          grossProfit: 250,
          grossProfitLabel: ''
        }}
      />
    )

    expect(
      screen.getByText('Chuyển tiền · Cả hai chịu phí')
    ).toBeInTheDocument()
    expect(screen.getByText('10,000 VND')).toBeInTheDocument()
    expect(screen.getByText('10,100 VND')).toBeInTheDocument()
    expect(screen.getByText('9,600 VND')).toBeInTheDocument()
    // Phí NCC nằm ở thẻ "Chi phí nhà cung cấp" (FeeNCC), không lặp lại ở đây.
    expect(screen.queryByText(/Phí đầu vào/)).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
