import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import SubMerchantListPage from '../pages/SubMerchantListPage'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

const record = {
  id: 'sub-1',
  code: 'SUB001',
  name: 'Chi nhánh 1',
  status: 'ACTIVE',
  merchantId: 'merchant-1',
  merchantCode: 'MC001',
  merchantName: 'Merchant 1'
}

const renderList = (route: string) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.SUB_MERCHANT_VIEW]))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <SubMerchantListPage />
      </MemoryRouter>
    </Provider>
  )
}

describe('Sub-merchant — xuất CSV', () => {
  afterEach(() => sessionStorage.clear())

  it('gửi merchantId, name, status theo bộ lọc, không kèm page/size', async () => {
    const user = userEvent.setup()
    let url: URL | undefined
    server.use(
      http.get('*/sub-merchants', () =>
        HttpResponse.json({
          data: { content: [record], totalElements: 1, number: 0, size: 10 }
        })
      ),
      http.get('*/sub-merchants/export', ({ request }) => {
        url = new URL(request.url)
        return new HttpResponse('"a"', {
          headers: { 'Content-Type': 'text/csv;charset=UTF-8' }
        })
      })
    )
    renderList(
      '/sub-merchant?merchantId=merchant-1&merchantName=Merchant%201&status=INACTIVE&page=2&size=50'
    )
    await screen.findByText('Chi nhánh 1')
    await user.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(url).toBeDefined())
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({
      merchantId: 'merchant-1',
      status: 'INACTIVE'
    })
  })
})
