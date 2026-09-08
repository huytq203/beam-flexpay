import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeeDirection } from '@utils/fee-direction'
import { FeeServiceTypeTabs } from '../FeeServiceTypeTabs'

const LABELS = {
  EWALLET_DEPOSIT: 'Nạp tiền ví',
  EWALLET_WITHDRAWAL: 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL: 'Chuyển tiền nội bộ',
  EWALLET_TRANSFER_EXTERNAL: 'Chuyển tiền liên ngân hàng',
  EWALLET_CASHBACK: 'Hoàn tiền',
  MERCHANT_VA_BILL_COLLECTION: 'Thu hộ VA',
  PAYOUT_BANK_TRANSFER: 'Chi hộ chuyển khoản ngân hàng'
}

const setup = (
  props: Partial<React.ComponentProps<typeof FeeServiceTypeTabs>> = {}
) => {
  const onChange = vi.fn()
  render(
    <FeeServiceTypeTabs
      direction={null}
      serviceType={undefined}
      onChange={onChange}
      labels={LABELS}
      {...props}
    />
  )
  return { onChange }
}

describe('FeeServiceTypeTabs', () => {
  it('mỗi tương tác chỉ phát ra MỘT thay đổi, kèm đủ cả hai giá trị', async () => {
    // Gọi hai lần sẽ khiến hai lần ghi useSearchParams đè lên nhau và mất
    // direction — đúng lỗi "phải click 2 lần".
    const { onChange } = setup()

    await userEvent.click(screen.getByText('Đầu ra'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({
      direction: FeeDirection.OUT,
      serviceType: 'EWALLET_WITHDRAWAL'
    })
  })

  it('bấm "Tất cả" xoá cả chiều lẫn loại dịch vụ trong một lần', async () => {
    const { onChange } = setup({
      direction: FeeDirection.OUT,
      serviceType: 'EWALLET_WITHDRAWAL'
    })

    await userEvent.click(screen.getByText('Tất cả'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({
      direction: null,
      serviceType: undefined
    })
  })

  it('chọn một loại cụ thể vẫn giữ nguyên chiều đang xem', async () => {
    const { onChange } = setup({
      direction: FeeDirection.OUT,
      serviceType: 'EWALLET_WITHDRAWAL'
    })

    await userEvent.click(screen.getByText('Chi hộ chuyển khoản ngân hàng'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith({
      direction: FeeDirection.OUT,
      serviceType: 'PAYOUT_BANK_TRANSFER'
    })
  })

  it('chỉ bày loại dịch vụ thuộc chiều đang chọn', () => {
    setup({ direction: FeeDirection.OUT, serviceType: 'EWALLET_WITHDRAWAL' })

    expect(screen.getByText('Rút tiền ví')).toBeInTheDocument()
    expect(screen.getByText('Chi hộ chuyển khoản ngân hàng')).toBeInTheDocument()
    expect(screen.queryByText('Nạp tiền ví')).not.toBeInTheDocument()
  })

  it('không có "Tất cả trong chiều này" khi API chưa lọc được nhiều loại', () => {
    setup({ direction: FeeDirection.OUT, serviceType: 'EWALLET_WITHDRAWAL' })
    expect(screen.queryByText('Tất cả trong chiều này')).not.toBeInTheDocument()
  })

  it('mở "Tất cả trong chiều này" khi API đã lọc được nhiều loại', async () => {
    const { onChange } = setup({
      direction: FeeDirection.OUT,
      supportsMultiServiceType: true
    })

    await userEvent.click(screen.getByText('Đầu vào'))

    expect(screen.getByText('Tất cả trong chiều này')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith({
      direction: FeeDirection.IN,
      serviceType: undefined
    })
  })

  it('giữ nguyên loại đang chọn nếu nó vẫn thuộc chiều mới', async () => {
    const { onChange } = setup({
      direction: null,
      serviceType: 'PAYOUT_BANK_TRANSFER'
    })

    await userEvent.click(screen.getByText('Đầu ra'))

    expect(onChange).toHaveBeenCalledWith({
      direction: FeeDirection.OUT,
      serviceType: 'PAYOUT_BANK_TRANSFER'
    })
  })

  it('đánh dấu chip đang chọn cho trình đọc màn hình', () => {
    setup({ direction: FeeDirection.OUT, serviceType: 'PAYOUT_BANK_TRANSFER' })

    expect(
      screen.getByRole('button', { name: 'Chi hộ chuyển khoản ngân hàng' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Rút tiền ví' })
    ).toHaveAttribute('aria-pressed', 'false')
  })
})
