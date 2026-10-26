import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createMerchantDocumentBody, merchantService } from '../apiMerchant'

describe('Merchant document upload contract', () => {
  it('sends the document type required by the current BE controller', async () => {
    let requestedUrl = ''
    server.use(
      http.post('*/documents', ({ request }) => {
        requestedUrl = request.url
        return HttpResponse.json(
          { data: { stagingId: 'stage-1' }, success: true },
          { status: 201 }
        )
      })
    )
    const store = createAppStore()
    const file = new File(['PDF content'], 'contract.pdf', {
      type: 'application/pdf'
    })
    const multipartBody = createMerchantDocumentBody(file, 'MERCHANT_CONTRACT')
    expect(multipartBody.get('documentType')).toBe('MERCHANT_CONTRACT')
    expect(multipartBody.get('file')).toBe(file)
    const result = await store.dispatch(
      merchantService.endpoints.uploadMerchantDocument.initiate({
        file,
        documentType: 'MERCHANT_CONTRACT'
      })
    )
    expect(new URL(requestedUrl).searchParams.has('documentType')).toBe(false)
    expect(result.data?.stagingId).toBe('stage-1')
  })
})
