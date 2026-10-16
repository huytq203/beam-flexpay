import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import NotificationPage from '../pages/NotificationPage'

const ROUTE = '/secure-panel/merchant/notification'
const requests: URL[] = []

beforeEach(() => {
  requests.length = 0
  server.use(
    http.get('*/merchants/notifications', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 0, number: 0, size: 20 }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

const renderPage = () => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.MERCHANT_NOTIFICATION_VIEW]))
  return renderWithProviders(<NotificationPage />, { store, route: ROUTE })
}

const saved = (): unknown =>
  JSON.parse(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`) ?? 'null')

describe('NotificationPage — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục từ khóa, cấp áp dụng và trang từ bản sao đã lưu', async () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'search=HLC&scope=SUB&page=2', sensitive: {} })
    )
    renderPage()
    expect(await screen.findByLabelText('Từ khóa')).toHaveValue('HLC')
    expect(screen.getByText('Sub-merchant')).toBeInTheDocument()
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0].searchParams
    expect(first.get('search')).toBe('HLC')
    expect(first.get('scope')).toBe('SUB')
    expect(first.get('page')).toBe('2')
  })

  it('bấm Tìm kiếm ghi bộ lọc vào bản sao, về trang 1', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'page=3', sensitive: {} })
    )
    renderPage()
    await user.type(await screen.findByLabelText('Từ khóa'), ' Coffee ')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('search')).toBe('Coffee')
      expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
    })
    expect(saved()).toEqual({ query: 'search=Coffee', sensitive: {} })
  })
})
