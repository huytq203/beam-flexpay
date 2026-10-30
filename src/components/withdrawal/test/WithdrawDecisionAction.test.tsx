import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { WithdrawDecisionAction } from '../WithdrawDecisionAction'

const renderAction = (permissions: string[], transactionType?: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  render(
    <Provider store={store}>
      <MessageProvider>
        <WithdrawDecisionAction
          transactionCode='FW266C1SS'
          transactionType={transactionType}
        />
      </MessageProvider>
    </Provider>
  )
  return userEvent.setup({ delay: null })
}

/** Nút duyệt ở cột thao tác của màn Lịch sử rút tiền (Bước 3): lệnh chi hoàn duyệt chi ngay trên dòng. */
describe('WithdrawDecisionAction — lệnh chi hoàn tiền', () => {
  it('kế toán chỉ có PAYOUT:APPROVE thấy nút và lựa chọn "Duyệt chi"', async () => {
    const user = renderAction(['EWALLET:PAYOUT:APPROVE'], 'REFUND_BANK_PAYOUT')
    await user.click(
      screen.getByRole('button', { name: /Phê duyệt lệnh rút FW266C1SS/ })
    )
    expect(
      await screen.findByRole('button', { name: 'Duyệt chi' })
    ).toBeInTheDocument()
  })

  it('PAYOUT:APPROVE không thấy nút duyệt của lệnh rút thường', () => {
    renderAction(['EWALLET:PAYOUT:APPROVE'], 'CASH_OUT')
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
