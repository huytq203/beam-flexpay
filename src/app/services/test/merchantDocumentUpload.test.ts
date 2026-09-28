import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { merchantService } from '../apiMerchant'

describe('Merchant document upload contract', () => {
  it('sends the document type required by the current BE controller', async () => {
    let submittedType: string | null = null
    server.use(
      http.post('*/documents', ({ request }) => {
        submittedType = new URL(request.url).searchParams.get('documentType')
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
    const result = await store.dispatch(
      merchantService.endpoints.uploadMerchantDocument.initiate({
        file,
        documentType: 'MERCHANT_CONTRACT'
      })
    )
    expect(submittedType).toBe('MERCHANT_CONTRACT')
    expect(result.data?.stagingId).toBe('stage-1')
  })

  it('lấy link xem nội tuyến của tài liệu thuộc đúng merchant', async () => {
    let pathname = ''
    let disposition = ''
    server.use(
      http.get(
        '*/merchants/:merchantId/documents/:documentId/url',
        ({ request }) => {
          const url = new URL(request.url)
          pathname = url.pathname
          disposition = url.searchParams.get('disposition') ?? ''
          return HttpResponse.json({
            data: {
              url: 'https://files.test/document.pdf',
              contentType: 'application/pdf',
              originalFilename: 'contract.pdf'
            },
            success: true
          })
        }
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      merchantService.endpoints.getMerchantDocumentUrl.initiate({
        merchantId: 'merchant-1',
        documentId: 'file-1'
      })
    )
    expect(pathname).toMatch(/\/merchants\/merchant-1\/documents\/file-1\/url$/)
    expect(disposition).toBe('INLINE')
    expect(result.data?.url).toBe('https://files.test/document.pdf')
  })
})
