import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { merchantEnterpriseWalletService } from '../merchantEnterpriseWalletApi'

describe('Enterprise wallet source contract', () => {
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
