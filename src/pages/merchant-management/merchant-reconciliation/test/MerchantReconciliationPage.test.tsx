import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import {
  CHALLENGE,
  findDialog,
  submitOtp
} from '../../merchant-gateway/key-connection/test/keyConnection.setup'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import MerchantReconciliationPage from '../pages/MerchantReconciliationPage'
import {
  BASE,
  SUB_ID,
  apiError,
  mockPauses,
  mockSubDetail,
  result
} from './reconciliation.setup'

const VIEW = PERMISSION.MERCHANT_RECONCILIATION_VIEW
const CONFIRM = PERMISSION.MERCHANT_RECONCILIATION_CONFIRM
const CAUSE = '  Lệnh nạp ký quỹ bị ghi trùng do lỗi job  '
const TREATMENT = '  Kế toán đã đảo bút toán trùng  '

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  const dialog = await findDialog('Xác nhận đã xử lý tạm dừng quyết toán')
  await user.type(within(dialog).getByLabelText(/Nguyên nhân gây lệch/), CAUSE)
  await user.type(within(dialog).getByLabelText(/Cách đã xử lý/), TREATMENT)
  await user.click(
    within(dialog).getByRole('button', { name: /Xin mã OTP và xác nhận/ })
  )
  return dialog
}

describe('MerchantReconciliationPage', { timeout: 30000 }, () => {
  it('danh sách tạm dừng có cột #, tra tên Sub và nhãn leo thang', async () => {
    mockSubDetail()
    mockPauses()
    renderWithStore(<MerchantReconciliationPage />, [VIEW])
    const table = await screen.findByRole('table')
    expect(within(table).getAllByText('#').length).toBeGreaterThan(0)
    expect(
      await within(table).findByText('SM0001 — Cửa hàng Quận 1')
    ).toBeInTheDocument()
    expect(within(table).getByText('Quá 24 giờ')).toBeInTheDocument()
    expect(within(table).getByText(/lệch 200000/)).toBeInTheDocument()
  })

  it('chỉ có quyền xem thì ẩn nút Xác nhận đã xử lý', async () => {
    mockSubDetail()
    mockPauses()
    renderWithStore(<MerchantReconciliationPage />, [VIEW])
    await screen.findByText('Quá 24 giờ')
    expect(
      screen.queryByRole('button', { name: /Xác nhận đã xử lý/ })
    ).toBeNull()
  })

  it('không có quyền nào thì không hiện màn', () => {
    renderWithStore(<MerchantReconciliationPage />, [])
    expect(screen.queryByText('Đối soát số dư')).toBeNull()
  })

  it('ghi chú quá ngắn bị chặn ở FE, không xin OTP', async () => {
    const user = userEvent.setup()
    mockSubDetail()
    mockPauses()
    let challenged = false
    server.use(
      http.post(
        `${BASE}/sub-merchants/${SUB_ID}/confirm-handled/otp-challenge`,
        () => {
          challenged = true
          return HttpResponse.json({ data: CHALLENGE })
        }
      )
    )
    renderWithStore(<MerchantReconciliationPage />, [CONFIRM])
    await user.click(
      await screen.findByRole('button', { name: /Xác nhận đã xử lý/ })
    )
    const dialog = await findDialog('Xác nhận đã xử lý tạm dừng quyết toán')
    await user.type(
      within(dialog).getByLabelText(/Nguyên nhân gây lệch/),
      'ngắn'
    )
    await user.click(
      within(dialog).getByRole('button', { name: /Xin mã OTP và xác nhận/ })
    )
    expect((await within(dialog).findAllByRole('alert')).length).toBe(2)
    expect(challenged).toBe(false)
  })

  it('xin OTP không body rồi gửi cause/treatment đã trim kèm sensitiveOtp, báo thành công', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockSubDetail()
    mockPauses()
    let challengeBody: string | undefined
    let confirmBody: unknown
    server.use(
      http.post(
        `${BASE}/sub-merchants/${SUB_ID}/confirm-handled/otp-challenge`,
        async ({ request }) => {
          challengeBody = await request.text()
          return HttpResponse.json({ data: CHALLENGE })
        }
      ),
      http.post(
        `${BASE}/sub-merchants/${SUB_ID}/confirm-handled`,
        async ({ request }) => {
          confirmBody = await request.json()
          return HttpResponse.json({
            data: result({ trigger: 'RECHECK', result: 'BALANCED' })
          })
        }
      )
    )
    renderWithStore(<MerchantReconciliationPage />, [CONFIRM])
    await user.click(
      await screen.findByRole('button', { name: /Xác nhận đã xử lý/ })
    )
    await fillForm(user)
    await submitOtp(user, '123456')

    await waitFor(() => expect(confirmBody).toBeDefined())
    expect(challengeBody).toBe('')
    expect(confirmBody).toEqual({
      cause: CAUSE.trim(),
      treatment: TREATMENT.trim(),
      sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' }
    })
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        'Đã xác nhận xử lý và gỡ tạm dừng quyết toán'
      )
    )
    success.mockRestore()
  })

  it('đối soát vẫn lệch (409) hiện detail của BE và nhắc xin OTP mới', async () => {
    const user = userEvent.setup()
    mockSubDetail()
    mockPauses()
    server.use(
      http.post(
        `${BASE}/sub-merchants/${SUB_ID}/confirm-handled/otp-challenge`,
        () => HttpResponse.json({ data: CHALLENGE })
      ),
      http.post(`${BASE}/sub-merchants/${SUB_ID}/confirm-handled`, () =>
        apiError(
          'MERCHANT_RECONCILIATION_STILL_OFF',
          '(1) Số dư khả dụng: lệch 200000',
          409
        )
      )
    )
    renderWithStore(<MerchantReconciliationPage />, [CONFIRM])
    await user.click(
      await screen.findByRole('button', { name: /Xác nhận đã xử lý/ })
    )
    const form = await fillForm(user)
    await submitOtp(user, '123456')

    const alert = await within(form).findByRole('alert', {}, { timeout: 8000 })
    expect(alert).toHaveTextContent('hãy xin mã OTP mới')
  })
})
