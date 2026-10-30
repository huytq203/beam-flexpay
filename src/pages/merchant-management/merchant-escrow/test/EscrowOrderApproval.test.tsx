import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions, setAccessToken } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import {
  CHALLENGE,
  findDialog,
  submitOtp
} from '../../merchant-gateway/key-connection/test/keyConnection.setup'
import EscrowListPage from '../pages/EscrowListPage'
import type {
  EscrowOrder,
  EscrowOrderImpact
} from '../types/merchantEscrow.types'

const VIEW = PERMISSION.MERCHANT_ESCROW_VIEW
const APPROVE = PERMISSION.MERCHANT_ESCROW_ORDER_APPROVE
const TAB = 'Chờ duyệt lệnh nạp'

const env = (data: unknown) => HttpResponse.json({ data })
const page = (content: unknown[]) => ({
  data: {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 20,
    number: 0,
    first: true,
    last: true,
    empty: content.length === 0
  }
})

const order = (over: Partial<EscrowOrder> = {}): EscrowOrder => ({
  id: 'o-1',
  orderCode: 'MEO0123456789AB',
  masterId: 'master-1',
  source: 'BANK_TRANSFER',
  subMerchantId: null,
  amount: 10_000_000,
  receivingAccountRef: 'VCB 0011001234567',
  transferReference: 'FT26303ABC',
  creditedOn: '2026-10-29',
  note: null,
  overfundedBy: 0,
  status: 'PENDING_APPROVAL',
  authorId: 'maker-1',
  approverId: null,
  decisionReason: null,
  decidedAt: null,
  failureReason: null,
  reserved: false,
  stale: false,
  createdAt: '2026-10-20T03:00:00Z',
  documents: [],
  ...over
})

const impact: EscrowOrderImpact = {
  requiredAmount: 50_000_000,
  balanceBefore: 20_000_000,
  balanceAfter: 30_000_000,
  shortfallBefore: 30_000_000,
  shortfallAfter: 20_000_000,
  surplusAfter: 0,
  subAvailable: null,
  blockers: [],
  warnings: []
}

/** JWT giả chỉ để app đọc `sub` (người đang đăng nhập); chữ ký không được kiểm ở FE. */
const fakeToken = (sub: string) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
  return `${encode({ alg: 'none' })}.${encode({ sub, exp: 4_102_444_800 })}.x`
}

/** Dựng các endpoint nền; trả về danh sách URL gọi hàng chờ để kiểm tham số. */
const mockQueue = (orders: EscrowOrder[], detail: EscrowOrder = orders[0]) => {
  const urls: URL[] = []
  server.use(
    http.get('*/merchant-escrows', () => HttpResponse.json(page([]))),
    http.get('*/merchants', () =>
      HttpResponse.json(
        page([
          { id: 'master-1', code: 'MC000001', name: 'Công ty Alpha', status: 'ACTIVE' }
        ])
      )
    ),
    http.get('*/merchant-escrow-orders', ({ request }) => {
      urls.push(new URL(request.url))
      return HttpResponse.json(page(orders))
    }),
    http.get('*/merchant-escrow-orders/:id', () => env({ order: detail, impact }))
  )
  return urls
}

const renderQueue = async (
  permissions: string[] = [VIEW, APPROVE],
  currentUserId = 'checker-1'
) => {
  const store = createAppStore()
  store.dispatch(setAccessToken({ token: fakeToken(currentUserId) }))
  store.dispatch(savePermissions(permissions))
  const user = userEvent.setup()
  render(
    <Provider store={store}>
      <MemoryRouter>
        <EscrowListPage />
      </MemoryRouter>
    </Provider>
  )
  await user.click(await screen.findByRole('tab', { name: TAB }))
  return user
}

const openDrawer = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByText('MEO0123456789AB'))
  return screen.findByRole('dialog', { name: /Lệnh nạp MEO0123456789AB/ })
}

describe('Phê duyệt lệnh nạp ký quỹ', { timeout: 30000 }, () => {
  afterEach(() => vi.restoreAllMocks())

  it('hàng chờ mặc định gửi status=PENDING_APPROVAL, page=1; hiện tên Master, nhãn Treo lâu và cảnh báo nạp vượt mức', async () => {
    const urls = mockQueue([order({ stale: true, overfundedBy: 5_000_000 })])
    await renderQueue()
    expect(await screen.findByText('MEO0123456789AB')).toBeInTheDocument()
    expect(urls[0].searchParams.get('status')).toBe('PENDING_APPROVAL')
    expect(urls[0].searchParams.get('page')).toBe('1')
    expect(urls[0].searchParams.get('size')).toBe('20')
    expect(await screen.findByText('MC000001 - Công ty Alpha')).toBeInTheDocument()
    expect(screen.getByText('Treo lâu')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Nạp vượt mức yêu cầu 5.000.000 ₫')
    ).toBeInTheDocument()
  })

  it('Duyệt: hộp xác nhận hiện lại bảng ảnh hưởng → otp-challenge reject=false → POST approve kèm sensitiveOtp', async () => {
    mockQueue([order()])
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    const challenges: URL[] = []
    let approved: Record<string, unknown> | undefined
    server.use(
      http.post('*/merchant-escrow-orders/o-1/otp-challenge', ({ request }) => {
        challenges.push(new URL(request.url))
        return env(CHALLENGE)
      }),
      http.post('*/merchant-escrow-orders/o-1/approve', async ({ request }) => {
        approved = (await request.json()) as Record<string, unknown>
        return env(order({ status: 'APPROVING' }))
      })
    )
    const user = await renderQueue()
    const drawer = await openDrawer(user)
    await user.click(await within(drawer).findByRole('button', { name: 'Duyệt' }))

    const confirm = await findDialog('Duyệt lệnh nạp ký quỹ')
    expect(
      within(confirm).getByText('Phần còn thiếu sau duyệt').nextElementSibling
    ).toHaveTextContent(/20\.000\.000\s*₫/)
    await user.type(within(confirm).getByLabelText('Ghi chú duyệt'), 'Đã đối chiếu sao kê')
    await user.click(
      within(confirm).getByRole('button', { name: /Xin mã OTP và duyệt/ })
    )
    await submitOtp(user, '123456')

    await waitFor(() => expect(approved).toBeDefined())
    expect(challenges[0].searchParams.get('reject')).toBe('false')
    expect(approved).toEqual({
      reason: 'Đã đối chiếu sao kê',
      sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' }
    })
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith('Đã duyệt, đang ghi sổ ký quỹ')
    )
  })

  it('Từ chối: không lý do thì báo lỗi và không gọi API; có lý do → otp-challenge reject=true → POST reject', async () => {
    mockQueue([order()])
    vi.spyOn(feedback, 'success').mockImplementation(() => {})
    const challenges: URL[] = []
    let rejected: Record<string, unknown> | undefined
    server.use(
      http.post('*/merchant-escrow-orders/o-1/otp-challenge', ({ request }) => {
        challenges.push(new URL(request.url))
        return env(CHALLENGE)
      }),
      http.post('*/merchant-escrow-orders/o-1/reject', async ({ request }) => {
        rejected = (await request.json()) as Record<string, unknown>
        return env(order({ status: 'REJECTED' }))
      })
    )
    const user = await renderQueue()
    const drawer = await openDrawer(user)
    await user.click(await within(drawer).findByRole('button', { name: 'Từ chối' }))
    const dialog = await findDialog('Từ chối lệnh nạp ký quỹ')
    const submit = within(dialog).getByRole('button', {
      name: /Xin mã OTP và từ chối/
    })
    await user.click(submit)
    expect(
      await within(dialog).findByText('Cần nhập lý do từ chối')
    ).toBeInTheDocument()
    expect(challenges).toHaveLength(0)

    // Không có độ dài tối thiểu (quyết định 27/10): ba ký tự là đủ.
    await user.type(within(dialog).getByLabelText('Lý do từ chối'), 'Sai')
    await user.click(submit)
    await submitOtp(user, '654321')
    await waitFor(() => expect(rejected).toBeDefined())
    expect(challenges[0].searchParams.get('reject')).toBe('true')
    expect(rejected).toEqual({
      reason: 'Sai',
      sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '654321' }
    })
  })

  it('Trả lại để bổ sung: POST return kèm reason, không xin OTP', async () => {
    mockQueue([order()])
    vi.spyOn(feedback, 'success').mockImplementation(() => {})
    let challenged = 0
    let returned: Record<string, unknown> | undefined
    server.use(
      http.post('*/merchant-escrow-orders/o-1/otp-challenge', () => {
        challenged += 1
        return env(CHALLENGE)
      }),
      http.post('*/merchant-escrow-orders/o-1/return', async ({ request }) => {
        returned = (await request.json()) as Record<string, unknown>
        return env(order({ status: 'RETURNED' }))
      })
    )
    const user = await renderQueue()
    const drawer = await openDrawer(user)
    await user.click(
      await within(drawer).findByRole('button', { name: 'Trả lại để bổ sung' })
    )
    const dialog = await findDialog('Trả lại lệnh để bổ sung')
    const submit = within(dialog).getByRole('button', { name: 'Trả lại' })
    await user.click(submit)
    expect(
      await within(dialog).findByText('Cần nhập nội dung cần bổ sung')
    ).toBeInTheDocument()
    await user.type(
      within(dialog).getByLabelText('Nội dung cần bổ sung'),
      'Thiếu ủy nhiệm chi'
    )
    await user.click(submit)
    await waitFor(() => expect(returned).toEqual({ reason: 'Thiếu ủy nhiệm chi' }))
    expect(challenged).toBe(0)
  })

  it('BE từ chối duyệt (người khác đã xử lý) thì hiện nguyên câu tiếng Việt của BE', async () => {
    mockQueue([order()])
    const detail = 'Lệnh không còn ở trạng thái cho phép thao tác này'
    server.use(
      http.post('*/merchant-escrow-orders/o-1/otp-challenge', () => env(CHALLENGE)),
      http.post('*/merchant-escrow-orders/o-1/approve', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'MERCHANT_ESCROW_ORDER_STATE_INVALID',
            status: '0',
            detail
          },
          { status: 409 }
        )
      )
    )
    const user = await renderQueue()
    const drawer = await openDrawer(user)
    await user.click(await within(drawer).findByRole('button', { name: 'Duyệt' }))
    const confirm = await findDialog('Duyệt lệnh nạp ký quỹ')
    await user.click(
      within(confirm).getByRole('button', { name: /Xin mã OTP và duyệt/ })
    )
    await submitOtp(user, '123456')
    expect(await within(drawer).findByText(new RegExp(detail))).toBeInTheDocument()
  })

  it('người xem là người lập: hiện cảnh báo tự duyệt nhưng nút Duyệt vẫn bật', async () => {
    mockQueue([order({ authorId: 'checker-1' })])
    const user = await renderQueue([VIEW, APPROVE], 'checker-1')
    const drawer = await openDrawer(user)
    expect(
      await within(drawer).findByText(/Bạn là người lập lệnh này/)
    ).toBeInTheDocument()
    expect(within(drawer).getByRole('button', { name: 'Duyệt' })).toBeEnabled()
  })

  it('không có quyền duyệt thì không thấy nút thao tác', async () => {
    mockQueue([order()])
    const user = await renderQueue([VIEW])
    const drawer = await openDrawer(user)
    await within(drawer).findByText('Phần còn thiếu sau duyệt')
    expect(within(drawer).queryByRole('button', { name: 'Duyệt' })).toBeNull()
    expect(within(drawer).queryByRole('button', { name: 'Từ chối' })).toBeNull()
  })

  it('lệnh không ở Chờ duyệt thì không có nút thao tác', async () => {
    mockQueue([order({ status: 'APPROVED' })])
    const user = await renderQueue()
    const drawer = await openDrawer(user)
    await within(drawer).findByText('Phần còn thiếu sau duyệt')
    expect(within(drawer).queryByRole('button', { name: 'Duyệt' })).toBeNull()
    expect(
      within(drawer).queryByRole('button', { name: 'Trả lại để bổ sung' })
    ).toBeNull()
  })
})
