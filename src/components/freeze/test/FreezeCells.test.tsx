import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { FreezeItem } from '@type/freeze.type'
import { FreezeAmountCell } from '../FreezeAmountCell'
import { FreezeRowActions } from '../FreezeRowActions'
import { FreezeStatusCell } from '../FreezeStatusCell'

const freeze = (overrides: Partial<FreezeItem> = {}): FreezeItem => ({
  id: 'freeze-1',
  accountId: 'account-1',
  sourceTransactionId: null,
  sourceTransactionCode: null,
  ownerId: 'owner-1',
  ownerType: 'USER',
  ownerUsername: '0988753731',
  amount: 50_000,
  requestedAmount: 50_000,
  releasedAmount: 0,
  remainingAmount: 50_000,
  shortfallAmount: 0,
  totalHeldAmount: 50_000,
  totalReleasedAmount: 0,
  topUpCount: 0,
  parentFreezeId: null,
  displayStatus: 'FROZEN',
  reason: 'Nghi ngờ gian lận',
  unfreezeReason: null,
  status: 'ACTIVE',
  releaseType: null,
  type: 'ADMIN_LOCK',
  createdAt: '2026-08-25T15:56:05.326622',
  createdBy: 'huytq',
  updatedAt: '2026-08-25T15:56:05.326622',
  updatedBy: 'huytq',
  unfreezeCommandId: null,
  unfreezeCommandStatus: null,
  ...overrides
})

const pendingFreeze = freeze({
  unfreezeCommandId: 'command-1',
  unfreezeCommandStatus: 'PENDING_APPROVAL'
})

describe('FreezeStatusCell', () => {
  it('hiện "Đang chờ phê duyệt" khi lệnh mở băng chưa được duyệt', () => {
    render(<FreezeStatusCell item={pendingFreeze} />)
    expect(screen.getByText('Đang chờ phê duyệt')).toBeInTheDocument()
  })

  it('hiện nhãn theo displayStatus khi không có lệnh chờ duyệt', () => {
    render(<FreezeStatusCell item={freeze({ displayStatus: 'PARTIALLY_RELEASED' })} />)
    expect(screen.getByText('Giải tỏa một phần')).toBeInTheDocument()
  })
})

describe('FreezeAmountCell', () => {
  it('chỉ hiện một dòng khi lệnh chưa giải tỏa và không thiếu tiền', () => {
    render(<FreezeAmountCell item={freeze()} />)
    expect(screen.getByText('50,000 VNĐ')).toBeInTheDocument()
    expect(screen.queryByText(/Đã giải tỏa/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Còn thiếu/)).not.toBeInTheDocument()
  })

  it('không giấu phần đã giải tỏa, phần còn thiếu và số lần bù', () => {
    render(
      <FreezeAmountCell
        item={freeze({
          totalHeldAmount: 80_000,
          totalReleasedAmount: 20_000,
          shortfallAmount: 15_000,
          topUpCount: 2
        })}
      />
    )
    expect(screen.getByText('80,000 VNĐ')).toBeInTheDocument()
    expect(screen.getByText(/Đã giải tỏa/)).toHaveTextContent('20,000 VNĐ')
    expect(screen.getByText(/Còn thiếu/)).toHaveTextContent('15,000 VNĐ')
    expect(screen.getByText('Đã bù 2 lần')).toBeInTheDocument()
  })
})

describe('FreezeRowActions', () => {
  it('bản ghi đang đóng băng thì mở bước tạo yêu cầu mở băng', async () => {
    const onRequestUnfreeze = vi.fn()
    render(
      <FreezeRowActions
        item={freeze()}
        canApprove={false}
        onRequestUnfreeze={onRequestUnfreeze}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Mở băng' }))
    expect(onRequestUnfreeze).toHaveBeenCalledWith(freeze())
  })

  it('có quyền duyệt thì hiện đúng hai lựa chọn của checker', async () => {
    const onDecide = vi.fn()
    render(
      <FreezeRowActions item={pendingFreeze} canApprove onDecide={onDecide} />
    )

    expect(screen.queryByRole('button', { name: 'Mở băng' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Duyệt' }))
    expect(onDecide).toHaveBeenCalledWith(pendingFreeze, 'APPROVE')

    await userEvent.click(screen.getByRole('button', { name: 'Từ chối' }))
    expect(onDecide).toHaveBeenCalledWith(pendingFreeze, 'REJECT')
  })

  it('thiếu quyền duyệt thì ẩn hẳn hành động, không hiện dạng mờ', () => {
    render(<FreezeRowActions item={pendingFreeze} canApprove={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('bản ghi đã kết thúc thì không còn hành động nào', () => {
    render(<FreezeRowActions item={freeze({ status: 'RELEASED' })} canApprove />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
