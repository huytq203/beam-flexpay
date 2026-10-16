import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { SCREENS } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import BusinessWallet from '../pages/BusinessWallet'

const PATH = SCREENS.BUSINESS_WALLET_ACCOUNT.path
const STORAGE_KEY = `${LIST_STATE_PREFIX}${PATH}`
let requests: URL[] = []

function CurrentSearch() {
  return <span data-testid='current-search'>{useLocation().search}</span>
}

const renderPage = (route: string = PATH) => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:ENTERPRISE_WALLET:VIEW']))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <CurrentSearch />
        <BusinessWallet />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  requests = []
  server.use(
    http.get('*/enterprise-wallets', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 30, number: 0, size: 10 },
        success: true
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

describe('BusinessWallet — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc và trang từ bản sao, API nhận trang tính từ 0', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query: 'verificationStatus=VERIFIED&page=2',
        sensitive: { query: 'finance@example.com', taxCode: '0301234567' }
      })
    )
    renderPage()

    expect(screen.getByLabelText('Mã số thuế')).toHaveValue('0301234567')
    expect(screen.getByLabelText('Tìm kiếm')).toHaveValue('finance@example.com')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0]
    expect(first?.searchParams.get('taxCode')).toBe('0301234567')
    expect(first?.searchParams.get('verificationStatus')).toBe('VERIFIED')
    expect(first?.searchParams.get('query')).toBe('finance@example.com')
    expect(first?.searchParams.get('page')).toBe('1')
  })

  it('Tìm kiếm không đưa mã số thuế lên URL (MST cá nhân là số CCCD), Xóa bộ lọc xóa bản sao', async () => {
    const user = userEvent.setup()
    renderPage(`${PATH}?page=3`)
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    await user.type(screen.getByLabelText('Mã số thuế'), '0301234567')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('taxCode')).toBe('0301234567')
    )
    const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(saved.query).not.toContain('0301234567')
    expect(saved.sensitive.taxCode).toBe('0301234567')
    expect(requests.at(-1)?.searchParams.get('page')).toBe('0')

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toBeEmptyDOMElement()
    )
    expect(screen.getByLabelText('Mã số thuế')).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
