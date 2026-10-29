import { describe, expect, it } from 'vitest'
import {
  fireEvent,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { render } from '@testing-library/react'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import { WithdrawalDecisionPanel } from '../WithdrawalDecisionPanel'

const TRANSACTION_CODE = 'CO2609070001'
const APPROVER_PERMISSION = 'EWALLET:EWALLET:FULL'
const NOTE = 'Da doi chieu ho so khach hang va nguon tien'
const REASON = 'Tai khoan nhan khong khop ten chu the'

const withdrawal = (status: string) => ({
  id: 'withdrawal-1',
  transactionCode: TRANSACTION_CODE,
  beneficiary: null,
  status,
  amount: 14950000,
  fee: 50000,
  grossAmount: 15000000,
  failureReason: null,
  updatedBy: null,
  updatedAt: null
})

const mockWithdrawal = (status: string, extra: object = {}) => {
  server.use(
    http.get('*/withdrawals', () =>
      HttpResponse.json({ data: { ...withdrawal(status), ...extra } })
    )
  )
}

/** Lệnh rút về ngân hàng không có API: BE đánh dấu chờ admin chốt tay. */
const MANUAL_AWAITING = {
  payoutMode: 'MANUAL',
  awaitingManualConfirmation: true
}
const RECEIPT_KEY = 'receipts/CO2609070001/unc.png'
const BANK_REFERENCE = 'FT26301ABCDE'

const renderPanel = (
  permissions: string[] = [APPROVER_PERMISSION],
  transactionType = 'CASH_OUT'
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  // Gõ từng ký tự vào TextArea của antd quá chậm khi chạy cả suite song song.
  const user = userEvent.setup({ delay: null })

  render(
    <Provider store={store}>
      <MessageProvider>
        <WithdrawalDecisionPanel
          transactionCode={TRANSACTION_CODE}
          transactionType={transactionType}
        />
      </MessageProvider>
    </Provider>
  )

  return { user }
}

/** Điền ô lý do bằng một sự kiện thay vì gõ từng phím. */
const fillReason = async (label: RegExp, value: string) => {
  const field = await screen.findByLabelText(label)
  fireEvent.change(field, { target: { value } })
}

describe('WithdrawalDecisionPanel', () => {
  it('không render và không gọi API với giao dịch không phải rút tiền', () => {
    let readCount = 0
    server.use(
      http.get('*/withdrawals', () => {
        readCount += 1
        return HttpResponse.json({ data: withdrawal('POSTED') })
      })
    )

    renderPanel([APPROVER_PERMISSION], 'P2P_TRANSFER')

    expect(screen.queryByText('Lệnh rút tiền')).not.toBeInTheDocument()
    expect(readCount).toBe(0)
  })

  // it('duyệt lệnh chờ duyệt và gửi đúng ghi chú vào body', async () => {
  //   mockWithdrawal(WithdrawalStatus.PENDING_APPROVAL)
  //   let approveBody: unknown = null
  //   server.use(
  //     http.post(
  //       `*/withdrawals/${TRANSACTION_CODE}/approve`,
  //       async ({ request }) => {
  //         approveBody = await request.json()
  //         return HttpResponse.json({
  //           data: {
  //             transactionCode: TRANSACTION_CODE,
  //             previousStatus: WithdrawalStatus.PENDING_APPROVAL,
  //             newStatus: WithdrawalStatus.APPROVED
  //           }
  //         })
  //       }
  //     )
  //   )

  //   const { user } = renderPanel()

  //   await user.click(await screen.findByRole('button', { name: /Duyệt/ }))
  //   await fillReason(/Căn cứ duyệt/, NOTE)
  //   await user.click(screen.getByRole('button', { name: 'Xác nhận duyệt' }))

  //   await waitFor(() => expect(approveBody).toEqual({ note: NOTE }))
  // })

  it('từ chối lệnh và gửi đúng lý do vào body', async () => {
    mockWithdrawal(WithdrawalStatus.PENDING_APPROVAL)
    let rejectBody: unknown = null
    server.use(
      http.post(
        `*/withdrawals/${TRANSACTION_CODE}/reject`,
        async ({ request }) => {
          rejectBody = await request.json()
          return HttpResponse.json({
            data: {
              transactionCode: TRANSACTION_CODE,
              previousStatus: WithdrawalStatus.PENDING_APPROVAL,
              newStatus: WithdrawalStatus.FAILED
            }
          })
        }
      )
    )

    const { user } = renderPanel()

    await user.click(await screen.findByRole('button', { name: /Từ chối/ }))
    await fillReason(/Lý do từ chối/, REASON)
    await user.click(screen.getByRole('button', { name: 'Xác nhận từ chối' }))

    await waitFor(() => expect(rejectBody).toEqual({ reason: REASON }))
  })

  it('chặn lý do trống trước khi gọi API', async () => {
    mockWithdrawal(WithdrawalStatus.PENDING_APPROVAL)
    let rejectCount = 0
    server.use(
      http.post(`*/withdrawals/${TRANSACTION_CODE}/reject`, () => {
        rejectCount += 1
        return HttpResponse.json({ data: null })
      })
    )

    const { user } = renderPanel()

    await user.click(await screen.findByRole('button', { name: /Từ chối/ }))
    // Lý do trống thì nút xác nhận bị khóa; không còn giới hạn độ dài tối thiểu.
    expect(
      screen.getByRole('button', { name: 'Xác nhận từ chối' })
    ).toBeDisabled()
    expect(rejectCount).toBe(0)
  })

  it('không render nút quyết định khi tài khoản thiếu quyền', async () => {
    mockWithdrawal(WithdrawalStatus.PENDING_APPROVAL)

    renderPanel(['EWALLET:TRANSACTION:VIEW'])

    expect(await screen.findByText('Chờ duyệt')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Từ chối/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /^Duyệt$/ })
    ).not.toBeInTheDocument()
  })

  // it('không cho duyệt tiếp và nói rõ tiền chưa ra khi lệnh đã APPROVED', async () => {
  //   mockWithdrawal(WithdrawalStatus.APPROVED)

  //   renderPanel()

  //   expect(await screen.findByText('Đã duyệt chờ chi')).toBeInTheDocument()
  //   expect(
  //     screen.getByText(/chưa có đồng nào rời khỏi ngân hàng/i)
  //   ).toBeInTheDocument()
  //   expect(
  //     screen.queryByRole('button', { name: /^Duyệt$/ })
  //   ).not.toBeInTheDocument()
  // })

  /**
   * Payload thật từ dev (FW266QHDX, VPBank timeout). Giữ nguyên văn: nó bỏ hẳn
   * key của field rỗng (`transactionId`, `journalStatus`, `processedAt`) thay vì
   * gửi null, và `bankRefId` trùng đúng `id` của chính bản ghi — tức KHÔNG phải
   * mã ngân hàng trả về.
   */
  it('đọc đúng payload thật của lệnh chờ đối soát', async () => {
    server.use(
      http.get('*/withdrawals', () =>
        HttpResponse.json({
          data: {
            id: '3c9db383-e89c-437e-af92-0d0495cd117f',
            userId: 'c5d8f031-6e64-43ac-8a5c-794c6a43eb38',
            transactionCode: 'FW266QHDX',
            journalId: '8b96c236-b3f9-48a2-adee-4dee1e3b5fcf',
            bankRefId: '3c9db383-e89c-437e-af92-0d0495cd117f',
            amount: 50000,
            grossAmount: 50250,
            fee: 250,
            status: 'RECONCILIATION_REQUIRED',
            failureReason:
              'Payment Hub requires reconciliation: BANK_UNKNOWN: Bank outcome unknown; query-only refresh or manual reconciliation is required. VPBank Client Error: I/O error on POST request for "https://apigw-ext.dev.vpbank.com.vn/it-df-msd/uat/iapi/v1/cash-out": Read',
            updatedAt: '2026-08-26T12:37:33.957134',
            updatedBy: 'c5d8f031-6e64-43ac-8a5c-794c6a43eb38',
            beneficiary: {
              bankCode: 'VPB',
              accountNumber: '433122477',
              accountName: 'PHAM THU THAO'
            }
          }
        })
      )
    )

    const { user } = renderPanel()

    expect(await screen.findByText('Chờ đối soát')).toBeInTheDocument()
    expect(screen.getByText('Bị khoá, chờ đối soát')).toBeInTheDocument()
    expect(screen.getByText('50.250 VND')).toBeInTheDocument()

    // Không được mời duyệt một lệnh đã rời khỏi hàng chờ duyệt.
    expect(
      screen.queryByRole('button', { name: /^Duyệt$/ })
    ).not.toBeInTheDocument()

    // Chuỗi lỗi thô là bằng chứng đối soát: gập lại được nhưng không mất chữ nào.
    await user.click(screen.getByRole('button', { name: 'Xem đầy đủ' }))
    expect(
      screen.getByText(/apigw-ext\.dev\.vpbank\.com\.vn/)
    ).toBeInTheDocument()
  })

  // it('đọc lại trạng thái để báo lỗi khi người khác vừa duyệt mất', async () => {
  //   let readCount = 0
  //   server.use(
  //     http.get('*/withdrawals', () => {
  //       readCount += 1
  //       return HttpResponse.json({
  //         data: withdrawal(
  //           readCount === 1
  //             ? WithdrawalStatus.PENDING_APPROVAL
  //             : WithdrawalStatus.APPROVED
  //         )
  //       })
  //     }),
  //     http.post(`*/withdrawals/${TRANSACTION_CODE}/approve`, () =>
  //       HttpResponse.json(
  //         { success: false, message: 'BUSINESS_ERROR', detail: 'Lỗi nghiệp vụ' },
  //         { status: 400 }
  //       )
  //     )
  //   )

  //   const { user } = renderPanel()

  //   await user.click(await screen.findByRole('button', { name: /Duyệt/ }))
  //   await fillReason(/Căn cứ duyệt/, NOTE)
  //   await user.click(screen.getByRole('button', { name: 'Xác nhận duyệt' }))

  //   expect(
  //     await screen.findByText(/đã được người khác duyệt/i)
  //   ).toBeInTheDocument()
  //   // Không đổ chuỗi máy của BE ra màn hình.
  //   expect(screen.queryByText(/BUSINESS_ERROR/)).not.toBeInTheDocument()
  // })
})

describe('WithdrawalDecisionPanel — chi thủ công theo payoutMode', () => {
  const mockReceiptUpload = () =>
    server.use(
      http.post(`*/transactions/${TRANSACTION_CODE}/receipt`, () =>
        HttpResponse.json({
          data: {
            receiptKey: RECEIPT_KEY,
            contentType: 'image/png',
            sizeBytes: 12
          }
        })
      )
    )

  const captureUpdate = () => {
    const captured: { body: unknown } = { body: null }
    server.use(
      http.post(
        `*/transactions/${TRANSACTION_CODE}/update-status`,
        async ({ request }) => {
          captured.body = await request.json()
          const body = captured.body as { newStatus: string }
          return HttpResponse.json({
            success: true,
            data: {
              transactionCode: TRANSACTION_CODE,
              previousStatus: 'APPROVED',
              newStatus: body.newStatus
            }
          })
        }
      )
    )
    return captured
  }

  it('APPROVED + MANUAL: nhãn "Đã duyệt chờ chi", không câu nào nói hệ thống "đang chi"', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)

    renderPanel()

    expect(await screen.findByText('Đã duyệt chờ chi')).toBeInTheDocument()
    // Lệnh chi tay chưa đi đâu cả: mọi câu mô tả phải nói "chờ chi", không được nói "đang chi".
    expect(screen.queryByText(/đang chi/i)).not.toBeInTheDocument()
  })

  it('ô "Ảnh biên lai" trong dialog Chi thành công có dấu bắt buộc', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)

    const { user } = renderPanel()

    await user.click(
      await screen.findByRole('button', { name: /Chi thành công/ })
    )
    const dialog = await screen.findByRole('dialog')
    const label = within(dialog).getByText('Ảnh biên lai', { selector: 'span' })
    expect(label.textContent).toBe('Ảnh biên lai*')
  })

  it('APPROVED + MANUAL đang chờ chốt tay: hiện "Chi thành công" và "Chi thất bại"', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)

    renderPanel()

    expect(
      await screen.findByRole('button', { name: /Chi thành công/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Chi thất bại/ })
    ).toBeInTheDocument()
  })

  it('APPROVED + API: không có hai nút, nói rõ hệ thống đang chi qua ngân hàng', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, {
      payoutMode: 'API',
      awaitingManualConfirmation: false
    })

    renderPanel()

    expect(
      await screen.findByText(/Hệ thống đang chi qua ngân hàng/)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Chi thành công/ })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Chi thất bại/ })
    ).not.toBeInTheDocument()
  })

  it('không tự suy chế độ: thiếu awaitingManualConfirmation thì không hiện nút', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, { payoutMode: 'MANUAL' })

    renderPanel()

    expect(await screen.findByText('Đã duyệt chờ chi')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Chi thành công/ })
    ).not.toBeInTheDocument()
  })

  it('thiếu quyền thì không hiện nút chốt tay', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)

    renderPanel(['EWALLET:TRANSACTION:VIEW'])

    expect(await screen.findByText('Đã duyệt chờ chi')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /Chi thành công/ })
    ).not.toBeInTheDocument()
  })

  it('"Chi thành công" khoá nút gửi khi thiếu mã tham chiếu hoặc chưa tải UNC, đủ thì gửi update-status POSTED', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)
    mockReceiptUpload()
    const captured = captureUpdate()

    const { user } = renderPanel()

    await user.click(
      await screen.findByRole('button', { name: /Chi thành công/ })
    )
    const dialog = await screen.findByRole('dialog')
    const submit = within(dialog).getByRole('button', {
      name: 'Xác nhận chi thành công'
    })
    expect(submit).toBeDisabled()

    const reference = () =>
      within(dialog).getByLabelText(/^Mã tham chiếu ngân hàng/)
    fireEvent.change(within(dialog).getByLabelText(/^Lý do/), {
      target: { value: NOTE }
    })
    fireEvent.change(reference(), { target: { value: BANK_REFERENCE } })
    // Còn thiếu ảnh UNC.
    expect(submit).toBeDisabled()

    fireEvent.change(within(dialog).getByLabelText('Ảnh biên lai'), {
      target: {
        files: [new File(['unc'], 'unc.png', { type: 'image/png' })]
      }
    })
    await waitFor(() => expect(submit).toBeEnabled())

    // Xoá mã tham chiếu thì lại khoá.
    fireEvent.change(reference(), { target: { value: '' } })
    await waitFor(() => expect(submit).toBeDisabled())
    fireEvent.change(reference(), { target: { value: BANK_REFERENCE } })
    await waitFor(() => expect(submit).toBeEnabled())

    await user.click(submit)

    await waitFor(() =>
      expect(captured.body).toEqual({
        newStatus: 'POSTED',
        bankReference: BANK_REFERENCE,
        receiptKey: RECEIPT_KEY,
        note: NOTE
      })
    )
  })

  it('"Chi thất bại" chỉ cần lý do và gửi update-status FAILED', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)
    const captured = captureUpdate()

    const { user } = renderPanel()

    await user.click(
      await screen.findByRole('button', { name: /Chi thất bại/ })
    )
    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).queryByLabelText(/^Mã tham chiếu ngân hàng/)
    ).not.toBeInTheDocument()
    const submit = within(dialog).getByRole('button', {
      name: 'Xác nhận chi thất bại'
    })
    expect(submit).toBeDisabled()

    fireEvent.change(within(dialog).getByLabelText(/^Lý do/), {
      target: { value: REASON }
    })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    await waitFor(() =>
      expect(captured.body).toEqual({ newStatus: 'FAILED', note: REASON })
    )
  })

  it('lỗi BE hiện errors[0].message và giữ dialog', async () => {
    mockWithdrawal(WithdrawalStatus.APPROVED, MANUAL_AWAITING)
    const message =
      'Lệnh rút đang được hệ thống chi qua ngân hàng, chưa thể cập nhật tay'
    server.use(
      http.post(`*/transactions/${TRANSACTION_CODE}/update-status`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'RECONCILIATION_CONFLICT',
            detail: 'Conflict',
            errors: [{ message }]
          },
          { status: 409 }
        )
      )
    )

    const { user } = renderPanel()

    await user.click(
      await screen.findByRole('button', { name: /Chi thất bại/ })
    )
    const dialog = await screen.findByRole('dialog')
    fireEvent.change(within(dialog).getByLabelText(/^Lý do/), {
      target: { value: REASON }
    })
    const submit = within(dialog).getByRole('button', {
      name: 'Xác nhận chi thất bại'
    })
    await waitFor(() => expect(submit).toBeEnabled())
    await user.click(submit)

    expect(await within(dialog).findByText(message)).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
