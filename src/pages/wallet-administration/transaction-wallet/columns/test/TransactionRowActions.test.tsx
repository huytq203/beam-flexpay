import { renderWithProviders } from '@/test/render'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TransactionRowActions } from '../TransactionRowActions'

const renderActions = (
  record: Partial<UnifiedContentJournal>,
  permissions: string[] = ['EWALLET:EWALLET:FULL']
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return renderWithProviders(
    <MessageProvider>
      <TransactionRowActions
        record={
          {
            transactionCode: 'FW26QG8C8',
            transactionType: 'CASH_OUT',
            status: 'PENDING',
            ...record
          } as UnifiedContentJournal
        }
        canFreeze
        canRefund
        onFreeze={vi.fn()}
        onRefund={vi.fn()}
        isFreezeBusy={false}
      />
    </MessageProvider>,
    { store }
  )
}

describe('TransactionRowActions — lệnh rút chờ duyệt', () => {
  it('hiện nút Phê duyệt, bấm mở popover Duyệt / Từ chối', async () => {
    const user = userEvent.setup()
    renderActions({ displayStatus: 'PENDING_APPROVAL' })

    await user.click(screen.getByRole('button', { name: /Phê duyệt lệnh rút/ }))

    expect(
      await screen.findByRole('button', { name: 'Duyệt' })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument()
  })

  it('không hiện nút khi thiếu quyền EWALLET:FULL', () => {
    renderActions({ displayStatus: 'PENDING_APPROVAL' }, [])

    expect(
      screen.queryByRole('button', { name: /Phê duyệt lệnh rút/ })
    ).not.toBeInTheDocument()
  })

  it('không hiện nút với lệnh rút chưa chờ duyệt hoặc giao dịch loại khác', () => {
    renderActions({ displayStatus: 'FAILED' })
    renderActions({
      transactionType: 'P2P_TRANSFER',
      displayStatus: 'PENDING_APPROVAL'
    })

    expect(
      screen.queryByRole('button', { name: /Phê duyệt lệnh rút/ })
    ).not.toBeInTheDocument()
  })
})
