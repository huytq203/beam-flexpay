import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { merchantService } from '../apiMerchant'

describe('Merchant document upload contract', () => {
  it('sends the document type required by the current BE controller', async () => {
    let submittedType: string | null = null
    server.use(http.post('*/documents', ({ request }) => {
      submittedType = new URL(request.url).searchParams.get('documentType')
      return HttpResponse.json({ data: { stagingId: 'stage-1' }, success: true }, { status: 201 })
    }))
    const store = createAppStore()
    const file = new File(['PDF content'], 'contract.pdf', { type: 'application/pdf' })
    const result = await store.dispatch(merchantService.endpoints.uploadMerchantDocument.initiate({ file, documentType: 'MERCHANT_CONTRACT' }))
    expect(submittedType).toBe('MERCHANT_CONTRACT')
    expect(result.data?.stagingId).toBe('stage-1')
  })
})
