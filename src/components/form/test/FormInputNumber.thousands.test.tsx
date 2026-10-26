import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm, useWatch } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { FormInputNumber } from '../FormInputNumber'

interface Values {
  amount?: number
}

const Harness = ({ thousandSeparator }: { thousandSeparator?: boolean }) => {
  const { control } = useForm<Values>()
  const amount = useWatch({ control, name: 'amount' })
  return (
    <>
      <FormInputNumber
        allowEmpty
        control={control}
        label='Số tiền'
        name='amount'
        thousandSeparator={thousandSeparator}
      />
      <output data-testid='value'>{typeof amount}:{String(amount)}</output>
    </>
  )
}

describe('FormInputNumber — dấu phẩy phân cách hàng nghìn', () => {
  it('hiển thị dấu phẩy nhưng giá trị trong form vẫn là số', async () => {
    const user = userEvent.setup()
    render(<Harness thousandSeparator />)
    await user.type(screen.getByLabelText('Số tiền'), '222222222')
    expect(screen.getByLabelText('Số tiền')).toHaveValue('222.222.222')
    expect(screen.getByTestId('value')).toHaveTextContent('number:222222222')
  })

  it('không bật thì giữ nguyên cách hiển thị cũ', async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.type(screen.getByLabelText('Số tiền'), '222222')
    expect(screen.getByLabelText('Số tiền')).toHaveValue('222222')
  })
})
