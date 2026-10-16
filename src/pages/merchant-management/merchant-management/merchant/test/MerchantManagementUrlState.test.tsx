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
import MerchantManagement from '../pages/MerchantManagement'

const PATH = SCREENS.MERCHANT_MANAGEMENT.path
let requests: URL[] = []
// CardTotal cũng gọi /merchants với size=1 để đếm, bỏ qua các request đó.
const listRequests = (): URL[] =>
  requests.filter((url) => url.searchParams.get('size') !== '1')

function CurrentSearch() {
  return <span data-testid='current-search'>{useLocation().search}</span>
}

const renderPage = (route: string = PATH) => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:MERCHANT:VIEW']))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <CurrentSearch />
        <MerchantManagement />
      </MemoryRouter>
    </Provider>
  )
}

beforeEach(() => {
  requests = []
  server.use(
    http.get('*/merchants', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content: [], totalElements: 30, number: 0, size: 10 },
        success: true
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

describe('MerchantManagement — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc và trang từ bản sao, gọi API đúng tham số', async () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${PATH}`,
      JSON.stringify({
        query: 'name=Sao+Viet&status=ACTIVE&page=2',
        sensitive: {}
      })
    )
    renderPage()

    expect(screen.getByLabelText('Tên merchant')).toHaveValue('Sao Viet')
    await waitFor(() => expect(listRequests().length).toBeGreaterThan(0))
    const first = listRequests()[0]
    expect(first?.searchParams.get('name')).toBe('Sao Viet')
    expect(first?.searchParams.get('status')).toBe('ACTIVE')
    expect(first?.searchParams.get('page')).toBe('2')
    expect(screen.getByTestId('current-search')).toHaveTextContent(
      '?name=Sao+Viet&status=ACTIVE&page=2'
    )
  })

  it('Tìm kiếm ghi bộ lọc lên URL, Xóa lọc xóa URL và bản sao', async () => {
    const user = userEvent.setup()
    renderPage(`${PATH}?page=3`)
    await user.type(screen.getByLabelText('Mã merchant'), 'M01')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toHaveTextContent(
        '?code=M01'
      )
    )
    await waitFor(() =>
      expect(listRequests().at(-1)?.searchParams.get('code')).toBe('M01')
    )
    expect(listRequests().at(-1)?.searchParams.get('page')).toBe('1')

    await user.click(screen.getByRole('button', { name: 'Xóa lọc' }))
    await waitFor(() =>
      expect(screen.getByTestId('current-search')).toBeEmptyDOMElement()
    )
    expect(screen.getByLabelText('Mã merchant')).toHaveValue('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${PATH}`)).toBeNull()
  })

  it('mã số thuế không lên URL (MST cá nhân là số CCCD) nhưng vẫn gửi API', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitFor(() => expect(listRequests().length).toBeGreaterThan(0))
    await user.type(screen.getByLabelText('Mã số thuế'), '001099012345')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() =>
      expect(listRequests().at(-1)?.searchParams.get('taxCode')).toBe(
        '001099012345'
      )
    )
    const saved = JSON.parse(
      sessionStorage.getItem(`${LIST_STATE_PREFIX}${PATH}`) ?? '{}'
    )
    expect(saved.query).not.toContain('001099012345')
    expect(saved.sensitive.taxCode).toBe('001099012345')
  })
})
