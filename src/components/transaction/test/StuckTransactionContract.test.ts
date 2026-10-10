import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { apiStuckTransaction } from '@services/apiStuckTransaction'
import { isStuckJournalStatus } from '@utils/stuck-transaction'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

describe('hợp đồng cập nhật giao dịch treo', () => {
  it('cho phép các trạng thái treo mới của BE', () => {
    expect(isStuckJournalStatus('CREDIT_PENDING')).toBe(true)
    expect(isStuckJournalStatus('RECONCILIATION_REQUIRED')).toBe(true)
    expect(isStuckJournalStatus('POSTED')).toBe(false)
  })

  it('coi HTTP 200 success=false là lỗi nghiệp vụ và giữ detail', async () => {
    server.use(
      http.post('*/transactions/CO2609070001/update-status', () =>
        HttpResponse.json({
          success: false,
          detail: 'Giao dịch đã có kết quả cuối, không thể cập nhật lại',
          status: '1005'
        })
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      apiStuckTransaction.endpoints.updateStuckTransactionStatus.initiate({
        transactionCode: 'CO2609070001',
        newStatus: 'FAILED',
        note: 'Đã đối chiếu trạng thái với ngân hàng'
      })
    )
    expect(result).toHaveProperty(
      'error.data.detail',
      'Giao dịch đã có kết quả cuối, không thể cập nhật lại'
    )
  })

  it('giữ các ID ghi sổ trong kết quả cập nhật', async () => {
    server.use(
      http.post('*/transactions/CO2609070002/update-status', () =>
        HttpResponse.json({
          success: true,
          data: {
            transactionCode: 'CO2609070002',
            newStatus: 'POSTED',
            requestId: 'request-1',
            journalId: 'journal-1',
            transactionId: 'ledger-1'
          }
        })
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      apiStuckTransaction.endpoints.updateStuckTransactionStatus.initiate({
        transactionCode: 'CO2609070002',
        newStatus: 'POSTED',
        note: 'Đã đối chiếu trạng thái với ngân hàng'
      })
    )
    expect(result.data).toMatchObject({
      requestId: 'request-1',
      journalId: 'journal-1',
      transactionId: 'ledger-1'
    })
  })

  it('gửi body update-status không có trường rỗng và trả các trường mới', async () => {
    let body: unknown = null
    server.use(
      http.post(
        '*/transactions/CO2609070003/update-status',
        async ({ request }) => {
          body = await request.json()
          return HttpResponse.json({
            success: true,
            data: {
              transactionCode: 'CO2609070003',
              newStatus: 'POSTED',
              bankReference: 'FT1',
              receiptKey: 'txn-receipts/x.png',
              refundBankReference: null
            }
          })
        }
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      apiStuckTransaction.endpoints.updateStuckTransactionStatus.initiate({
        transactionCode: 'CO2609070003',
        newStatus: 'POSTED',
        note: 'Đã đối chiếu trạng thái với ngân hàng',
        authCode: '',
        bankReference: 'FT1',
        receiptKey: 'txn-receipts/x.png'
      })
    )
    expect(body).toEqual({
      newStatus: 'POSTED',
      note: 'Đã đối chiếu trạng thái với ngân hàng',
      bankReference: 'FT1',
      receiptKey: 'txn-receipts/x.png'
    })
    expect(result.data).toMatchObject({
      bankReference: 'FT1',
      receiptKey: 'txn-receipts/x.png',
      refundBankReference: null
    })
  })

  it('GET receipt trả link, và null khi data là {}', async () => {
    server.use(
      http.get('*/transactions/WITH/receipt', () =>
        HttpResponse.json({ data: { receiptUrl: 'https://s3/x' } })
      ),
      http.get('*/transactions/NONE/receipt', () =>
        HttpResponse.json({ data: {} })
      )
    )
    const store = createAppStore()
    const { getStuckTransactionReceipt } = apiStuckTransaction.endpoints
    const withReceipt = await store.dispatch(
      getStuckTransactionReceipt.initiate('WITH')
    )
    const none = await store.dispatch(
      getStuckTransactionReceipt.initiate('NONE')
    )
    expect(withReceipt.data).toEqual({ receiptUrl: 'https://s3/x' })
    expect(none.data).toEqual({ receiptUrl: null })
  })
})
