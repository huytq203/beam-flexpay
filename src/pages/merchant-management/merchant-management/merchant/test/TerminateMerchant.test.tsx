import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { feedback } from '@components/index'

import { createAppStore } from '@/app/store'
import { PERMISSION } from '@/app/permissions'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import MerchantManagement from '../pages/MerchantManagement'

const merchant = {
  id: 'm1',
  name: 'Công ty A',
  code: 'MC0001',
  status: 'ACTIVE',
  createdAt: '2026-09-01T08:30:00Z'
}
const reason = 'Hết hợp đồng thỏa thuận'

const mockList = (status = 'ACTIVE') =>
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [{ ...merchant, status }],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 10
        },
        success: true
      })
    ),
    http.get('*/merchants/m1/termination-obligations', () =>
      HttpResponse.json({ data: [], success: true })
    )
  )

const renderList = (codes: string[], status = 'ACTIVE') => {
  mockList(status)
  const store = createAppStore()
  store.dispatch(savePermissions(codes))
  render(
    <Provider store={store}>
      <MemoryRouter>
        <MerchantManagement />
      </MemoryRouter>
    </Provider>
  )
}

const mockChallenge = (onBody?: (body: unknown) => void) =>
  http.post('*/sensitive-operations/otp-challenge', async ({ request }) => {
    onBody?.(await request.json())
    return HttpResponse.json({
      data: {
        otpSessionId: 's1',
        maskedRecipient: '09****',
        expiresInSeconds: 120,
        canResendAfterSeconds: 30
      }
    })
  })

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  confirmation: string
) => {
  await user.click(
    await screen.findByRole('button', {
      name: 'Chấm dứt hợp tác Công ty A'
    })
  )
  await screen.findByText('Không còn nghĩa vụ tồn đọng.')
  await user.type(screen.getByLabelText('Lý do'), reason)
  await user.type(
    screen.getByLabelText('Nhập lại mã hoặc tên merchant'),
    confirmation
  )
  await user.click(screen.getByRole('button', { name: 'Gửi mã OTP' }))
}

describe('Chấm dứt hợp tác Merchant', { timeout: 20000 }, () => {
  it('xin OTP rồi chấm dứt, body có otp và hiện User bị ảnh hưởng', async () => {
    const user = userEvent.setup()
    let challengeBody: unknown
    let terminateBody: unknown
    server.use(
      mockChallenge((body) => (challengeBody = body)),
      http.post('*/merchants/m1/terminate', async ({ request }) => {
        terminateBody = await request.json()
        return HttpResponse.json({
          data: {
            subMerchantsClosed: 3,
            terminalsClosed: 4,
            credentialsRevoked: 5,
            usersScopeShrunk: 2,
            usersLeftWithoutScope: 1,
            affectedUsers: [
              { id: 'u1', email: 'a@x.vn', leftWithoutScope: true }
            ]
          }
        })
      })
    )
    renderList([
      PERMISSION.MERCHANT_API_VIEW,
      PERMISSION.MERCHANT_API_TERMINATE
    ])
    await fillForm(user, 'MC0001')
    await waitFor(() =>
      expect(challengeBody).toEqual({
        operation: 'MERCHANT_TERMINATION',
        targetId: 'm1'
      })
    )
    await user.type(await screen.findByLabelText('Mã OTP'), '123456')
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() =>
      expect(terminateBody).toEqual({
        reason,
        confirmation: 'MC0001',
        otp: { otpSessionId: 's1', otp: '123456' }
      })
    )
    expect(await screen.findByText('a@x.vn')).toBeInTheDocument()
    expect(screen.getByText('Đã đóng 3 Sub-merchant')).toBeInTheDocument()
  })

  it('chuỗi xác nhận không khớp mã hoặc tên thì không xin OTP', async () => {
    const user = userEvent.setup()
    const warning = vi.spyOn(feedback, 'warning').mockImplementation(() => {})
    let challenged = false
    server.use(
      http.post('*/sensitive-operations/otp-challenge', () => {
        challenged = true
        return HttpResponse.json({ data: {} })
      })
    )
    renderList([
      PERMISSION.MERCHANT_API_VIEW,
      PERMISSION.MERCHANT_API_TERMINATE
    ])
    await fillForm(user, 'SAI')
    expect(challenged).toBe(false)
    expect(warning).toHaveBeenCalledWith(expect.stringContaining('không khớp'))
    warning.mockRestore()
  })

  it('xác nhận theo tên merchant không phân biệt hoa thường thì xin OTP', async () => {
    const user = userEvent.setup()
    let challenged = false
    server.use(
      http.post('*/sensitive-operations/otp-challenge', () => {
        challenged = true
        return HttpResponse.json({ data: {} })
      })
    )
    renderList([
      PERMISSION.MERCHANT_API_VIEW,
      PERMISSION.MERCHANT_API_TERMINATE
    ])
    await fillForm(user, 'công ty a')
    await waitFor(() => expect(challenged).toBe(true))
  })

  it('lỗi 6011 từ BE hiện câu tiếng Việt, giữ form và không báo đã chấm dứt', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    let called = false
    server.use(
      mockChallenge(),
      http.post('*/merchants/m1/terminate', () => {
        called = true
        return HttpResponse.json(
          {
            success: false,
            status: '6011',
            message: 'MERCHANT_TERMINATION_CONFIRMATION_MISMATCH',
            detail: 'Chuỗi xác nhận không khớp merchant MC0001'
          },
          { status: 400 }
        )
      })
    )
    renderList([
      PERMISSION.MERCHANT_API_VIEW,
      PERMISSION.MERCHANT_API_TERMINATE
    ])
    await fillForm(user, 'MC0001')
    await user.type(await screen.findByLabelText('Mã OTP'), '123456')
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))
    await waitFor(() => expect(called).toBe(true))
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Chuỗi xác nhận không khớp merchant MC0001'
      )
    )
    expect(screen.queryByText('Đã chấm dứt hợp tác')).toBeNull()
    expect(screen.getByLabelText('Lý do')).toHaveValue(reason)
    expect(screen.getByLabelText('Nhập lại mã hoặc tên merchant')).toHaveValue(
      'MC0001'
    )
    error.mockRestore()
  })

  it('không render nút khi thiếu quyền hoặc merchant đã chấm dứt', async () => {
    renderList([PERMISSION.MERCHANT_API_VIEW])
    await screen.findByText('Công ty A')
    expect(
      screen.queryByRole('button', { name: 'Chấm dứt hợp tác Công ty A' })
    ).toBeNull()
  })

  it('merchant TERMINATED không có nút chấm dứt', async () => {
    renderList(
      [PERMISSION.MERCHANT_API_VIEW, PERMISSION.MERCHANT_API_TERMINATE],
      'TERMINATED'
    )
    await screen.findByText('Công ty A')
    expect(
      screen.queryByRole('button', { name: 'Chấm dứt hợp tác Công ty A' })
    ).toBeNull()
  })
})
