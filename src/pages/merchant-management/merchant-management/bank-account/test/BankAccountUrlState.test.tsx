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
import BankAccount from '../pages/BankAccount'

const PATH = SCREENS.MERCHANT_BANK_ACCOUNT.path
const STORAGE_KEY = `${LIST_STATE_PREFIX}${PATH}`
let requests: URL[] = []

function CurrentSearch() {
  return <span data-testid='current-search'>{useLocation().search}</span>
}

const renderPage = (route: string = PATH) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.MERCHANT_BANK_ACCOUNT_VIEW]))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <CurrentSearch />
        <BankAccount />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  requests = []
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({ data: { content: [], totalElements: 0 } })
    ),
    http.get('*/merchant-bank-accounts', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 30, number: 0, size: 10 }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

describe('BankAccount — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc, Merchant đã chọn và trang từ bản sao', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query:
          'merchantId=merchant-1&merchantCode=M001&merchantName=Merchant+A&status=ACTIVE&page=2',
        sensitive: { query: '0071000124821' }
      })
    )
    renderPage()

    expect(screen.getByLabelText('Từ khóa')).toHaveValue('0071000124821')
    expect(screen.getByLabelText('Merchant')).toHaveValue('M001 — Merchant A')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0]
    expect(first?.searchParams.get('merchantId')).toBe('merchant-1')
    expect(first?.searchParams.get('status')).toBe('ACTIVE')
    expect(first?.searchParams.get('query')).toBe('0071000124821')
    expect(first?.searchParams.get('page')).toBe('2')
    expect(screen.getByTestId('current-search')).not.toHaveTextContent(
      '0071000124821'
    )
  })

  it('Tìm kiếm giữ số tài khoản ngoài URL, Xóa bộ lọc xóa URL và bản sao', async () => {
    const user = userEvent.setup()
    renderPage(`${PATH}?status=ACTIVE&page=3`)
    await user.type(screen.getByLabelText('Từ khóa'), '0071')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    // Từ khóa nhạy cảm đổi trước, URL (về trang 1) cập nhật sau một nhịp.
    await waitFor(() => {
      const last = requests.at(-1)?.searchParams
      expect(last?.get('query')).toBe('0071')
      expect(last?.get('page')).toBe('1')
    })
    expect(screen.getByTestId('current-search')).toHaveTextContent(
      '?status=ACTIVE'
    )
    expect(screen.getByTestId('current-search')).not.toHaveTextContent('0071')

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toBeEmptyDOMElement()
    )
    expect(screen.getByLabelText('Từ khóa')).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
