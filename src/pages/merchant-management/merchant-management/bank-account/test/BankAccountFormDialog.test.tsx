import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '@/test/render'

import { BankAccountFormDialog } from '../components/BankAccountFormDialog'

const renderDialog = (onSaved = vi.fn()) => {
  renderWithProviders(
    <BankAccountFormDialog
      open
      mode='create'
      row={null}
      onSaved={onSaved}
      onCancel={vi.fn()}
    />
  )
  return onSaved
}

describe('BankAccountFormDialog', () => {
  it('khóa chọn chu kỳ khi hình thức rút là thủ công', () => {
    renderDialog()

    expect(
      screen.getByRole('radio', { name: /Thủ công/ })
    ).toBeChecked()
    expect(screen.getByLabelText(/Chu kỳ rút tự động/)).toBeDisabled()
  })

  it('mở chọn chu kỳ khi chuyển sang rút tự động', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(screen.getByRole('radio', { name: /Tự động theo chu kỳ/ }))

    expect(screen.getByLabelText(/Chu kỳ rút tự động/)).toBeEnabled()
  })

  it('báo lỗi và không lưu khi thiếu số tài khoản', async () => {
    const user = userEvent.setup()
    const onSaved = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Thêm mới' }))

    expect(
      await screen.findByText('Số tài khoản gồm 6–20 chữ số')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Vui lòng chọn Master Merchant')
    ).toBeInTheDocument()
    expect(onSaved).not.toHaveBeenCalled()
  })

  it('viết hoa tên chủ tài khoản khi người dùng nhập', async () => {
    const user = userEvent.setup()
    renderDialog()

    const input = screen.getByLabelText(/Tên chủ tài khoản/)
    await user.type(input, 'nguyen van hai')

    expect(input).toHaveValue('NGUYEN VAN HAI')
  })

  it('nhắc yêu cầu xác thực nhạy cảm và audit log', () => {
    renderDialog()

    expect(
      screen.getByText(/xác thực nhạy cảm \(OTP hoặc mật khẩu\)/)
    ).toBeInTheDocument()
    expect(screen.getByText(/maker–checker/)).toBeInTheDocument()
  })
})
