import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import PermissionManagement from '../PermissionManagement'

const ROUTE = SCREENS.PERMISSION_MANAGEMENT.path
const INPUT = { name: 'Tìm kiếm quyền' }

const requests: URLSearchParams[] = []

const mockSearch = () =>
  server.use(
    http.get('*/permissions/search', ({ request }) => {
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
      <PermissionManagement />
      <LocationProbe />
    </>,
    { route }
  )

const lastRequest = (): URLSearchParams => requests[requests.length - 1]

afterEach(() => {
  sessionStorage.clear()
  requests.length = 0
})

describe('PermissionManagement — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục từ khoá + trang từ bản sao và ghi lại lên URL', async () => {
    mockSearch()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'keyword=USER%3AVIEW&page=2', sensitive: {} })
    )

    renderAt()

    expect(screen.getByRole('textbox', INPUT)).toHaveValue('USER:VIEW')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(lastRequest().get('keyword')).toBe('USER:VIEW')
    expect(lastRequest().get('page')).toBe('2')
    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent(
        '?keyword=USER%3AVIEW&page=2'
      )
    )
  })

  it('Tìm kiếm về trang 1, Xóa lọc xoá bộ lọc và bản sao', async () => {
    mockSearch()
    renderAt(`${ROUTE}?page=3`)
    await waitFor(() => expect(lastRequest()?.get('page')).toBe('3'))

    fireEvent.change(screen.getByRole('textbox', INPUT), {
      target: { value: ' EWALLET ' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => {
      expect(lastRequest().get('keyword')).toBe('EWALLET')
      expect(lastRequest().get('page')).toBe('1')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Xóa lọc' }))
    await waitFor(() => expect(lastRequest().get('keyword')).toBe(''))
    expect(screen.getByRole('textbox', INPUT)).toHaveValue('')
    expect(screen.getByTestId('search')).toHaveTextContent('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })
})
