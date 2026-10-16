import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import ConfirmEKYC from '../ConfirmEKYC'

const ROUTE = SCREENS.CONFIRM_EKYC.path

const requests: URLSearchParams[] = []

const mockSearch = () =>
  server.use(
    http.get('*/verified-kyc-profiles/search', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json({
        success: true,
        data: { content: [], totalElements: 0 }
      })
    })
  )

const LocationProbe = () => (
  <span data-testid='search'>{useLocation().search}</span>
)

const renderAt = (route: string = ROUTE) =>
  renderWithProviders(
    <>
      <ConfirmEKYC />
      <LocationProbe />
    </>,
    { route }
  )

const lastRequest = (): URLSearchParams => requests[requests.length - 1]

afterEach(() => {
  sessionStorage.clear()
  requests.length = 0
})

describe('ConfirmEKYC — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc + trang từ bản sao, từ khoá không lên URL', async () => {
    mockSearch()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({
        query:
          'latestStatus=PENDING_REVIEW&profileStatus=UNVERIFIED' +
          '&createdFrom=2026-10-01+08%3A00%3A00&page=2',
        sensitive: { keyword: '0912345678' }
      })
    )

    renderAt()

    expect(screen.getByPlaceholderText('Nhập từ khóa ...')).toHaveValue(
      '0912345678'
    )
    expect(screen.getByTitle('Chờ duyệt thủ công')).toBeInTheDocument()
    expect(screen.getByTitle('Chưa xác thực')).toBeInTheDocument()
    expect(screen.getByDisplayValue('01/10/2026 08:00:00')).toBeInTheDocument()
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(lastRequest().get('page')).toBe('2')
    expect(lastRequest().get('keyword')).toBe('0912345678')
    expect(lastRequest().get('latestStatus')).toBe('PENDING_REVIEW')
    expect(lastRequest().get('hasProfile')).toBe('false')
    expect(lastRequest().has('profileStatus')).toBe(false)
    expect(lastRequest().get('createdFrom')).toBe('2026-10-01 08:00:00')
    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent('page=2')
    )
    expect(screen.getByTestId('search')).not.toHaveTextContent('0912345678')
  })

  it('Tìm kiếm về trang 1 mang từ khoá, Đặt lại xoá bộ lọc và bản sao', async () => {
    mockSearch()
    renderAt(`${ROUTE}?page=3`)
    await waitFor(() => expect(lastRequest()?.get('page')).toBe('3'))

    fireEvent.change(screen.getByPlaceholderText('Nhập từ khóa ...'), {
      target: { value: 'Nguyen' }
    })
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await waitFor(() => {
      expect(lastRequest().get('keyword')).toBe('Nguyen')
      expect(lastRequest().get('page')).toBe('1')
    })

    fireEvent.click(screen.getByRole('button', { name: /Đặt lại/ }))
    await waitFor(() => expect(lastRequest().has('keyword')).toBe(false))
    expect(screen.getByPlaceholderText('Nhập từ khóa ...')).toHaveValue('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })
})
