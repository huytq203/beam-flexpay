import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { isFeeDirection } from '@utils/fee-direction'
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

const KEYS = ['keyword', 'serviceType', 'direction'] as const

const Harness = () => {
  const { filters, applyFilters } = useUrlFilters({ keys: KEYS })
  const location = useLocation()
  const direction = isFeeDirection(filters.direction) ? filters.direction : null

  return (
    <>
      <span data-testid='search'>{location.search}</span>
      <FeeServiceTypeTabs
        direction={direction}
        serviceType={filters.serviceType}
        onChange={(next) =>
          applyFilters({
            ...filters,
            direction: next.direction,
            serviceType: next.serviceType ?? null
          })
        }
        labels={LABELS}
      />
    </>
  )
}

const renderAt = (route: string) =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Harness />
    </MemoryRouter>
  )

const search = () => screen.getByTestId('search').textContent ?? ''

describe('đồng bộ phạm vi phí lên URL', () => {
  it('một click ghi được CẢ chiều tiền lẫn loại dịch vụ', async () => {
    renderAt('/fee')

    await userEvent.click(screen.getByText('Đầu ra'))

    const params = new URLSearchParams(search())
    expect(params.get('direction')).toBe('OUT')
    expect(params.get('serviceType')).toBe('EWALLET_WITHDRAWAL')
  })

  it('không cần click lần hai — bảng lọc ngay từ lần đầu', async () => {
    renderAt('/fee')

    await userEvent.click(screen.getByText('Đầu vào'))

    expect(new URLSearchParams(search()).get('serviceType')).toBe(
      'EWALLET_DEPOSIT'
    )
  })

  it('bấm "Tất cả" dọn sạch cả hai, không để sót chiều cũ', async () => {
    renderAt('/fee?direction=OUT&serviceType=EWALLET_WITHDRAWAL')

    await userEvent.click(screen.getByText('Tất cả'))

    const params = new URLSearchParams(search())
    expect(params.get('direction')).toBeNull()
    expect(params.get('serviceType')).toBeNull()
  })

  it('đổi chiều liên tiếp luôn khớp chiều với loại dịch vụ', async () => {
    renderAt('/fee')

    await userEvent.click(screen.getByText('Đầu ra'))
    await userEvent.click(screen.getByText('Nội bộ'))

    const params = new URLSearchParams(search())
    expect(params.get('direction')).toBe('INTERNAL')
    expect(params.get('serviceType')).toBe('EWALLET_TRANSFER_INTERNAL')
  })

  it('giữ nguyên bộ lọc khác khi đổi phạm vi', async () => {
    renderAt('/fee?keyword=rut')

    await userEvent.click(screen.getByText('Đầu ra'))

    expect(new URLSearchParams(search()).get('keyword')).toBe('rut')
  })
})
