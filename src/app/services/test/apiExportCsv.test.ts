import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import {
  apiExportFeeCsv,
  apiExportIdentityCsv,
  apiExportWalletCsv
} from '../apiExportCsv'

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

  it('xuất sổ cái với bộ lọc riêng của bảng bút toán, không gửi phân trang', async () => {
    let calledUrl = ''
    server.use(
      http.get('*/wallet/entries/export', ({ request }) => {
        calledUrl = request.url
        return HttpResponse.text('ma_giao_dich\nTX1', {
          headers: {
            'content-type': 'text/csv',
            'content-disposition': 'attachment; filename="So-cai_20260908-101500.csv"'
          }
        })
      })
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportWalletCsv.endpoints.exportLedgerEntries.initiate({
        ownerUsername: '0962341913',
        ownerType: 'USER',
        direction: 'DEBIT',
        transactionType: 'JOURNAL_REVERSAL',
        glCode: 'USER_WALLET_VND',
        minAmount: 1000
      })
    )

    const searchParams = new URL(calledUrl).searchParams
    expect(result.data?.filename).toBe('So-cai_20260908-101500.csv')
    expect(searchParams.get('ownerUsername')).toBe('0962341913')
    expect(searchParams.get('ownerType')).toBe('USER')
    expect(searchParams.get('direction')).toBe('DEBIT')
    expect(searchParams.get('transactionType')).toBe('JOURNAL_REVERSAL')
    expect(searchParams.get('glCode')).toBe('USER_WALLET_VND')
    expect(searchParams.get('minAmount')).toBe('1000')
    expect(searchParams.get('page')).toBeNull()
    expect(searchParams.get('size')).toBeNull()
    // Sổ cái chỉ chứa bút toán đã hạch toán — không có tham số trạng thái.
    expect(searchParams.get('status')).toBeNull()
  })

  it('xuất hồ sơ eKYC với bộ lọc hiện tại và không gửi phân trang', async () => {
    let calledUrl = ''
    server.use(
      http.get('*/verified-kyc-profiles/export', ({ request }) => {
        calledUrl = request.url
        return HttpResponse.text('ho_ten\nNguyen Van A', {
          headers: { 'content-type': 'text/csv' }
        })
      })
    )
    const store = createAppStore()

    await store.dispatch(
      apiExportIdentityCsv.endpoints.exportVerifiedKycProfiles.initiate({
        keyword: 'Nguyen Van A',
        status: 'VERIFIED',
        createdFrom: '2026-09-01 00:00:00',
        createdTo: '2026-09-08 23:59:59'
      })
    )

    const searchParams = new URL(calledUrl).searchParams
    expect(searchParams.get('keyword')).toBe('Nguyen Van A')
    expect(searchParams.get('status')).toBe('VERIFIED')
    expect(searchParams.get('createdFrom')).toBe('2026-09-01 00:00:00')
    expect(searchParams.get('createdTo')).toBe('2026-09-08 23:59:59')
    expect(searchParams.has('page')).toBe(false)
    expect(searchParams.has('size')).toBe(false)
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

  it('xuất cấu hình phí với bộ lọc của danh sách và không gửi trạng thái giao diện', async () => {
    let calledUrl = ''
    server.use(
      http.get('*/fee/policies/export', ({ request }) => {
        calledUrl = request.url
        return HttpResponse.text('ma_chinh_sach\nFEE-001', {
          headers: {
            'content-type': 'text/csv',
            'content-disposition':
              'attachment; filename="Cau-hinh-phi_20260921-101500.csv"'
          }
        })
      })
    )
    const store = createAppStore()

    const result = await store.dispatch(
      apiExportFeeCsv.endpoints.exportFeePolicies.initiate({
        feeDomain: 'EWALLET',
        keyword: 'nạp tiền',
        subjectKeyword: '0912',
        serviceType: 'EWALLET_DEPOSIT',
        status: 'ACTIVE',
        appliedTarget: 'CUSTOMER_GROUP',
        paymentMethod: 'ATM',
        validFrom: '2026-09-01',
        validTo: '2026-09-30',
        createdAtFrom: '2026-08-01',
        createdAtTo: '2026-08-31'
      })
    )

    const searchParams = new URL(calledUrl).searchParams
    expect(result.data?.filename).toBe('Cau-hinh-phi_20260921-101500.csv')
    expect(searchParams.get('feeDomain')).toBe('EWALLET')
    expect(searchParams.get('keyword')).toBe('nạp tiền')
    expect(searchParams.get('subjectKeyword')).toBe('0912')
    expect(searchParams.get('serviceType')).toBe('EWALLET_DEPOSIT')
    expect(searchParams.get('status')).toBe('ACTIVE')
    expect(searchParams.get('appliedTarget')).toBe('CUSTOMER_GROUP')
    expect(searchParams.get('paymentMethod')).toBe('ATM')
    expect(searchParams.get('validFrom')).toBe('2026-09-01')
    expect(searchParams.get('validTo')).toBe('2026-09-30')
    expect(searchParams.get('createdAtFrom')).toBe('2026-08-01')
    expect(searchParams.get('createdAtTo')).toBe('2026-08-31')
    expect(searchParams.has('page')).toBe(false)
    expect(searchParams.has('size')).toBe(false)
    expect(searchParams.has('direction')).toBe(false)
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
