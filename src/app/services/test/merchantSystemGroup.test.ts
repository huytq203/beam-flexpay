import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { accessApi } from '../merchantAccessApi'

describe('Merchant system group contract', () => {
  it('uses the dedicated BE route for a shared group', async () => {
    let requested = ''
    server.use(http.post('*/merchant-system-permission-groups', ({ request }) => {
      requested = new URL(request.url).pathname
      return HttpResponse.json({ data: { id: 'group-1', code: 'VIEWER', name: 'Chỉ xem', merchantId: null, system: true, permissions: ['VIEW_TRANSACTION'] }, success: true }, { status: 201 })
    }))
    const store = createAppStore()
    const result = await store.dispatch(accessApi.endpoints.createMerchantSystemGroup.initiate({ code: 'VIEWER', name: 'Chỉ xem', permissions: ['VIEW_TRANSACTION'] }))
    expect(requested).toContain('/merchant-system-permission-groups')
    expect(result.data?.system).toBe(true)
  })
})
