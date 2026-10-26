import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import EwalletManagement from '../EwalletManagement'

const ROUTE = SCREENS.EWALLET_MANAGEMENT.path
const PHONE = '0912345678'

const requests: URLSearchParams[] = []

const mockAccounts = () =>
  server.use(
    http.get('*/wallet/accounts', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json({ data: { content: [], totalElements: 0 } })
    })
  )

const LocationProbe = () => (
  <span data-testid='search'>{useLocation().search}</span>
)

const renderAt = (route: string = ROUTE) =>
  renderWithProviders(
    <>
      <EwalletManagement />
      <LocationProbe />
    </>,
    { route }
  )

const lastRequest = (): URLSearchParams => requests[requests.length - 1]

afterEach(() => {
  sessionStorage.clear()
  requests.length = 0
})

describe('EwalletManagement — giữ bộ lọc khi quay lại từ màn chi tiết', () => {
  it('khôi phục bộ lọc + trang từ bản sao, SĐT không lên URL', async () => {
    mockAccounts()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({
        query: 'ownerId=OWN-1&fromDate=2026-10-01T08%3A00%3A00.000&page=2',
        sensitive: { keyword: PHONE }
      })
    )

    renderAt()

    expect(
      await screen.findByPlaceholderText('Tìm kiếm số điện thoại, mã ví...')
    ).toHaveValue(PHONE)
    expect(screen.getByDisplayValue('01/10/2026 08:00:00')).toBeInTheDocument()
    expect(lastRequest().get('page')).toBe('2')
    expect(lastRequest().get('keyword')).toBe(PHONE)
    expect(lastRequest().get('ownerId')).toBe('OWN-1')
    expect(lastRequest().get('fromDate')).toBe('2026-10-01T08:00:00.000')
    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent('page=2')
    )
    expect(screen.getByTestId('search')).not.toHaveTextContent(PHONE)
  })

  it('Tìm kiếm về trang 1, Xóa bộ lọc xoá bộ lọc và bản sao', async () => {
    mockAccounts()
    renderAt(`${ROUTE}?page=3`)
    const phone = await screen.findByPlaceholderText(
      'Tìm kiếm số điện thoại, mã ví...'
    )
    expect(lastRequest().get('page')).toBe('3')

    fireEvent.change(phone, { target: { value: PHONE } })
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await waitFor(() => {
      expect(lastRequest().get('keyword')).toBe(PHONE)
      expect(lastRequest().get('page')).toBe('1')
    })
    expect(screen.getByTestId('search')).not.toHaveTextContent(PHONE)

    fireEvent.click(screen.getByRole('button', { name: /Xóa bộ lọc/ }))
    await waitFor(() => expect(lastRequest().has('keyword')).toBe(false))
    expect(
      screen.getByPlaceholderText('Tìm kiếm số điện thoại, mã ví...')
    ).toHaveValue('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })

  it('frozen trên URL được gửi nguyên cho lưới; không chọn thì không gửi', async () => {
    mockAccounts()
    renderAt(`${ROUTE}?frozen=false&status=ACTIVE`)
    await waitFor(() => expect(lastRequest().get('frozen')).toBe('false'))
    expect(lastRequest().get('status')).toBe('ACTIVE')

    fireEvent.click(screen.getByRole('button', { name: /Xóa bộ lọc/ }))
    await waitFor(() => expect(lastRequest().has('frozen')).toBe(false))
  })
})
