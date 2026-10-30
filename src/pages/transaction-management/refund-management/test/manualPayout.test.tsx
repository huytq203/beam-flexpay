import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { suppressAntPseudoElementWarning } from '../../../merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import { getRefundActions } from '../utils/refund.utils'
import {
  makeRefund,
  mockDetail,
  mockList,
  renderRefundPage
} from './refund.setup'

suppressAntPseudoElementWarning()

/** Kế toán có quyền duyệt chi — BE mở `manual-payout` cho quyền này. */
const ACCOUNTANT = [PERMISSION.PAYOUT_APPROVE]
const PAYOUT_CODE = 'FW26RFPAYOUT1'
const RECEIPT_KEY = `receipts/${PAYOUT_CODE}/unc.pdf`
const BANK_REFERENCE = 'FT26301XYZ'
const NOTE = 'Đã chuyển khoản tay qua ngân hàng ACB'

/** Hoàn về ngân hàng không có API, đã duyệt chi: BE báo đang chờ admin chốt tay. */
const MANUAL_PROCESSING = makeRefund({
  id: 'm1',
  refundCode: 'RF-MANUAL-1',
  channel: 'TO_BANK',
  status: 'PROCESSING',
  payoutCode: PAYOUT_CODE,
  beneficiaryBankCode: 'ACB',
  payoutMode: 'MANUAL',
  awaitingManualConfirmation: true
})

const API_PROCESSING = makeRefund({
  ...MANUAL_PROCESSING,
  id: 'a1',
  refundCode: 'RF-API-1',
  beneficiaryBankCode: 'VCB',
  payoutMode: 'API',
  awaitingManualConfirmation: false
})

const context = {
  username: 'ketoan.truong',
  canApprove: false,
  canPayoutApprove: true,
  canSettle: false,
  canPayoutRefresh: true
}

describe('getRefundActions: chi thủ công', () => {
  it('PROCESSING + MANUAL đang chờ chốt tay: có hai hành động, không làm mới lệnh chi', () => {
    const flags = getRefundActions(MANUAL_PROCESSING, context)
    expect(flags.manualPayoutSuccess).toBe(true)
    expect(flags.manualPayoutFail).toBe(true)
    // Lệnh chi chưa gửi sang ngân hàng nên không có gì để tra lại.
    expect(flags.payoutRefresh).toBe(false)
  })

  it('PROCESSING + API chờ đối soát: không có hai hành động, vẫn làm mới lệnh chi', () => {
    const flags = getRefundActions(
      { ...API_PROCESSING, payoutRefreshable: true },
      context
    )
    expect(flags.manualPayoutSuccess).toBe(false)
    expect(flags.manualPayoutFail).toBe(false)
    expect(flags.payoutRefresh).toBe(true)
  })

  it('không tự suy: thiếu awaitingManualConfirmation thì không có hành động', () => {
    const flags = getRefundActions(
      { ...MANUAL_PROCESSING, awaitingManualConfirmation: undefined },
      context
    )
    expect(flags.manualPayoutSuccess).toBe(false)
  })

  it('thiếu quyền duyệt chi thì ẩn', () => {
    const flags = getRefundActions(MANUAL_PROCESSING, {
      ...context,
      canPayoutApprove: false
    })
    expect(flags.manualPayoutSuccess).toBe(false)
    expect(flags.manualPayoutFail).toBe(false)
  })
})

describe('Màn hoàn tiền: dialog chi thủ công', () => {
  const openDrawer = async (): Promise<HTMLElement> => {
    mockList(() => [MANUAL_PROCESSING])
    mockDetail(MANUAL_PROCESSING)
    renderRefundPage(ACCOUNTANT)
    await userEvent.click(
      await screen.findByRole('button', {
        name: `Xem chi tiết ${MANUAL_PROCESSING.refundCode}`
      })
    )
    return screen.findByRole('dialog')
  }

  /** Drawer vẫn mở phía dưới nên dialog chốt tay là dialog thứ hai. */
  const actionDialog = async (title: string): Promise<HTMLElement> => {
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2))
    const dialog = screen.getAllByRole('dialog')[1]
    expect(within(dialog).getByText(title)).toBeInTheDocument()
    return dialog
  }

  const captureManualPayout = () => {
    const captured: { body: unknown } = { body: null }
    server.use(
      http.post('*/refunds/:id/manual-payout', async ({ request }) => {
        captured.body = await request.json()
        return HttpResponse.json({
          data: { ...MANUAL_PROCESSING, status: 'SUCCESS' }
        })
      })
    )
    return captured
  }

  it('"Chi thành công" khoá nút gửi tới khi đủ mã tham chiếu + UNC, rồi gửi đúng body', { timeout: 20000 }, async () => {
    server.use(
      http.post(`*/transactions/${PAYOUT_CODE}/receipt`, () =>
        HttpResponse.json({
          data: {
            receiptKey: RECEIPT_KEY,
            contentType: 'application/pdf',
            sizeBytes: 10
          }
        })
      )
    )
    const captured = captureManualPayout()
    const drawer = await openDrawer()

    await userEvent.click(
      await within(drawer).findByRole('button', { name: /Chi thành công/ })
    )
    const dialog = await actionDialog('Xác nhận chi hoàn thành công')
    const submit = within(dialog).getByRole('button', {
      name: 'Xác nhận chi thành công'
    })
    expect(submit).toBeDisabled()

    fireEvent.change(within(dialog).getByLabelText(/^Lý do/), {
      target: { value: NOTE }
    })
    fireEvent.change(
      within(dialog).getByLabelText(/^Mã tham chiếu ngân hàng/),
      { target: { value: BANK_REFERENCE } }
    )
    expect(submit).toBeDisabled()

    fireEvent.change(within(dialog).getByLabelText('Ảnh biên lai'), {
      target: {
        files: [new File(['unc'], 'unc.pdf', { type: 'application/pdf' })]
      }
    })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await waitFor(() =>
      expect(captured.body).toEqual({
        outcome: 'SUCCESS',
        bankReference: BANK_REFERENCE,
        receiptKey: RECEIPT_KEY,
        note: NOTE
      })
    )
  })

  it('"Chi thất bại" chỉ gửi lý do; lỗi BE hiện errors[0].message và giữ dialog', { timeout: 20000 }, async () => {
    const message = 'Yêu cầu hoàn không ở trạng thái chờ chi'
    let body: unknown = null
    server.use(
      http.post('*/refunds/:id/manual-payout', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json(
          {
            success: false,
            message: 'BUSINESS_ERROR',
            detail: 'Business error',
            errors: [{ message }]
          },
          { status: 409 }
        )
      })
    )
    const drawer = await openDrawer()

    await userEvent.click(
      await within(drawer).findByRole('button', { name: /Chi thất bại/ })
    )
    const dialog = await actionDialog('Xác nhận chi hoàn thất bại')
    expect(
      within(dialog).queryByLabelText(/^Mã tham chiếu ngân hàng/)
    ).not.toBeInTheDocument()
    fireEvent.change(within(dialog).getByLabelText(/^Lý do/), {
      target: { value: NOTE }
    })
    const submit = within(dialog).getByRole('button', {
      name: 'Xác nhận chi thất bại'
    })
    await waitFor(() => expect(submit).toBeEnabled())
    await userEvent.click(submit)

    await waitFor(() =>
      expect(body).toEqual({ outcome: 'FAILED', note: NOTE })
    )
    expect(await within(dialog).findByText(message)).toBeInTheDocument()
    expect(screen.getAllByRole('dialog')).toHaveLength(2)
  })
})
