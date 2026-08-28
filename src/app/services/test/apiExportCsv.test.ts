import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { apiExportFeeCsv, apiExportWalletCsv } from '../apiExportCsv'

const ACCOUNT_ID = 'bc948626-2c8f-4f41-a866-7540d59a7e07'

describe('apiExportCsv', () => {
  it('trả blob và tên file lấy từ Content-Disposition', async () => {
    server.use(
      http.get('*/wallet/freezes/export', () =>
        HttpResponse.text('ma,so_tien\nFRZ1,1000', {
          headers: {
            'content-type': 'text/csv',
            'content-disposition': 'attachment; filename="dong-bang.csv"'
          }
        })
      )
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportWalletCsv.endpoints.exportFreezes.initiate({
        accountId: ACCOUNT_ID
      })
    )

    expect(result.data?.filename).toBe('dong-bang.csv')
    expect(await result.data?.blob.text()).toBe('ma,so_tien\nFRZ1,1000')
  })

  it('trả filename null khi backend không gửi Content-Disposition', async () => {
    let calledUrl = ''
    server.use(
      http.get('*/wallet/transactions/export', ({ request }) => {
        calledUrl = request.url
        return HttpResponse.text('ma\nTX1', {
          headers: { 'content-type': 'text/csv' }
        })
      })
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportWalletCsv.endpoints.exportTransactions.initiate({
        partyId: ACCOUNT_ID,
        counterpartyUsername: '0353585904',
        sourceDomain: 'EWALLET',
        paymentMethod: 'LINKED_ACCOUNT'
      })
    )

    const searchParams = new URL(calledUrl).searchParams
    expect(result.data?.filename).toBeNull()
    expect(searchParams.get('partyId')).toBe(ACCOUNT_ID)
    expect(searchParams.get('counterpartyUsername')).toBe('0353585904')
    expect(searchParams.get('sourceDomain')).toBe('EWALLET')
    expect(searchParams.get('paymentMethod')).toBe('LINKED_ACCOUNT')
  })

  it('gắn id ví vào đường dẫn export liên kết ngân hàng', async () => {
    let calledUrl = ''
    server.use(
      http.get('*/wallet/accounts/:id/bank-links/export', ({ request }) => {
        calledUrl = new URL(request.url).pathname
        return HttpResponse.text('ma\nBL1', {
          headers: { 'content-type': 'text/csv' }
        })
      })
    )
    const store = createAppStore()

    await store.dispatch(
      apiExportWalletCsv.endpoints.exportBankLinks.initiate({
        walletAccountId: ACCOUNT_ID
      })
    )

    expect(calledUrl).toContain(
      `/wallet/accounts/${ACCOUNT_ID}/bank-links/export`
    )
  })

  it('parse body lỗi JSON thay vì để nguyên Blob cho errorMiddleware', async () => {
    server.use(
      http.get('*/fee/applicable-rules/export', () =>
        HttpResponse.json({ message: 'Ví không tồn tại' }, { status: 400 })
      )
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportFeeCsv.endpoints.exportApplicableFeeRules.initiate({
        merchantId: ACCOUNT_ID,
        feeDomain: 'EWALLET'
      })
    )

    expect(result.error).toMatchObject({
      status: 400,
      data: { message: 'Ví không tồn tại' }
    })
  })

  it('giữ nội dung lỗi text khi gateway không trả JSON', async () => {
    server.use(
      http.get('*/wallet/freezes/export', () =>
        HttpResponse.text('Gateway timeout', { status: 502 })
      )
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportWalletCsv.endpoints.exportFreezes.initiate({
        accountId: ACCOUNT_ID
      })
    )

    expect(result.error).toMatchObject({
      status: 502,
      data: { message: 'Gateway timeout' }
    })
  })

  it('request export đã whitelist không phát cả show-loading lẫn hide-loading', async () => {
    const previousPath = window.location.pathname
    window.history.replaceState(
      null,
      '',
      `/secure-panel/wallet-administration/e-walletManagement/${ACCOUNT_ID}`
    )
    const emitSpy = vi.spyOn(window.events, 'emit')
    server.use(
      http.get('*/wallet/freezes/export', () =>
        HttpResponse.text('ma\nFRZ1', {
          headers: { 'content-type': 'text/csv' }
        })
      )
    )

    try {
      const store = createAppStore()
      await store.dispatch(
        apiExportWalletCsv.endpoints.exportFreezes.initiate({
          accountId: ACCOUNT_ID
        })
      )

      expect(emitSpy).not.toHaveBeenCalledWith('show-loading')
      expect(emitSpy).not.toHaveBeenCalledWith('hide-loading')
    } finally {
      emitSpy.mockRestore()
      window.history.replaceState(null, '', previousPath)
    }
  })
})
