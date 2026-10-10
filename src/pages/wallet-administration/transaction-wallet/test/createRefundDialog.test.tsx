import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { CreateRefundDialog } from '../components/CreateRefundDialog'
import { FULL, makeTransaction, renderAs } from './transaction.setup'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'

const captureCreate = (status = 200, payload?: object) => {
  const captured: { body: Record<string, unknown> | null } = { body: null }
  server.use(
    http.post('*/refunds', async ({ request }) => {
      const parsed: unknown = await request.json()
      captured.body = parsed as Record<string, unknown>
      return HttpResponse.json(
        payload ?? { data: { id: 'r1', refundCode: 'RF-20261010-000001' } },
        { status }
      )
    })
  )
  return captured
}

const renderDialog = (
  transaction: UnifiedContentJournal,
  onClose = vi.fn()
) => {
  renderAs(
    <CreateRefundDialog
      transaction={transaction}
      onClose={onClose}
    />,
    FULL
  )
  return onClose
}

const fillForm = async (amount = '50000', reason = 'Khách báo chuyển nhầm') => {
  fireEvent.change(await screen.findByLabelText(/Số tiền hoàn/), {
    target: { value: amount }
  })
  fireEvent.change(screen.getByLabelText(/Lý do hoàn tiền/), {
    target: { value: reason }
  })
}

describe('CreateRefundDialog', () => {
  it.each([
    ['CASH_IN', 'Về ngân hàng', 'TO_BANK'],
    ['P2P_TRANSFER', 'Về ví', 'TO_WALLET'],
    ['CASH_OUT', 'Về ví', 'TO_WALLET'],
    ['MERCHANT_PAYMENT', 'Về ví', 'TO_WALLET']
  ])(
    'khoá kênh theo loại %s: hiện %s và gửi %s',
    async (transactionType, label, channel) => {
      const captured = captureCreate()
      const onClose = renderDialog(makeTransaction({ transactionType }))

      expect(await screen.findByText(label)).toBeInTheDocument()
      expect(screen.queryByRole('combobox', { name: /Kênh hoàn/ })).toBeNull()

      await fillForm()
      await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))

      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(captured.body).toMatchObject({
        originalTransactionId: 'gl-transaction-1',
        requestedAmount: 50000,
        channel,
        reason: 'Khách báo chuyển nhầm',
        sendNotification: true,
        createdSource: 'ADMIN_PORTAL'
      })
    }
  )

  it('hoàn nạp tiền gửi placeholder thụ hưởng, còn TO_WALLET không gửi beneficiary', async () => {
    const bank = captureCreate()
    renderDialog(makeTransaction({ transactionType: 'CASH_IN' }))
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    await waitFor(() => expect(bank.body).not.toBeNull())
    expect(bank.body).toMatchObject({
      beneficiaryBankCode: 'N/A',
      beneficiaryAccountNumber: 'N/A',
      beneficiaryAccountName: 'N/A'
    })
  })

  it('TO_WALLET không có trường beneficiary', async () => {
    const wallet = captureCreate()
    renderDialog(makeTransaction({ transactionType: 'P2P_TRANSFER' }))
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    await waitFor(() => expect(wallet.body).not.toBeNull())
    expect(Object.keys(wallet.body ?? {})).not.toContainEqual(
      expect.stringMatching(/^beneficiary/)
    )
  })

  it('bỏ tích Gửi thông báo thì sendNotification là false', async () => {
    const captured = captureCreate()
    renderDialog(makeTransaction())
    await fillForm()
    await userEvent.click(
      screen.getByRole('checkbox', { name: /Gửi thông báo cho khách hàng/ })
    )
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))
    await waitFor(() => expect(captured.body).not.toBeNull())
    expect(captured.body).toMatchObject({ sendNotification: false })
  })

  it('submit lần hai khi đang gửi (Enter) không gọi API thêm', async () => {
    let calls = 0
    server.use(
      http.post('*/refunds', async () => {
        calls += 1
        await new Promise((resolve) => setTimeout(resolve, 150))
        return HttpResponse.json({ data: { id: 'r1', refundCode: 'RF-1' } })
      })
    )
    renderDialog(makeTransaction())
    await fillForm()
    const input = screen.getByLabelText(/Số tiền hoàn/)
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    await waitFor(() => expect(calls).toBe(1))
    fireEvent.submit(input.closest('form') as HTMLFormElement)
    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(calls).toBe(1)
  })

  it('chặn số tiền không dương và lý do dưới 10 ký tự, không gọi API', async () => {
    const captured = captureCreate()
    renderDialog(makeTransaction())
    await fillForm('0', 'ngắn')
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))

    expect(
      await screen.findByText('Số tiền hoàn phải lớn hơn 0')
    ).toBeInTheDocument()
    expect(
      screen.getByText('Lý do hoàn tiền phải có từ 10 đến 500 ký tự')
    ).toBeInTheDocument()
    expect(captured.body).toBeNull()
  })

  it('lỗi BE hiện nguyên văn detail trong form và giữ nguyên hộp thoại', async () => {
    const detail =
      'Số tiền hoàn vượt quá giới hạn: yêu cầu 50.000, còn được hoàn tối đa 20.000'
    captureCreate(400, {
      success: false,
      message: 'BUSINESS_ERROR',
      detail,
      status: '1005'
    })
    const onClose = renderDialog(makeTransaction())
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(detail)
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Gửi yêu cầu' })).toBeEnabled()
  })

  it('lỗi Bean Validation đọc map data thay vì câu Validation failed', async () => {
    captureCreate(400, {
      success: false,
      message: 'VALIDATION_ERROR',
      detail: 'Validation failed',
      status: '3001',
      data: { reason: 'Lý do hoàn tiền phải có từ 10 đến 500 ký tự' }
    })
    renderDialog(makeTransaction())
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(
      'Lý do hoàn tiền phải có từ 10 đến 500 ký tự'
    )
    expect(alert).not.toHaveTextContent('Validation failed')
  })

  it('thiếu transactionId thì không gửi yêu cầu và báo lỗi tại chỗ', async () => {
    const captured = captureCreate()
    renderDialog(makeTransaction({ transactionId: null }))
    await fillForm()
    await userEvent.click(screen.getByRole('button', { name: 'Gửi yêu cầu' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /chưa đủ dữ liệu/
    )
    expect(captured.body).toBeNull()
  })
})
