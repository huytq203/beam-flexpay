import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { CreateRefundDialog } from '../components/CreateRefundDialog'
import { FULL, makeTransaction, renderAs } from './transaction.setup'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'

const PREVIEW = {
  originalTransactionId: 'gl-transaction-1',
  channel: 'TO_WALLET',
  refundableAmount: 1000000,
  requestedAmount: 1000000,
  originalSenderFee: 10000,
  originalReceiverFee: 0,
  senderFeeReversal: 10000,
  receiverFeeReversal: 0,
  senderProcessingFee: 2000,
  receiverProcessingFee: 0,
  netCredit: 1008000,
  netDebit: 1000000,
  componentAllocations: [
    {
      componentId: 'c1',
      componentType: 'TRANSACTION_FEE',
      payerType: 'USER',
      originalFee: 10000,
      reversedFee: 10000,
      segments: []
    }
  ]
}

const capturePreview = (data: object = PREVIEW) => {
  const bodies: Record<string, unknown>[] = []
  server.use(
    http.post('*/refunds/preview', async ({ request }) => {
      const parsed: unknown = await request.json()
      bodies.push(parsed as Record<string, unknown>)
      return HttpResponse.json({ data })
    })
  )
  return bodies
}

const failPreview = (detail: string) =>
  server.use(
    http.post('*/refunds/preview', () =>
      HttpResponse.json(
        { success: false, message: 'BUSINESS_ERROR', detail, status: '1005' },
        { status: 400 }
      )
    )
  )

const renderDialog = (
  transaction: UnifiedContentJournal = makeTransaction(),
  permissions = FULL
) =>
  renderAs(
    <CreateRefundDialog
      transaction={transaction}
      onClose={vi.fn()}
    />,
    permissions
  )

const typeAmount = async (value: string) =>
  fireEvent.change(await screen.findByLabelText(/Số tiền hoàn/), {
    target: { value }
  })

const WAIT = { timeout: 3000 }

describe('CreateRefundDialog: xem trước phí', () => {
  it('chưa nhập số tiền thì hiện trạng thái trống và không gọi API', async () => {
    const bodies = capturePreview()
    renderDialog()
    expect(
      await screen.findByText('Nhập số tiền hoàn để xem phí hoàn tiền.')
    ).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(bodies).toHaveLength(0)
  })

  it('số tiền <= 0 không gọi xem trước', async () => {
    const bodies = capturePreview()
    renderDialog()
    await typeAmount('0')
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(bodies).toHaveLength(0)
  })

  it('gọi một lần với body đúng sau debounce và hiện khối phí', async () => {
    const bodies = capturePreview()
    renderDialog()
    await typeAmount('1')
    await typeAmount('10')
    await typeAmount('1000000')

    const block = await screen.findByRole('region', { name: 'Phí hoàn tiền' })
    await within(block).findByText(/1\.008\.000/, undefined, WAIT)
    expect(bodies).toEqual([
      {
        originalTransactionId: 'gl-transaction-1',
        requestedAmount: 1000000,
        channel: 'TO_WALLET',
        beneficiaryBankCode: null
      }
    ])
    expect(within(block).getByText('Khách thực nhận')).toBeInTheDocument()
    expect(within(block).getByText(/^\+.*10\.000/)).toBeInTheDocument()
    expect(within(block).getByText(/^−.*2\.000/)).toBeInTheDocument()
    expect(
      screen.getByText(/Số tiền còn được hoàn: .*1\.000\.000/)
    ).toBeInTheDocument()
    expect(within(block).getByText('Xem chi tiết')).toBeInTheDocument()
  })

  it('ẩn phí xử lý hoàn tiền khi bằng 0', async () => {
    capturePreview({ ...PREVIEW, senderProcessingFee: 0, netCredit: 1010000 })
    renderDialog()
    await typeAmount('1000000')
    await screen.findByText(/1\.010\.000/, undefined, WAIT)
    expect(screen.queryByText('Phí xử lý hoàn tiền')).toBeNull()
  })

  it('đổi số tiền thì gọi lại; nạp tiền gửi kênh TO_BANK kèm mã ngân hàng gốc', async () => {
    const bodies = capturePreview({ ...PREVIEW, channel: 'TO_BANK' })
    renderDialog(
      makeTransaction({ transactionType: 'CASH_IN', bankCode: 'VCB' })
    )
    await typeAmount('500000')
    await waitFor(() => expect(bodies).toHaveLength(1), WAIT)
    await typeAmount('600000')
    await waitFor(() => expect(bodies).toHaveLength(2), WAIT)
    expect(bodies[1]).toMatchObject({
      requestedAmount: 600000,
      channel: 'TO_BANK',
      beneficiaryBankCode: 'VCB'
    })
  })

  it('lỗi vượt mức hiện ngay trên popup', async () => {
    const detail =
      'Số tiền hoàn vượt quá giới hạn: yêu cầu 50.000, còn được hoàn tối đa 20.000'
    failPreview(detail)
    renderDialog()
    await typeAmount('50000')
    const alert = await screen.findByRole('alert', undefined, WAIT)
    expect(alert).toHaveTextContent(detail)
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu' })).toBeEnabled()
  })

  it('chưa cấu hình phí hiện lỗi, popup không treo và vẫn gửi được', async () => {
    failPreview(
      'Không tìm thấy assignment phù hợp với các điều kiện đã cung cấp'
    )
    let created = false
    server.use(
      http.post('*/refunds', () => {
        created = true
        return HttpResponse.json({ data: { id: 'r1', refundCode: 'RF-1' } })
      })
    )
    renderDialog()
    await typeAmount('50000')
    expect(await screen.findByRole('alert', undefined, WAIT)).toHaveTextContent(
      /Không tìm thấy assignment phù hợp/
    )
    fireEvent.change(screen.getByLabelText(/Lý do hoàn tiền/), {
      target: { value: 'Khách báo chuyển nhầm' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    await waitFor(() => expect(created).toBe(true))
  })

  it('giao dịch thiếu transactionId thì không gọi xem trước', async () => {
    const bodies = capturePreview()
    renderDialog(makeTransaction({ transactionId: null }))
    await typeAmount('50000')
    await new Promise((resolve) => setTimeout(resolve, 700))
    expect(bodies).toHaveLength(0)
  })
})
