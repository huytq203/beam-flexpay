import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION, SCREENS } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import SubMerchantListPage from '../pages/SubMerchantListPage'
import { suppressAntPseudoElementWarning } from './domTestSetup'

const PATH = SCREENS.MERCHANT_SUB_MERCHANT.path
const STORAGE_KEY = `${LIST_STATE_PREFIX}${PATH}`
let requests: URL[] = []

suppressAntPseudoElementWarning()

function CurrentSearch() {
  return <span data-testid='current-search'>{useLocation().search}</span>
}

const renderPage = (route: string = PATH) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.SUB_MERCHANT_VIEW]))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <CurrentSearch />
        <SubMerchantListPage />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  requests = []
  server.use(
    http.get('*/sub-merchants', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 0, number: 0, size: 10 }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

describe('Sub-merchant — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục từ khóa, Merchant cha, ngày tạo và trang từ bản sao', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query:
          'merchantId=merchant-205&merchantCode=MC000205&merchantName=Merchant+205&status=ACTIVE&createdFrom=2026-09-01&createdTo=2026-09-30&page=2',
        sensitive: { query: '0901234567' }
      })
    )
    renderPage()

    expect(screen.getByLabelText('Từ khóa')).toHaveValue('0901234567')
    expect(screen.getByLabelText('Merchant cha')).toHaveValue(
      'MC000205 — Merchant 205'
    )
    expect(screen.getByPlaceholderText('Từ ngày')).toHaveValue('01/09/2026')
    expect(screen.getByPlaceholderText('Đến ngày')).toHaveValue('30/09/2026')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0]
    expect(first?.searchParams.get('merchantId')).toBe('merchant-205')
    expect(first?.searchParams.get('name')).toBe('0901234567')
    expect(first?.searchParams.get('status')).toBe('ACTIVE')
    expect(first?.searchParams.get('page')).toBe('2')
    expect(screen.getByTestId('current-search')).not.toHaveTextContent(
      '0901234567'
    )
  })

  it('Tìm kiếm ghi bộ lọc lên URL, Xóa bộ lọc xóa URL và bản sao', async () => {
    const user = userEvent.setup()
    renderPage(
      `${PATH}?merchantId=merchant-205&merchantCode=MC000205&merchantName=Merchant+205&page=3`
    )
    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('page')).toBe('3')
    )
    await user.type(screen.getByLabelText('Từ khóa'), 'Chi nhánh')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    // Từ khóa nhạy cảm đổi trước, URL (về trang 1) cập nhật sau một nhịp.
    await waitFor(() => {
      const last = requests.at(-1)?.searchParams
      expect(last?.get('name')).toBe('Chi nhánh')
      expect(last?.get('merchantId')).toBe('merchant-205')
      expect(last?.get('page')).toBe('1')
    })
    expect(screen.getByTestId('current-search')).toHaveTextContent(
      '?merchantId=merchant-205&merchantCode=MC000205&merchantName=Merchant+205'
    )

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toBeEmptyDOMElement()
    )
    expect(screen.getByLabelText('Merchant cha')).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
