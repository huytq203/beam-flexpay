import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import {
  CHALLENGE,
  findDialog,
  submitOtp
} from '../../merchant-gateway/key-connection/test/keyConnection.setup'
import { EscrowConfigPanel } from '../components/EscrowConfigPanel'
import { EscrowConfigProposalsPanel } from '../components/EscrowConfigProposalsPanel'
import EscrowListPage from '../pages/EscrowListPage'
import type {
  EscrowConfig,
  EscrowConfigPreview,
  EscrowOverview
} from '../types/merchantEscrow.types'
import { escrowOverview, renderWithStore } from './escrow.setup'

const VIEW = PERMISSION.MERCHANT_ESCROW_VIEW
const UPDATE = PERMISSION.MERCHANT_ESCROW_CONFIG_UPDATE
const APPROVE = PERMISSION.MERCHANT_ESCROW_CONFIG_APPROVE

const env = (data: unknown) => HttpResponse.json({ data })
const apiError = (message: string, detail: string, httpStatus: number) =>
  HttpResponse.json(
    { success: false, message, status: '0', detail },
    { status: httpStatus }
  )

/** Phiên bản cấu hình đang áp dụng: cố định 50 triệu, phiên bản 3. */
const config = (over: Partial<EscrowConfig> = {}): EscrowConfig => ({
  id: 'cfg-3',
  masterId: 'master-1',
  version: 3,
  approvalStatus: 'APPROVED',
  source: 'MANUAL',
  requirementMode: 'FIXED',
  requiredAmount: 50_000_000,
  revenueDays: null,
  minAmount: null,
  maxAmount: null,
  reviewCycle: null,
  allowTransfer: true,
  allowSetoff: false,
  setoffAcknowledged: false,
  deadlineDays: 30,
  reminderDays: 7,
  overdueAction: 'BLOCK_PAYMENTS',
  reducesProtection: false,
  reason: null,
  authorId: null,
  approverId: null,
  decisionNote: null,
  decidedAt: '2026-10-20T03:00:00Z',
  effectiveFrom: '2026-10-20T03:00:00Z',
  deadlineAt: '2026-11-19T03:00:00Z',
  createdAt: '2026-10-20T03:00:00Z',
  ...over
})

const preview = (
  over: Partial<EscrowConfigPreview> = {}
): EscrowConfigPreview => ({
  requiredAmount: 80_000_000,
  reducesProtection: false,
  needsApproval: false,
  changes: [
    {
      parameter: 'Mức ký quỹ yêu cầu',
      oldValue: '50000000',
      newValue: '80000000',
      reducesProtection: false
    }
  ],
  shortfallAfter: 60_000_000,
  surplusAfter: 0,
  affectedSubMerchants: 3,
  setoffWarning: false,
  ...over
})

/** Đếm số lần tải tổng quan để chứng minh 409 có tải lại. */
const mockOverview = (overview: EscrowOverview) => {
  const calls = { count: 0 }
  server.use(
    http.get('*/merchant-escrows/master-1', () => {
      calls.count += 1
      return env(overview)
    })
  )
  return calls
}

const openEditorAndSetAmount = async (
  user: ReturnType<typeof userEvent.setup>,
  amount: string
) => {
  await user.click(await screen.findByRole('button', { name: 'Sửa cấu hình' }))
  const input = screen.getByLabelText('Mức ký quỹ yêu cầu (VND)')
  await user.clear(input)
  await user.type(input, amount)
  await user.click(screen.getByRole('button', { name: 'Xem trước và lưu' }))
}

describe('EscrowConfigPanel', { timeout: 30000 }, () => {
  afterEach(() => vi.restoreAllMocks())

  it('preview needsApproval=true và reducesProtection=true thì bắt nhập lý do trước khi xin OTP', async () => {
    const user = userEvent.setup()
    mockOverview(escrowOverview({ current: config() }))
    let challenged = 0
    server.use(
      http.post('*/merchant-escrows/master-1/config-preview', () =>
        env(
          preview({
            requiredAmount: 30_000_000,
            reducesProtection: true,
            needsApproval: true,
            changes: [
              {
                parameter: 'Mức ký quỹ yêu cầu',
                oldValue: '50000000',
                newValue: '30000000',
                reducesProtection: true
              }
            ]
          })
        )
      ),
      http.post('*/merchant-escrows/master-1/config/otp-challenge', () => {
        challenged += 1
        return env(CHALLENGE)
      })
    )
    renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW, UPDATE])
    await openEditorAndSetAmount(user, '30000000')

    const dialog = await findDialog('Xem trước thay đổi cấu hình')
    expect(
      within(dialog).getByText('Thay đổi này cần người duyệt')
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Mức ký quỹ yêu cầu')).toBeInTheDocument()
    // Giá trị mới hiện dạng tiền ở bảng so sánh và ở dòng "Mức yêu cầu sau thay đổi".
    expect(
      within(dialog).getAllByText(/30\.000\.000\s*₫/).length
    ).toBeGreaterThan(0)
    expect(within(dialog).getByText('Giảm bảo đảm')).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: /Xin mã OTP và lưu/ })
    )
    expect(
      await within(dialog).findByText(
        'Thay đổi làm giảm mức bảo đảm phải ghi lý do'
      )
    ).toBeInTheDocument()
    expect(challenged).toBe(0)

    await user.type(
      within(dialog).getByLabelText(/Lý do giảm mức bảo đảm/),
      'Merchant đã ký phụ lục'
    )
    await user.click(
      within(dialog).getByRole('button', { name: /Xin mã OTP và lưu/ })
    )
    await findDialog('Xác nhận bằng OTP')
    expect(challenged).toBe(1)
  })

  it.each([
    ['APPLIED', 'Đã lưu và áp dụng cấu hình ký quỹ'],
    ['PENDING_APPROVAL', 'Thay đổi làm giảm mức bảo đảm, đã gửi chờ phê duyệt']
  ] as const)(
    'lưu thành công gửi PUT với expectedVersion=3 và sensitiveOtp, toast theo outcome %s',
    async (outcome, text) => {
      const user = userEvent.setup()
      const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
      mockOverview(escrowOverview({ current: config() }))
      let saved: Record<string, unknown> | undefined
      server.use(
        http.post('*/merchant-escrows/master-1/config-preview', () =>
          env(preview())
        ),
        http.post('*/merchant-escrows/master-1/config/otp-challenge', () =>
          env(CHALLENGE)
        ),
        http.put('*/merchant-escrows/master-1/config', async ({ request }) => {
          saved = (await request.json()) as Record<string, unknown>
          return env({ outcome, version: config({ version: 4 }) })
        })
      )
      renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW, UPDATE])
      await openEditorAndSetAmount(user, '80000000')
      const dialog = await findDialog('Xem trước thay đổi cấu hình')
      await user.click(
        within(dialog).getByRole('button', { name: /Xin mã OTP và lưu/ })
      )
      await submitOtp(user, '123456')

      await waitFor(() => expect(saved).toBeDefined())
      expect(saved).toMatchObject({
        expectedVersion: 3,
        requirementMode: 'FIXED',
        fixedAmount: 80_000_000,
        allowTransfer: true,
        deadlineDays: 30,
        reminderDays: 7,
        overdueAction: 'BLOCK_PAYMENTS',
        sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' }
      })
      await waitFor(() => expect(success).toHaveBeenCalledWith(text))
    }
  )

  it('PUT trả 409 thì báo lỗi, refetch overview, giữ nguyên giá trị đang nhập', async () => {
    const user = userEvent.setup()
    const calls = mockOverview(escrowOverview({ current: config() }))
    server.use(
      http.post('*/merchant-escrows/master-1/config-preview', () =>
        env(preview())
      ),
      http.post('*/merchant-escrows/master-1/config/otp-challenge', () =>
        env(CHALLENGE)
      ),
      http.put('*/merchant-escrows/master-1/config', () =>
        apiError(
          'MERCHANT_ESCROW_CONFIG_STALE',
          'Cấu hình ký quỹ vừa được người khác thay đổi; hãy xem lại giá trị mới nhất',
          409
        )
      )
    )
    renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW, UPDATE])
    await openEditorAndSetAmount(user, '80000000')
    const dialog = await findDialog('Xem trước thay đổi cấu hình')
    await user.click(
      within(dialog).getByRole('button', { name: /Xin mã OTP và lưu/ })
    )
    const before = calls.count
    await submitOtp(user, '123456')

    expect(
      await screen.findByText(/Cấu hình ký quỹ vừa được người khác thay đổi/)
    ).toBeInTheDocument()
    await waitFor(() => expect(calls.count).toBeGreaterThan(before))
    // Form vẫn mở, giữ số người dùng vừa gõ.
    expect(screen.getByLabelText('Mức ký quỹ yêu cầu (VND)')).toHaveValue(
      '80.000.000'
    )
  })

  it('cờ xác nhận cấn trừ cũ không được tick sẵn: bật lại cấn trừ phải tick mới gửi được', async () => {
    const user = userEvent.setup()
    mockOverview(
      escrowOverview({
        current: config({ allowSetoff: false, setoffAcknowledged: true })
      })
    )
    let requests = 0
    server.use(
      http.post('*/merchant-escrows/master-1/config-preview', () => {
        requests += 1
        return env(preview())
      }),
      http.post('*/merchant-escrows/master-1/config/otp-challenge', () => {
        requests += 1
        return env(CHALLENGE)
      })
    )
    renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW, UPDATE])
    await user.click(
      await screen.findByRole('button', { name: 'Sửa cấu hình' })
    )
    await user.click(
      screen.getByRole('checkbox', { name: 'Cho phép cấn trừ tại lệnh rút' })
    )
    expect(
      screen.getByRole('checkbox', {
        name: 'Đã đọc cảnh báo hệ quả của việc cấn trừ tại lệnh rút'
      })
    ).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Xem trước và lưu' }))

    expect(
      await screen.findByText(
        'Cần xác nhận đã đọc cảnh báo hệ quả của việc cấn trừ tại lệnh rút trước khi lưu'
      )
    ).toBeInTheDocument()
    expect(requests).toBe(0)
  })

  it('BE thật: preview 400 vì thiếu lý do giảm bảo đảm → nhập "Lý do thay đổi" rồi xem trước lại thành công', async () => {
    const user = userEvent.setup()
    mockOverview(escrowOverview({ current: config() }))
    const reasons: unknown[] = []
    server.use(
      http.post(
        '*/merchant-escrows/master-1/config-preview',
        async ({ request }) => {
          const body = (await request.json()) as { reason: string }
          reasons.push(body.reason)
          if (!body.reason)
            return apiError(
              'MERCHANT_ESCROW_CONFIG_INVALID',
              'Thay đổi làm giảm mức bảo đảm phải ghi lý do',
              400
            )
          return env(
            preview({
              requiredAmount: 30_000_000,
              reducesProtection: true,
              needsApproval: true
            })
          )
        }
      )
    )
    renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW, UPDATE])
    await openEditorAndSetAmount(user, '30000000')
    expect(
      await screen.findByText('Thay đổi làm giảm mức bảo đảm phải ghi lý do')
    ).toBeInTheDocument()

    await user.type(
      screen.getByLabelText(/Lý do thay đổi/),
      'Merchant đã ký phụ lục'
    )
    await user.click(screen.getByRole('button', { name: 'Xem trước và lưu' }))
    const dialog = await findDialog('Xem trước thay đổi cấu hình')
    expect(
      within(dialog).getByText('Thay đổi này cần người duyệt')
    ).toBeInTheDocument()
    expect(reasons).toEqual(['', 'Merchant đã ký phụ lục'])
  })

  it('đề xuất đang chờ: người có update thấy Hủy đề xuất, gửi POST cancel', async () => {
    const user = userEvent.setup()
    vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockOverview(
      escrowOverview({
        current: config(),
        pending: config({
          id: 'cfg-4',
          version: 4,
          approvalStatus: 'PENDING_APPROVAL',
          requiredAmount: 30_000_000,
          reducesProtection: true,
          reason: 'Phụ lục giảm mức'
        })
      })
    )
    let cancelled = false
    server.use(
      http.post('*/merchant-escrows/config-proposals/cfg-4/cancel', () => {
        cancelled = true
        return env(config({ id: 'cfg-4', approvalStatus: 'CANCELLED' }))
      })
    )
    renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW, UPDATE])
    expect(await screen.findByText('Phụ lục giảm mức')).toBeInTheDocument()
    // Đang có đề xuất chờ thì BE từ chối lưu mới, nên khóa nút sửa.
    expect(screen.getByRole('button', { name: 'Sửa cấu hình' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Hủy đề xuất' }))
    const confirm = await findDialog('Hủy đề xuất cấu hình')
    await user.click(
      within(confirm).getByRole('button', { name: /Hủy đề xuất/ })
    )
    await waitFor(() => expect(cancelled).toBe(true))
  })

  it('chỉ có quyền xem thì không thấy Sửa cấu hình và Hủy đề xuất', async () => {
    mockOverview(
      escrowOverview({
        current: config(),
        pending: config({ id: 'cfg-4', approvalStatus: 'PENDING_APPROVAL' })
      })
    )
    renderWithStore(<EscrowConfigPanel masterId='master-1' />, [VIEW])
    await screen.findByText(/Đề xuất chờ duyệt/)
    expect(screen.queryByRole('button', { name: 'Sửa cấu hình' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Hủy đề xuất' })).toBeNull()
  })
})

const proposal = config({
  id: 'cfg-4',
  version: 4,
  approvalStatus: 'PENDING_APPROVAL',
  requiredAmount: 30_000_000,
  reducesProtection: true,
  reason: 'Phụ lục giảm mức'
})

const mockPending = () =>
  server.use(
    http.get('*/merchant-escrows/config-proposals/pending', () =>
      env([proposal])
    ),
    http.get('*/merchant-escrows/master-1', () => env(escrowOverview()))
  )

describe('EscrowConfigProposalsPanel', { timeout: 30000 }, () => {
  afterEach(() => vi.restoreAllMocks())

  it('từ chối đề xuất gửi POST .../reject?note=...', async () => {
    const user = userEvent.setup()
    vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockPending()
    let rejectUrl: URL | undefined
    server.use(
      http.post(
        '*/merchant-escrows/config-proposals/cfg-4/reject',
        ({ request }) => {
          rejectUrl = new URL(request.url)
          return env({ ...proposal, approvalStatus: 'REJECTED' })
        }
      )
    )
    renderWithStore(<EscrowConfigProposalsPanel />, [VIEW, APPROVE])
    expect(
      await screen.findByText('MC000001 - Công ty Alpha')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Từ chối' }))
    const dialog = await findDialog('Từ chối đề xuất cấu hình')
    await user.type(within(dialog).getByRole('textbox'), 'Chưa có phụ lục')
    await user.click(within(dialog).getByRole('button', { name: /Từ chối/ }))

    await waitFor(() => expect(rejectUrl).toBeDefined())
    expect(rejectUrl?.searchParams.get('note')).toBe('Chưa có phụ lục')
  })

  it('duyệt đề xuất xin OTP theo id rồi gửi sensitiveOtp và ghi chú', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockPending()
    let approved: unknown
    server.use(
      http.post('*/merchant-escrows/config-proposals/cfg-4/otp-challenge', () =>
        env(CHALLENGE)
      ),
      http.post(
        '*/merchant-escrows/config-proposals/cfg-4/approve',
        async ({ request }) => {
          approved = await request.json()
          return env({ ...proposal, approvalStatus: 'APPROVED' })
        }
      )
    )
    renderWithStore(<EscrowConfigProposalsPanel />, [VIEW, APPROVE])
    await user.click(await screen.findByRole('button', { name: 'Duyệt' }))
    const dialog = await findDialog('Duyệt đề xuất cấu hình')
    await user.type(within(dialog).getByRole('textbox'), 'Đồng ý')
    await user.click(
      within(dialog).getByRole('button', { name: /Xin mã OTP và duyệt/ })
    )
    await submitOtp(user, '654321')

    await waitFor(() => expect(approved).toBeDefined())
    expect(approved).toEqual({
      note: 'Đồng ý',
      sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '654321' }
    })
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        'Đã duyệt và áp dụng cấu hình ký quỹ'
      )
    )
  })

  it('trang Ký quỹ mở mặc định tab danh sách, tab "Chờ duyệt cấu hình" hiện hàng chờ', async () => {
    const user = userEvent.setup()
    mockPending()
    server.use(
      http.get('*/merchant-escrows', () =>
        env({
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 0,
          first: true,
          last: true,
          empty: true
        })
      )
    )
    renderWithStore(<EscrowListPage />, [VIEW, APPROVE])
    expect(await screen.findByText('Bộ lọc tìm kiếm')).toBeInTheDocument()
    expect(screen.queryByText('Phụ lục giảm mức')).toBeNull()
    await user.click(screen.getByRole('tab', { name: 'Chờ duyệt cấu hình' }))
    expect(await screen.findByText('Phụ lục giảm mức')).toBeInTheDocument()
  })

  it('dialog duyệt liệt kê từng trường đổi (tắt chuyển khoản, BLOCK -> WARN_ONLY) với nhãn tiếng Việt', async () => {
    const user = userEvent.setup()
    const current = config({
      allowTransfer: true,
      overdueAction: 'BLOCK_PAYMENTS'
    })
    const sameAmountProposal = config({
      id: 'cfg-5',
      version: 5,
      approvalStatus: 'PENDING_APPROVAL',
      allowTransfer: false,
      allowSetoff: true,
      overdueAction: 'WARN_ONLY',
      reducesProtection: true,
      reason: 'Nới điều kiện'
    })
    server.use(
      http.get('*/merchant-escrows/config-proposals/pending', () =>
        env([sameAmountProposal])
      ),
      http.get('*/merchant-escrows/master-1', () =>
        env(escrowOverview({ current }))
      )
    )
    renderWithStore(<EscrowConfigProposalsPanel />, [VIEW, APPROVE])
    await user.click(await screen.findByRole('button', { name: 'Duyệt' }))
    const dialog = await findDialog('Duyệt đề xuất cấu hình')
    const table = await within(dialog).findByRole('table')
    const body = within(table)
    const transferRow = body
      .getByText('Cho phép nạp bằng chuyển khoản')
      .closest('tr')!
    expect(transferRow).toHaveTextContent('Có')
    expect(transferRow).toHaveTextContent('Không')
    expect(transferRow).toHaveTextContent('Giảm bảo đảm')
    const overdueRow = body.getByText('Xử lý khi quá hạn').closest('tr')!
    expect(overdueRow).toHaveTextContent('Chặn thanh toán')
    expect(overdueRow).toHaveTextContent('Chỉ cảnh báo')
    expect(overdueRow).toHaveTextContent('Giảm bảo đảm')
    // Mức tiền không đổi nên không được liệt kê.
    expect(body.queryByText('Mức ký quỹ yêu cầu')).toBeNull()
  })

  it('nút Duyệt ẩn với người không có MERCHANT_ESCROW_CONFIG:APPROVE', async () => {
    mockPending()
    renderWithStore(<EscrowConfigProposalsPanel />, [VIEW, UPDATE])
    expect(await screen.findByText('Phụ lục giảm mức')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Duyệt' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Từ chối' })).toBeNull()
  })
})
