import { apiFeeService } from '@/app/services/apiService'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import FeePolicyList from '../FeePolicyList'

const page = {
  content: [
    {
      id: 'policy-configuration',
      name: 'Chính sách cấu hình gộp',
      serviceType: 'EWALLET_DEPOSIT',
      feeDomain: 'EWALLET',
      currency: 'VND',
      validFrom: '2026-09-01',
      validTo: null,
      status: 'INACTIVE',
      priority: 1,
      configuration: {
        assignments: [],
        components: []
      }
    }
  ],
  totalElements: 1,
  totalPages: 1,
  size: 10,
  number: 0
}

const renderList = (store = createAppStore()) =>
  renderWithProviders(
    <MessageProvider>
      <FeePolicyList />
    </MessageProvider>,
    { route: '/fee', store }
  )

describe('cấu hình gộp của danh sách chính sách phí', () => {
  it('yêu cầu cấu hình gộp khi tải danh sách mà không gọi các endpoint chi tiết', async () => {
    const searchRequests: Request[] = []
    const detailRequests: string[] = []

    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
      http.get('*/fee/policies/search', ({ request }) => {
        searchRequests.push(request)
        return HttpResponse.json({ data: page })
      }),
      http.get(
        '*/fee/policy-assignments/by-policy/:policyId',
        ({ request }) => {
          detailRequests.push(request.url)
          return HttpResponse.json({ data: [] })
        }
      ),
      http.get('*/fee/policy-components/by-policy/:policyId', ({ request }) => {
        detailRequests.push(request.url)
        return HttpResponse.json({ data: [] })
      }),
      http.get(
        '*/fee/component-tiers/by-component/:componentId',
        ({ request }) => {
          detailRequests.push(request.url)
          return HttpResponse.json({ data: [] })
        }
      )
    )

    renderList()

    await screen.findByText('Chính sách cấu hình gộp')
    await waitFor(() => expect(searchRequests).toHaveLength(1))

    expect(
      new URL(searchRequests[0].url).searchParams.get('includeConfiguration')
    ).toBe('true')
    expect(detailRequests).toEqual([])
  })

  it('refetches the aggregate search when assignments invalidate their cache tag', async () => {
    let searchRequestCount = 0
    const store = createAppStore()

    server.use(
      http.get('*/fee/customer-segments', () =>
        HttpResponse.json({ data: [] })
      ),
      http.get('*/fee/policies/search', () => {
        searchRequestCount += 1
        return HttpResponse.json({ data: page })
      })
    )

    renderList(store)

    await screen.findByText('Chính sách cấu hình gộp')
    await waitFor(() => expect(searchRequestCount).toBe(1))

    store.dispatch(apiFeeService.util.invalidateTags(['feeAssign']))

    await waitFor(() => expect(searchRequestCount).toBe(2))
  })
})
