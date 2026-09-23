import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { FeeServiceTypeTabs } from '../FeeServiceTypeTabs'

const LABELS = {
  EWALLET_DEPOSIT: 'Nạp tiền ví',
  EWALLET_WITHDRAWAL: 'Rút tiền ví',
  EWALLET_TRANSFER_INTERNAL: 'Chuyển tiền nội bộ'
}

const KEYS = ['keyword', 'serviceType', 'direction'] as const

const Harness = () => {
  const { filters, applyFilters } = useUrlFilters({ keys: KEYS })
  const location = useLocation()

  return (
    <>
      <span data-testid='search'>{location.search}</span>
      <FeeServiceTypeTabs
        serviceType={filters.serviceType}
        onChange={(serviceType) =>
          applyFilters({
            keyword: filters.keyword ?? null,
            serviceType: serviceType ?? null,
            direction: null
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

describe('đồng bộ loại giao dịch lên URL', () => {
  it('chỉ ghi loại giao dịch, không ghi chiều tiền', async () => {
    renderAt('/fee')

    await userEvent.click(screen.getByText('Rút tiền ví'))

    const params = new URLSearchParams(search())
    expect(params.get('serviceType')).toBe('EWALLET_WITHDRAWAL')
    expect(params.get('direction')).toBeNull()
  })

  it('dọn tham số chiều tiền cũ khi người dùng đổi loại giao dịch', async () => {
    renderAt('/fee?direction=OUT&serviceType=EWALLET_WITHDRAWAL')

    await userEvent.click(screen.getByText('Nạp tiền ví'))

    const params = new URLSearchParams(search())
    expect(params.get('serviceType')).toBe('EWALLET_DEPOSIT')
    expect(params.get('direction')).toBeNull()
  })

  it('giữ nguyên bộ lọc khác khi đổi loại giao dịch', async () => {
    renderAt('/fee?keyword=rut')

    await userEvent.click(screen.getByText('Rút tiền ví'))

    expect(new URLSearchParams(search()).get('keyword')).toBe('rut')
  })
})
