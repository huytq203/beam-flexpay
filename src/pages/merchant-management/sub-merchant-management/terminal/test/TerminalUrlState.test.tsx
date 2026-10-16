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
import TerminalListPage from '../pages/TerminalListPage'

const PATH = SCREENS.MERCHANT_TERMINAL.path
const STORAGE_KEY = `${LIST_STATE_PREFIX}${PATH}`
let requests: URL[] = []

function CurrentSearch() {
  return <span data-testid='current-search'>{useLocation().search}</span>
}

const renderPage = (route: string = PATH) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.TERMINAL_VIEW]))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <CurrentSearch />
        <TerminalListPage />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  requests = []
  server.use(
    http.get('*/terminals', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 30, number: 0, size: 10 }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

describe('Terminal — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục tên, Merchant, Sub-merchant và trang từ bản sao', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query:
          'name=Quay&merchantId=merchant-1&merchantCode=MC001&merchantName=Merchant+1&subId=sub-1&subCode=SUB001&subName=Chi+nh%C3%A1nh+1&status=ACTIVE&page=2',
        sensitive: {}
      })
    )
    renderPage()

    expect(screen.getByLabelText('Tên Terminal')).toHaveValue('Quay')
    expect(screen.getByLabelText('Merchant cha')).toHaveValue(
      'MC001 — Merchant 1'
    )
    expect(screen.getByLabelText('Sub-merchant')).toHaveValue(
      'SUB001 — Chi nhánh 1'
    )
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0]
    expect(first?.searchParams.get('name')).toBe('Quay')
    expect(first?.searchParams.get('merchantId')).toBe('merchant-1')
    expect(first?.searchParams.get('subMerchantId')).toBe('sub-1')
    expect(first?.searchParams.get('status')).toBe('ACTIVE')
    expect(first?.searchParams.get('page')).toBe('2')
  })

  it('Tìm kiếm ghi tên lên URL, Xóa bộ lọc xóa URL và bản sao', async () => {
    const user = userEvent.setup()
    renderPage(`${PATH}?status=ACTIVE&page=3`)
    await user.type(screen.getByLabelText('Tên Terminal'), 'Quầy 1')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toHaveTextContent(
        '?status=ACTIVE&name=Qu%E1%BA%A7y+1'
      )
    )
    await waitFor(() => {
      const last = requests.at(-1)?.searchParams
      expect(last?.get('name')).toBe('Quầy 1')
      expect(last?.get('page')).toBe('1')
    })

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toBeEmptyDOMElement()
    )
    expect(screen.getByLabelText('Tên Terminal')).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
