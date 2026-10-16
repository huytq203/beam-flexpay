import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FeeAssignment } from '@type/fee.type'
import { ChannelCell } from '../components/ChannelCell'

const assignment = (overrides: Partial<FeeAssignment>): FeeAssignment => ({
  id: 'a1',
  feePolicyId: 'p1',
  merchantId: null,
  bankCode: null,
  providerCode: null,
  paymentMethod: null,
  cardType: null,
  serviceType: 'EWALLET_DEPOSIT',
  customerGroup: null,
  subjectType: null,
  subjectId: null,
  status: 'ACTIVE',
  effectiveFromDate: null,
  effectiveToDate: null,
  ...overrides
})

describe('ChannelCell — nhà cung cấp', () => {
  it('hiện NCC và ngân hàng phát hành của bản gán nạp tiền', () => {
    render(
      <ChannelCell
        serviceType='EWALLET_DEPOSIT'
        assignments={[assignment({ providerCode: 'NAPAS', bankCode: 'TCB' })]}
      />
    )

    expect(screen.getByText(/NCC: NAPAS/)).toBeInTheDocument()
    expect(screen.getByText('TCB')).toBeInTheDocument()
  })

  it('bản gán không ghi NCC nói rõ là mọi NCC', () => {
    render(
      <ChannelCell
        serviceType='EWALLET_WITHDRAWAL'
        assignments={[assignment({ serviceType: 'EWALLET_WITHDRAWAL' })]}
      />
    )

    expect(screen.getByText(/Mọi NCC/)).toBeInTheDocument()
    expect(screen.getByText(/Tất cả ngân hàng phát hành /)).toBeInTheDocument()
  })

  it('không hiện NCC ở loại giao dịch không đi qua nhà cung cấp', () => {
    render(
      <ChannelCell
        serviceType='EWALLET_TRANSFER_INTERNAL'
        assignments={[assignment({ serviceType: 'EWALLET_TRANSFER_INTERNAL' })]}
      />
    )

    expect(screen.queryByText(/NCC/)).not.toBeInTheDocument()
  })
})
