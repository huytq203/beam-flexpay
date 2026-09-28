import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import SubMerchantListPage from '../pages/SubMerchantListPage'

const record = {
  id: 'sub-1',
  code: 'SUB001',
  name: 'Chi nhánh 1',
  status: 'ACTIVE',
  merchantId: 'merchant-1',
  merchantCode: 'MC001',
  merchantName: 'Merchant 1',
  legalName: 'Chi nhánh Một',
  taxCode: '0123456789',
  businessField: 'Bán lẻ',
  phone: { value: '0901234567' },
  address: { value: '12 Lê Lợi' }
}

function CurrentPath() {
  return <span data-testid='current-path'>{useLocation().pathname}</span>
}

describe('Sub-merchant API list', () => {
  it('hiển thị bộ lọc, cột # và xem chi tiết trong modal trên cùng route', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/sub-merchants', () =>
        HttpResponse.json({
          data: { content: [record], totalElements: 1, number: 0, size: 10 }
        })
      ),
      http.get('*/sub-merchants/:id', () => HttpResponse.json({ data: record }))
    )
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.SUB_MERCHANT_VIEW]))
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/sub-merchant']}>
          <CurrentPath />
          <Routes>
            <Route
              path='/sub-merchant'
              element={<SubMerchantListPage />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    expect(
      screen.getByRole('heading', { name: 'Bộ lọc tìm kiếm' })
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('columnheader', { name: '#' })
    ).toBeInTheDocument()
    await user.click(
      await screen.findByRole('button', {
        name: 'Xem Sub-merchant Chi nhánh 1'
      })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Chi tiết Sub-merchant'
    })
    expect(dialog).toHaveTextContent('12 Lê Lợi')
    expect(dialog).toHaveTextContent('0123456789')
    expect(screen.getByTestId('current-path')).toHaveTextContent(
      '/sub-merchant'
    )
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByTestId('current-path')).toHaveTextContent(
      '/sub-merchant'
    )
  })

  it('lọc Merchant cha qua dialog phân trang từ API thật, áp dụng khi bấm Tìm kiếm', async () => {
    const user = userEvent.setup()
    const merchantRequests: URL[] = []
    const subRequests: URL[] = []
    server.use(
      http.get('*/merchants', ({ request }) => {
        merchantRequests.push(new URL(request.url))
        return HttpResponse.json({
          data: {
            content: [
              {
                id: 'merchant-205',
                code: 'MC000205',
                name: 'Merchant 205',
                status: 'LOCKED'
              }
            ],
            totalElements: 250,
            number: 0,
            size: 10
          }
        })
      }),
      http.get('*/sub-merchants', ({ request }) => {
        subRequests.push(new URL(request.url))
        return HttpResponse.json({
          data: { content: [record], totalElements: 1, number: 0, size: 10 }
        })
      })
    )
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.SUB_MERCHANT_VIEW]))
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/sub-merchant']}>
          <Routes>
            <Route
              path='/sub-merchant'
              element={<SubMerchantListPage />}
            />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    expect(merchantRequests).toHaveLength(0)
    await user.click(screen.getByLabelText('Merchant cha'))
    await user.click(await screen.findByLabelText('Chọn Merchant Merchant 205'))
    expect(merchantRequests[0]?.searchParams.get('status')).toBeNull()
    await waitFor(() =>
      expect(screen.getByLabelText('Merchant cha')).toHaveValue(
        'MC000205 — Merchant 205'
      )
    )
    expect(subRequests.at(-1)?.searchParams.get('merchantId')).toBeNull()
    await user.click(screen.getByText('Tìm kiếm'))
    await waitFor(() =>
      expect(subRequests.at(-1)?.searchParams.get('merchantId')).toBe(
        'merchant-205'
      )
    )
    await user.click(screen.getByText('Xóa bộ lọc'))
    await waitFor(() =>
      expect(subRequests.at(-1)?.searchParams.get('merchantId')).toBeNull()
    )
    expect(screen.getByLabelText('Merchant cha')).toHaveValue('')
  })
})
