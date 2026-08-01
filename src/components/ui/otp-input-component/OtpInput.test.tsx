import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OtpInput } from './OtpInput'

const ControlledOtp = ({ onComplete }: { onComplete: (otp: string) => void }) => {
  const [value, setValue] = useState('')
  return (
    <OtpInput
      value={value}
      onChange={setValue}
      onComplete={onComplete}
    />
  )
}

describe('OtpInput', () => {
  it('chỉ nhận số và báo hoàn tất đúng một lần', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ControlledOtp onComplete={onComplete} />)
    const input = screen.getByLabelText('Mã xác thực')

    await user.type(input, '12a3456')

    expect(input).toHaveValue('123456')
    expect(onComplete).toHaveBeenCalledOnce()
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('paste chuỗi có khoảng trắng và dấu gạch thành sáu số', () => {
    const onComplete = vi.fn()
    render(<ControlledOtp onComplete={onComplete} />)
    const input = screen.getByLabelText('Mã xác thực')

    fireEvent.paste(input, {
      clipboardData: { getData: () => '12 34-56' }
    })

    expect(input).toHaveValue('123456')
    expect(onComplete).toHaveBeenCalledWith('123456')
  })

  it('backspace xóa số tự nhiên', async () => {
    const user = userEvent.setup()
    render(<ControlledOtp onComplete={() => {}} />)
    const input = screen.getByLabelText('Mã xác thực')

    await user.type(input, '123')
    await user.type(input, '{Backspace}')

    expect(input).toHaveValue('12')
  })

  it('không auto-submit lại cùng một mã sau khi sửa', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<ControlledOtp onComplete={onComplete} />)
    const input = screen.getByLabelText('Mã xác thực')

    await user.type(input, '123456')
    await user.type(input, '{Backspace}6')

    expect(onComplete).toHaveBeenCalledOnce()
  })
})
