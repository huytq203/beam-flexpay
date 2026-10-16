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
import KeyConnectionPage from '../pages/KeyConnectionPage'

const ROUTE = '/secure-panel/merchant/key-connection'
const requests: URL[] = []

beforeEach(() => {
  requests.length = 0
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: { content: [], totalElements: 0, number: 0, size: 100 }
      })
    ),
    http.get('*/merchant-api-credentials', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 0, number: 0, size: 10 }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

const renderPage = () => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.API_CREDENTIAL_VIEW]))
  return renderWithProviders(<KeyConnectionPage />, { store, route: ROUTE })
}

const saved = (): unknown =>
  JSON.parse(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`) ?? 'null')

describe('KeyConnectionPage — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục Merchant, trạng thái và trang từ bản sao đã lưu', async () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({
        query:
          'merchantId=merchant-1&merchantCode=M001&merchantName=Merchant+A&status=REVOKED&page=2',
        sensitive: {}
      })
    )
    renderPage()
    expect(await screen.findByLabelText('Merchant')).toHaveValue(
      'M001 — Merchant A'
    )
    expect(screen.getByText('Đã thu hồi')).toBeInTheDocument()
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0].searchParams
    expect(first.get('merchantId')).toBe('merchant-1')
    expect(first.get('status')).toBe('REVOKED')
    expect(first.get('page')).toBe('2')
  })

  it('Xóa bộ lọc thì xóa bản sao và gọi lại API từ trang 1', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'status=ACTIVE&page=3', sensitive: {} })
    )
    renderPage()
    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('page')).toBe('3')
    )
    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('status')).toBeNull()
      expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
    })
    expect(saved()).toBeNull()
  })
})
