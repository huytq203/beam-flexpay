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
  freezeCode: 'FZ7K4M9Q2H',
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
  unfreezeLogs: [],
  unfreezeCommandId: null,
  unfreezeCommandStatus: null,
  unfreezeCommandAmount: null,
  unfreezeCommandMakerId: null,
  unfreezeCommandReason: null,
  unfreezeCommandCreatedAt: null,
  unfreezeCommands: [],
  ...overrides
})

const pendingFreeze = freeze({
  unfreezeCommandId: 'command-1',
  unfreezeCommandStatus: 'PENDING_APPROVAL',
  unfreezeCommandMakerId: 'maker_user',
  unfreezeCommands: [
    { id: 'command-1', amount: 50_000, status: 'PENDING_APPROVAL' } as never
  ]
})

describe('FreezeStatusCell', () => {
  it('không còn ghép trạng thái chờ duyệt từ lệnh maker-checker cũ', () => {
    render(<FreezeStatusCell item={pendingFreeze} />)
    expect(screen.getByText('Đang đóng băng')).toBeInTheDocument()
  })

  it('hiện nhãn theo displayStatus khi không có lệnh chờ duyệt', () => {
    render(
      <FreezeStatusCell
        item={freeze({ displayStatus: 'PARTIALLY_RELEASED' })}
      />
    )
    expect(screen.getByText('Đã mở băng một phần')).toBeInTheDocument()
  })
})

describe('FreezeAmountCell', () => {
  it('chỉ hiện một dòng khi lệnh chưa giải tỏa và không thiếu tiền', () => {
    render(<FreezeAmountCell item={freeze()} />)
    expect(screen.getByText('50.000 VNĐ')).toBeInTheDocument()
    expect(screen.queryByText(/Đã mở băng/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Còn thiếu/)).not.toBeInTheDocument()
  })

  it('không giấu phần Đã mở băng, phần còn thiếu và số lần bù', () => {
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
    expect(screen.getByText('80.000 VNĐ')).toBeInTheDocument()
    expect(screen.getByText(/Đã mở băng/)).toHaveTextContent('20.000 VNĐ')
    expect(screen.getByText(/Còn thiếu/)).toHaveTextContent('15.000 VNĐ')
    expect(screen.getByText('Đã bù 2 lần')).toBeInTheDocument()
  })
})

describe('FreezeRowActions', () => {
  it('bản ghi đang đóng băng thì cho mở băng trực tiếp', async () => {
    const onRequestUnfreeze = vi.fn()
    render(
      <FreezeRowActions
        item={freeze()}
        onRequestUnfreeze={onRequestUnfreeze}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Mở băng' }))
    expect(onRequestUnfreeze).toHaveBeenCalledWith(freeze())
  })

  it('hiện Mở băng cho phần còn lại sau các lệnh đã thực thi và một lệnh bị từ chối', () => {
    render(
      <FreezeRowActions
        item={freeze({
          amount: 145_000,
          requestedAmount: 145_000,
          releasedAmount: 115_000,
          remainingAmount: 30_000,
          totalHeldAmount: 30_000,
          totalReleasedAmount: 115_000,
          displayStatus: 'PARTIALLY_RELEASED',
          unfreezeCommandId: 'rejected-command',
          unfreezeCommandStatus: 'REJECTED',
          unfreezeCommands: [
            { id: 'c1', amount: 85_000, status: 'EXECUTED' } as never,
            { id: 'c2', amount: 30_000, status: 'EXECUTED' } as never,
            {
              id: 'rejected-command',
              amount: 30_000,
              status: 'REJECTED'
            } as never
          ]
        })}
      />
    )

    expect(screen.getByRole('button', { name: 'Mở băng' })).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Duyệt' })
    ).not.toBeInTheDocument()
  })

  it('bản ghi đã kết thúc thì không còn hành động nào', () => {
    render(<FreezeRowActions item={freeze({ status: 'RELEASED' })} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('không kiểm tra maker-checker kể cả response cũ còn lệnh pending', async () => {
    const onRequestUnfreeze = vi.fn()
    render(
      <FreezeRowActions
        item={pendingFreeze}
        onRequestUnfreeze={onRequestUnfreeze}
      />
    )

    await userEvent.click(screen.getByRole('button', { name: 'Mở băng' }))
    expect(onRequestUnfreeze).toHaveBeenCalledWith(pendingFreeze)
    expect(
      screen.queryByRole('button', { name: 'Duyệt' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Từ chối' })
    ).not.toBeInTheDocument()
  })
})
