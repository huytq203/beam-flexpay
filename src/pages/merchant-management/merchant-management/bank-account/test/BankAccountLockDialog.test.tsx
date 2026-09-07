import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { BankAccountLockDialog } from '../components/BankAccountLockDialog'
import { MOCK_BANK_ACCOUNTS } from '../constants/bank-account.constant'

const row = MOCK_BANK_ACCOUNTS[0]

const renderDialog = (mode: 'lock' | 'unlock' = 'lock') => {
  const onConfirmed = vi.fn()
  renderWithProviders(
    <BankAccountLockDialog
      open
      mode={mode}
      row={row}
      onConfirmed={onConfirmed}
      onCancel={vi.fn()}
    />
  )
  return onConfirmed
}

describe('BankAccountLockDialog', () => {
  it('luôn che số tài khoản trong phần tóm tắt', () => {
    renderDialog()

    expect(screen.getByText(/••••4821 · Master/)).toBeInTheDocument()
    expect(screen.queryByText(row.accountNumber)).toBeNull()
    expect(
      screen.queryByRole('button', { name: /Xem đầy đủ số tài khoản/ })
    ).toBeNull()
  })

  it('chặn xác nhận khi lý do dưới 10 ký tự', async () => {
    const user = userEvent.setup()
    const onConfirmed = renderDialog()

    await user.type(screen.getByLabelText(/Lý do khóa/), 'sai tk')
    await user.click(screen.getByRole('button', { name: 'Khóa tài khoản' }))

    expect(
      await screen.findByText('Lý do tối thiểu 10 ký tự')
    ).toBeInTheDocument()
    expect(onConfirmed).not.toHaveBeenCalled()
  })

  it('xác nhận khi lý do đủ dài', async () => {
    const user = userEvent.setup()
    const onConfirmed = renderDialog()

    await user.type(
      screen.getByLabelText(/Lý do khóa/),
      'Sai thông tin thụ hưởng, chờ merchant xác minh lại'
    )
    await user.click(screen.getByRole('button', { name: 'Khóa tài khoản' }))

    expect(onConfirmed).toHaveBeenCalledTimes(1)
  })

  it('đổi nhãn sang mở khóa ở chế độ unlock', () => {
    renderDialog('unlock')

    expect(
      screen.getByRole('dialog', { name: /Xác nhận mở khóa tài khoản ngân hàng/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Mở khóa tài khoản' })
    ).toBeInTheDocument()
  })
})
