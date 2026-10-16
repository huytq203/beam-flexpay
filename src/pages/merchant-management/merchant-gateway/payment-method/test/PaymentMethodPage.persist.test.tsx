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
import PaymentMethodPage from '../pages/PaymentMethodPage'

const ROUTE = '/secure-panel/merchant/payment-method'
const requests: URL[] = []

const row = (merchantId: string, merchantName: string) => ({
  merchantId,
  merchantCode: merchantId.toUpperCase(),
  merchantName,
  appliedLevel: 'MASTER',
  enabledMethods: ['QR'],
  configured: true,
  isDefault: false,
  active: true
})

beforeEach(() => {
  requests.length = 0
  server.use(
    http.get('*/merchants/payment-methods', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: {
          content: [row('m-1', 'Highlands'), row('m-2', 'Phúc Long')],
          totalElements: 30,
          number: 1,
          size: 10
        }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

const renderPage = () => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW]))
  return renderWithProviders(<PaymentMethodPage />, { store, route: ROUTE })
}

const saved = (): unknown =>
  JSON.parse(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`) ?? 'null')

describe('PaymentMethodPage — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục tên Merchant và trang từ bản sao đã lưu', async () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'name=Phúc&page=2', sensitive: {} })
    )
    renderPage()
    expect(await screen.findByText('Phúc Long')).toBeInTheDocument()
    expect(screen.queryByText('Highlands')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Tên Merchant')).toHaveValue('Phúc')
    expect(requests[0].searchParams.get('page')).toBe('2')
    expect(requests[0].searchParams.get('size')).toBe('10')
  })

  it('Xóa lọc thì xóa bản sao và tải lại trang 1', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'name=Phúc&page=2', sensitive: {} })
    )
    renderPage()
    await screen.findByText('Phúc Long')
    await user.click(screen.getByRole('button', { name: 'Xóa lọc' }))
    expect(await screen.findByText('Highlands')).toBeInTheDocument()
    expect(screen.getByLabelText('Tên Merchant')).toHaveValue('')
    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
    )
    expect(saved()).toBeNull()
  })
})
