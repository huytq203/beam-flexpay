import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeeServiceTypeTabs } from '../FeeServiceTypeTabs'

const LABELS = {
  EWALLET_DEPOSIT: 'Nạp tiền ví',
  EWALLET_WITHDRAWAL: 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL: 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL: 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK: 'Hoàn tiền (cashback)',
  MERCHANT_VA_BILL_COLLECTION: 'Thu hộ VA',
  PAYOUT_BANK_TRANSFER: 'Chi hộ chuyển khoản ngân hàng'
}

const setup = (serviceType?: string) => {
  const onChange = vi.fn()
  render(
    <FeeServiceTypeTabs
      serviceType={serviceType}
      onChange={onChange}
      labels={LABELS}
    />
  )
  return { onChange }
}

describe('FeeServiceTypeTabs', () => {
  it('gộp loại giao dịch của mọi chiều trong cùng một bộ lọc', () => {
    setup()

    expect(screen.queryByText('Chiều tiền')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Đầu vào' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Đầu ra' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('Nạp tiền ví')).toBeInTheDocument()
    expect(screen.getByText('Rút tiền ví')).toBeInTheDocument()
    expect(screen.getByText('Chuyển tiền nội bộ')).toBeInTheDocument()
  })

  it('lọc trực tiếp bằng loại giao dịch đã chọn', async () => {
    const { onChange } = setup()

    await userEvent.click(screen.getByText('Rút tiền ví'))

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('EWALLET_WITHDRAWAL')
  })

  it('bấm Tất cả sẽ bỏ lọc loại giao dịch', async () => {
    const { onChange } = setup('EWALLET_WITHDRAWAL')

    await userEvent.click(screen.getByText('Tất cả'))

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith(undefined)
  })

  it('đánh dấu chip đang chọn cho trình đọc màn hình', () => {
    setup('PAYOUT_BANK_TRANSFER')

    expect(
      screen.getByRole('button', { name: /Chi hộ chuyển khoản ngân hàng/ })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Rút tiền ví/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })
})
