import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { render, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import MerchantDetail from '../pages/MerchantDetail'

describe('MerchantDetail', () => {
  it('gắn phân khúc bằng id trong dữ liệu merchant và subjectType MERCHANT', async () => {
    let subjectRequestPath = ''
    server.use(
      http.get('*/merchants/route-merchant-id', () =>
        HttpResponse.json({
          data: {
            id: 'fee-subject-id',
            code: 'MERCHANT_CODE',
            name: 'Merchant thử nghiệm',
            contactEmail: 'merchant@example.com',
            contactPhone: '0900000000',
            status: 'ACTIVE',
            createdAt: '2026-09-11T00:00:00Z',
            updatedAt: '2026-09-11T00:00:00Z',
            createdBy: 'admin',
            updatedBy: 'admin'
          }
        })
      ),
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
      http.get(
        '*/fee/customer-segments/subjects/MERCHANT/fee-subject-id',
        ({ request }) => {
          subjectRequestPath = new URL(request.url).pathname
          return HttpResponse.json({ data: null })
        }
      )
    )

    render(
      <Provider store={createAppStore()}>
        <MemoryRouter initialEntries={['/merchants/route-merchant-id']}>
          <Routes>
            <Route path='/merchants/:id' element={<MerchantDetail />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    )

    await waitFor(() =>
      expect(subjectRequestPath).toMatch(
        /\/fee\/customer-segments\/subjects\/MERCHANT\/fee-subject-id$/
      )
    )
  })
})
