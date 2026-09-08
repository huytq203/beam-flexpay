import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/render'
import { ReasonDialog } from '../ReasonDialog'

const renderDialog = (onConfirm = vi.fn()) => {
  const user = userEvent.setup()
  const onCancel = vi.fn()

  renderWithProviders(
    <ReasonDialog
      open
      title='Kích hoạt chính sách phí'
      label='Lý do kích hoạt'
      okText='Kích hoạt'
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )

  return { user, onConfirm, onCancel }
}

describe('ReasonDialog', () => {
  it('khóa nút xác nhận khi chưa nhập lý do', () => {
    const { onConfirm } = renderDialog()

    expect(screen.getByRole('button', { name: 'Kích hoạt' })).toBeDisabled()
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('trả lý do đã cắt khoảng trắng cho onConfirm', async () => {
    const { user, onConfirm } = renderDialog()

    await user.type(
      screen.getByLabelText(/Lý do kích hoạt/),
      '  Áp dụng biểu phí quý 4  '
    )
    await user.click(screen.getByRole('button', { name: 'Kích hoạt' }))

    expect(onConfirm).toHaveBeenCalledWith('Áp dụng biểu phí quý 4')
  })

  it('đóng modal khi bấm hủy bỏ', async () => {
    const { user, onCancel } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Hủy bỏ' }))

    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
