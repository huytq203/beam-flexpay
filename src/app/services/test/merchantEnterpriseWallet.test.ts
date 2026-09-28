import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { merchantEnterpriseWalletService } from '../merchantEnterpriseWalletApi'

describe('Enterprise wallet source contract', () => {
  it('gets an inline URL for a document belonging to the enterprise wallet', async () => {
    let requestedUrl = ''
    server.use(
      http.get(
        '*/enterprise-wallets/wallet-1/documents/document-1/url',
        ({ request }) => {
          requestedUrl = request.url
          return HttpResponse.json({
            data: {
              url: 'https://storage.example/document-1',
              contentType: 'image/png',
              originalFilename: 'license.png'
            },
            success: true
          })
        }
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      merchantEnterpriseWalletService.endpoints.getEnterpriseWalletDocumentUrl.initiate(
        {
          walletId: 'wallet-1',
          documentId: 'document-1'
        }
      )
    )

    expect(new URL(requestedUrl).searchParams.get('disposition')).toBe('INLINE')
    expect(result.data?.url).toBe('https://storage.example/document-1')
  })

  it('creates the dossier through Merchant Admin API', async () => {
    let submitted: unknown
    server.use(
      http.post('*/enterprise-wallets', async ({ request }) => {
        submitted = await request.json()
        return HttpResponse.json(
          {
            data: {
              id: 'wallet-1',
              registeredEmail: 'finance@example.com',
              verificationStatus: 'PENDING_APPROVAL'
            },
            success: true
          },
          { status: 201 }
        )
      })
    )
    const store = createAppStore()
    const result = await store.dispatch(
      merchantEnterpriseWalletService.endpoints.createEnterpriseWallet.initiate(
        {
          registeredEmail: 'finance@example.com',
          businessType: 'ENTERPRISE',
          businessLicenseStagingId: 'stage-1'
        }
      )
    )
    expect(submitted).toMatchObject({
      registeredEmail: 'finance@example.com',
      businessType: 'ENTERPRISE',
      businessLicenseStagingId: 'stage-1'
    })
    expect(result.data?.verificationStatus).toBe('PENDING_APPROVAL')
  })
})
