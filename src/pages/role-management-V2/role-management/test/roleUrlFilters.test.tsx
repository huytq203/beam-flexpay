import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { RoleManagement } from '../RoleManagement'

const ROUTE = SCREENS.ROLE_MANAGEMENT.path

const requests: URLSearchParams[] = []

const role = (name: string) => ({
  id: name,
  name,
  description: name,
  createdAt: '2026-08-10 14:30:00'
})

const mockSearch = () =>
  server.use(
    http.get('*/roles/search', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json({
        data: {
          content: [role('ACCOUNTANT'), role('OPERATOR')],
          totalElements: 2
        }
      })
    })
  )

const LocationProbe = () => (
  <span data-testid='search'>{useLocation().search}</span>
)

const renderAt = (route: string = ROUTE) =>
  renderWithProviders(
    <>
      <RoleManagement />
      <LocationProbe />
    </>,
    { route }
  )

const lastRequest = (): URLSearchParams => requests[requests.length - 1]

afterEach(() => {
  sessionStorage.clear()
  requests.length = 0
})

describe('RoleManagement — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục nhóm quyền đã chọn + trang từ bản sao', async () => {
    mockSearch()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'keyword=ACCOUNTANT&page=2', sensitive: {} })
    )

    renderAt()

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(lastRequest().get('keyword')).toBe('ACCOUNTANT')
    expect(lastRequest().get('page')).toBe('2')
    expect(await screen.findByTitle('Tài khoản kế toán')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent(
        '?keyword=ACCOUNTANT&page=2'
      )
    )
  })

  it('Tìm kiếm về trang 1, Xóa lọc xoá bộ lọc và bản sao', async () => {
    mockSearch()
    renderAt(`${ROUTE}?page=3`)
    await waitFor(() => expect(lastRequest()?.get('page')).toBe('3'))

    await userEvent.click(
      await screen.findByLabelText('Tìm kiếm tên nhóm quyền')
    )
    await userEvent.click(await screen.findByTitle('Tài khoản tổ chức'))
    fireEvent.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => {
      expect(lastRequest().get('keyword')).toBe('OPERATOR')
      expect(lastRequest().get('page')).toBe('1')
    })

    fireEvent.click(screen.getByRole('button', { name: 'Xóa lọc' }))
    await waitFor(() => expect(lastRequest().get('keyword')).toBe(''))
    // Option trong dropdown vẫn nằm trong DOM; chỉ ô đã chọn là không có aria-selected.
    const selected = screen
      .queryAllByTitle('Tài khoản tổ chức')
      .filter((element) => !element.hasAttribute('aria-selected'))
    expect(selected).toHaveLength(0)
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })
})
