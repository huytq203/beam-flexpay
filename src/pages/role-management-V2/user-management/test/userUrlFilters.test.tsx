import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import UserManagement from '../UserManagement'

const ROUTE = SCREENS.USER_ACCOUNT.path
const EMAIL = 'nguyen.van.a@flexpay.vn'

const requests: URLSearchParams[] = []

const emptyPage = () =>
  HttpResponse.json({ data: { content: [], totalElements: 0 } })

const mockApis = () =>
  server.use(
    http.get('*/users/managers', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return emptyPage()
    }),
    http.get('*/roles', emptyPage)
  )

const LocationProbe = () => (
  <span data-testid='search'>{useLocation().search}</span>
)

const renderAt = (route: string = ROUTE) =>
  renderWithProviders(
    <>
      <UserManagement />
      <LocationProbe />
    </>,
    { route }
  )

const lastRequest = (): URLSearchParams => requests[requests.length - 1]

afterEach(() => {
  sessionStorage.clear()
  requests.length = 0
})

describe('UserManagement — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc + trang từ bản sao, từ khoá (có thể là email) không lên URL', async () => {
    mockApis()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({
        query: 'emailVerified=true&status=false&page=2',
        sensitive: { keyword: EMAIL }
      })
    )

    renderAt()

    expect(await screen.findByLabelText('Từ khóa')).toHaveValue(EMAIL)
    expect(screen.getByTitle('Đã xác thực')).toBeInTheDocument()
    expect(lastRequest().get('page')).toBe('2')
    expect(lastRequest().get('keyword')).toBe(EMAIL)
    expect(lastRequest().get('emailVerified')).toBe('true')
    expect(lastRequest().get('status')).toBe('false')
    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent('page=2')
    )
    expect(screen.getByTestId('search')).not.toHaveTextContent('flexpay')
  })

  it('Tìm kiếm về trang 1, Xóa lọc xoá bộ lọc và bản sao', async () => {
    mockApis()
    renderAt(`${ROUTE}?page=3`)
    const keyword = await screen.findByLabelText('Từ khóa')
    expect(lastRequest().get('page')).toBe('3')

    fireEvent.change(keyword, { target: { value: ' nguyen ' } })
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await waitFor(() => {
      expect(lastRequest().get('keyword')).toBe('nguyen')
      expect(lastRequest().get('page')).toBe('1')
    })
    expect(screen.getByTestId('search')).not.toHaveTextContent('nguyen')

    fireEvent.click(screen.getByRole('button', { name: /Xóa lọc/ }))
    await waitFor(() => expect(lastRequest().has('keyword')).toBe(false))
    expect(screen.getByLabelText('Từ khóa')).toHaveValue('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })
})
