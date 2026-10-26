import { render } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import MerchantDetail from '../pages/MerchantDetail'

export const detailMerchant = {
  id: 'm1',
  code: 'MC0001',
  name: 'Công ty A',
  status: 'PENDING_APPROVAL',
  createdAt: '2026-09-11T00:00:00',
  updatedAt: '2026-09-11T00:00:00'
}

export const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 10,
  first: true,
  last: true,
  empty: true
}

/** Mock hồ sơ merchant và thẻ phân khúc phí để trang chi tiết render đủ. */
export const mockMerchantDetail = (status = detailMerchant.status) =>
  server.use(
    http.get('*/merchants/m1', () =>
      HttpResponse.json({ data: { ...detailMerchant, status }, success: true })
    ),
    http.get('*/fee/customer-segments', () => HttpResponse.json({ data: [] })),
    http.get('*/fee/customer-segments/subjects/MERCHANT/m1', () =>
      HttpResponse.json({ data: null })
    )
  )

export const renderMerchantDetail = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/merchants/m1']}>
        <Routes>
          <Route
            path='/merchants/:id'
            element={<MerchantDetail />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}
