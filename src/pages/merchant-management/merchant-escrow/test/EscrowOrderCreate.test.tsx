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
import { EscrowOrderCreateDialog } from '../components/EscrowOrderCreateDialog'
import EscrowListPage from '../pages/EscrowListPage'
import type {
  EscrowConfig,
  EscrowOrderImpact,
  EscrowOverview,
  EscrowRow
} from '../types/merchantEscrow.types'
import { escrowOverview, escrowRow, renderWithStore } from './escrow.setup'

const VIEW = PERMISSION.MERCHANT_ESCROW_VIEW
const CREATE = PERMISSION.MERCHANT_ESCROW_ORDER_CREATE
const TITLE = 'Tạo lệnh nạp ký quỹ'

const env = (data: unknown) => HttpResponse.json({ data })
const apiError = (detail: string, status = 400) =>
  HttpResponse.json(
    {
      success: false,
      message: 'MERCHANT_ESCROW_REFERENCE_DUPLICATE',
      status: '0',
      detail
    },
    { status }
  )

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

/** Cấu hình đang áp dụng tối thiểu cho dialog: chỉ đọc mức yêu cầu và hai cờ nguồn tiền. */
const config = (over: Partial<EscrowConfig> = {}) =>
  ({
    id: 'cfg-1',
    masterId: 'master-1',
    version: 1,
    requiredAmount: 50_000_000,
    allowTransfer: true,
    allowSetoff: false,
    ...over
  }) as EscrowConfig

const impact = (over: Partial<EscrowOrderImpact> = {}): EscrowOrderImpact => ({
  requiredAmount: 50_000_000,
  balanceBefore: 20_000_000,
  balanceAfter: 30_000_000,
  shortfallBefore: 30_000_000,
  shortfallAfter: 20_000_000,
  surplusAfter: 0,
  subAvailable: null,
  blockers: [],
  warnings: [],
  ...over
})

const mockOverview = (overview: EscrowOverview) =>
  server.use(
    http.get('*/merchant-escrows/master-1', () => env(overview)),
    http.get('*/sub-merchants', () =>
      HttpResponse.json(
        page([
          {
            id: 'sub-1',
            code: 'SUB001',
            name: 'Cửa hàng Một',
            status: 'ACTIVE',
            merchantId: 'master-1'
          },
          {
            id: 'sub-2',
            code: 'SUB002',
            name: 'Cửa hàng Khóa',
            status: 'INACTIVE',
            merchantId: 'master-1'
          }
        ])
      )
    )
  )

const renderDialog = () =>
  renderWithStore(
    <EscrowOrderCreateDialog
      open
      masterId='master-1'
      masterLabel='MC000001 - Công ty Alpha'
      onClose={() => {}}
    />,
    [VIEW, CREATE]
  )

/** Điền đủ nhóm chuyển khoản; ngày ghi có để mặc định hôm nay. */
const fillBankTransfer = async (
  user: ReturnType<typeof userEvent.setup>,
  dialog: HTMLElement,
  amount = '10000000'
) => {
  await user.type(within(dialog).getByLabelText('Số tiền nạp (VND)'), amount)
  await user.type(
    within(dialog).getByLabelText('Tài khoản nhận'),
    'VCB 0011001234567'
  )
  await user.type(
    within(dialog).getByLabelText('Mã tham chiếu chuyển khoản'),
    'FT26303ABC'
  )
  const input = dialog.querySelector<HTMLInputElement>('input[type="file"]')!
  await user.upload(
    input,
    new File(['%PDF'], 'sao-ke.pdf', { type: 'application/pdf' })
  )
  // Chờ tải chứng từ xong: tệp đang tải chưa có fileRef nên chưa xem tóm tắt được.
  await waitFor(() =>
    expect(
      within(dialog).queryByText('Đang tải chứng từ lên…')
    ).not.toBeInTheDocument()
  )
}

describe('Tạo lệnh nạp ký quỹ', { timeout: 30000 }, () => {
  afterEach(() => vi.restoreAllMocks())

  it('nút trên dòng: vô hiệu khi chưa cấu hình hoặc mức 0, bật khi mức > 0 và mở dialog với Master khóa', async () => {
    const rows: EscrowRow[] = [
      escrowRow(),
      escrowRow({
        masterId: 'master-2',
        code: 'MC000002',
        state: 'NOT_CONFIGURED',
        requirementMode: null,
        requiredAmount: 0
      }),
      escrowRow({
        masterId: 'master-3',
        code: 'MC000003',
        state: 'MET',
        requiredAmount: 0
      })
    ]
    server.use(
      http.get('*/merchant-escrows', () => HttpResponse.json(page(rows)))
    )
    mockOverview(escrowOverview({ current: config() }))
    const user = userEvent.setup()
    renderWithStore(<EscrowListPage />, [VIEW, CREATE])

    await screen.findByText('MC000003')
    const buttons = screen.getAllByRole('button', { name: TITLE })
    expect(buttons).toHaveLength(3)
    expect(buttons[0]).toBeEnabled()
    expect(buttons[1]).toBeDisabled()
    expect(buttons[2]).toBeDisabled()

    await user.click(buttons[0])
    const dialog = await findDialog(TITLE)
    const master = within(dialog).getByLabelText('Master Merchant')
    expect(master).toHaveValue('MC000001 - Công ty Alpha')
    expect(master).toBeDisabled()
  })

  it('không có quyền lập lệnh thì không hiện nút trên dòng', async () => {
    server.use(
      http.get('*/merchant-escrows', () =>
        HttpResponse.json(page([escrowRow()]))
      )
    )
    renderWithStore(<EscrowListPage />, [VIEW])
    await screen.findByText('MC000001')
    expect(
      screen.queryByRole('button', { name: TITLE })
    ).not.toBeInTheDocument()
  })

  it('allowTransfer=false thì không có lựa chọn chuyển khoản, mặc định trích từ Sub', async () => {
    mockOverview(
      escrowOverview({ current: config({ allowTransfer: false }) })
    )
    renderDialog()
    const dialog = await findDialog(TITLE)
    expect(
      await within(dialog).findByRole('radio', {
        name: 'Trích từ số dư doanh thu của Sub-merchant'
      })
    ).toBeChecked()
    expect(
      within(dialog).queryByRole('radio', { name: 'Chuyển khoản từ bên ngoài' })
    ).not.toBeInTheDocument()
    // Câu giữ chỗ của STT 11 phải nêu rõ.
    expect(
      within(dialog).getByText(/bị giữ chỗ ngay khi tạo lệnh/)
    ).toBeInTheDocument()
  })

  it('số dư chưa đọc được thì hiện "Chưa đọc được số dư" và khóa gửi', async () => {
    mockOverview(
      escrowOverview({
        current: config(),
        state: 'UNKNOWN',
        balance: null,
        shortfall: null,
        surplus: null,
        percent: null
      })
    )
    renderDialog()
    const dialog = await findDialog(TITLE)
    expect(
      (await within(dialog).findAllByText('Chưa đọc được số dư')).length
    ).toBeGreaterThan(0)
    expect(within(dialog).queryByText(/^0\s*₫$/)).not.toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Xem tóm tắt lệnh' })
    ).toBeDisabled()
  })

  it('luồng gửi: upload ESCROW_DEPOSIT_EVIDENCE → preview → otp-challenge → POST kèm sensitiveOtp và fileRef = stagingId', async () => {
    mockOverview(escrowOverview({ current: config() }))
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    // jsdom không đọc lại được thân multipart trong msw, nên bắt trường documentType ngay lúc dựng FormData.
    const documentTypes: unknown[] = []
    const append = FormData.prototype.append
    vi.spyOn(FormData.prototype, 'append').mockImplementation(function (
      this: FormData,
      ...args: Parameters<FormData['append']>
    ) {
      if (args[0] === 'documentType') documentTypes.push(args[1])
      return Reflect.apply(append, this, args) as void
    })
    let uploads = 0
    const challengeUrls: URL[] = []
    let created: Record<string, unknown> | undefined
    server.use(
      http.post('*/documents', () => {
        uploads += 1
        return env({ stagingId: 'stg-9' })
      }),
      http.post('*/merchant-escrow-orders/preview', () => env(impact())),
      http.post('*/merchant-escrow-orders/otp-challenge', ({ request }) => {
        challengeUrls.push(new URL(request.url))
        return env(CHALLENGE)
      }),
      http.post('*/merchant-escrow-orders', async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>
        return env({ id: 'o-1', orderCode: 'MEO1' })
      })
    )
    const user = userEvent.setup()
    renderDialog()
    const dialog = await findDialog(TITLE)
    await within(dialog).findByText(/30\.000\.000\s*₫/)
    await fillBankTransfer(user, dialog)
    await waitFor(() => expect(uploads).toBe(1))
    expect(documentTypes).toEqual(['ESCROW_DEPOSIT_EVIDENCE'])

    // Chưa xem tóm tắt thì chưa gửi được (STT 14).
    expect(
      within(dialog).getByRole('button', { name: 'Gửi phê duyệt' })
    ).toBeDisabled()
    await user.click(
      within(dialog).getByRole('button', { name: 'Xem tóm tắt lệnh' })
    )
    const summary = await within(dialog).findByRole('table', {
      name: 'Tóm tắt lệnh'
    })
    expect(
      within(summary).getByText('Phần còn thiếu sau duyệt').nextElementSibling
    ).toHaveTextContent(/20\.000\.000\s*₫/)

    await user.click(within(dialog).getByRole('button', { name: 'Gửi phê duyệt' }))
    await submitOtp(user, '123456')

    await waitFor(() => expect(created).toBeDefined())
    expect(challengeUrls[0].searchParams.get('masterId')).toBe('master-1')
    expect(created).toMatchObject({
      masterId: 'master-1',
      source: 'BANK_TRANSFER',
      amount: 10_000_000,
      receivingAccountRef: 'VCB 0011001234567',
      transferReference: 'FT26303ABC',
      subMerchantId: null,
      sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' },
      documents: [
        {
          fileRef: 'stg-9',
          fileName: 'sao-ke.pdf',
          contentType: 'application/pdf'
        }
      ]
    })
    expect(created?.creditedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        'Đã gửi lệnh nạp ký quỹ chờ phê duyệt'
      )
    )
  })

  it('nạp vượt phần còn thiếu: cảnh báo cam và bắt ghi chú trước khi xem tóm tắt', async () => {
    mockOverview(escrowOverview({ current: config() }))
    let previews = 0
    server.use(
      http.post('*/documents', () => env({ stagingId: 'stg-9' })),
      http.post('*/merchant-escrow-orders/preview', () => {
        previews += 1
        return env(impact({ surplusAfter: 10_000_000 }))
      })
    )
    const user = userEvent.setup()
    renderDialog()
    const dialog = await findDialog(TITLE)
    await within(dialog).findByText(/30\.000\.000\s*₫/)
    await fillBankTransfer(user, dialog, '40000000')

    expect(
      await within(dialog).findByText(/ký quỹ sẽ dư 10\.000\.000\s*₫/)
    ).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole('button', { name: 'Xem tóm tắt lệnh' })
    )
    expect(
      await within(dialog).findByText('Nạp vượt mức yêu cầu phải nhập ghi chú')
    ).toBeInTheDocument()
    expect(previews).toBe(0)
  })

  it('BE báo trùng mã tham chiếu thì hiện nguyên câu tiếng Việt của BE', async () => {
    mockOverview(escrowOverview({ current: config() }))
    const detail =
      'Mã tham chiếu chuyển khoản đã được dùng ở lệnh MEO0123456789AB (o-0)'
    server.use(
      http.post('*/documents', () => env({ stagingId: 'stg-9' })),
      http.post('*/merchant-escrow-orders/preview', () => apiError(detail))
    )
    const user = userEvent.setup()
    renderDialog()
    const dialog = await findDialog(TITLE)
    await within(dialog).findByText(/30\.000\.000\s*₫/)
    await fillBankTransfer(user, dialog)
    await within(dialog).findByText('sao-ke.pdf')
    await user.click(
      within(dialog).getByRole('button', { name: 'Xem tóm tắt lệnh' })
    )
    expect(await within(dialog).findByText(detail)).toBeInTheDocument()
  })

  it('trích từ Sub chỉ liệt kê Sub đang hoạt động của Master', async () => {
    mockOverview(
      escrowOverview({ current: config({ allowTransfer: false }) })
    )
    const urls: URL[] = []
    server.use(
      http.get('*/sub-merchants', ({ request }) => {
        urls.push(new URL(request.url))
        return HttpResponse.json(
          page([
            {
              id: 'sub-1',
              code: 'SUB001',
              name: 'Cửa hàng Một',
              status: 'ACTIVE',
              merchantId: 'master-1'
            },
            {
              id: 'sub-2',
              code: 'SUB002',
              name: 'Cửa hàng Khóa',
              status: 'INACTIVE',
              merchantId: 'master-1'
            }
          ])
        )
      })
    )
    const user = userEvent.setup()
    renderDialog()
    const dialog = await findDialog(TITLE)
    await user.click(await within(dialog).findByLabelText('Sub-merchant nguồn'))
    expect(await screen.findByText('SUB001 - Cửa hàng Một')).toBeInTheDocument()
    expect(screen.queryByText('SUB002 - Cửa hàng Khóa')).not.toBeInTheDocument()
    expect(urls[0].searchParams.get('merchantId')).toBe('master-1')
  })

  it('Hủy khi đã nhập dữ liệu thì hỏi xác nhận', async () => {
    mockOverview(escrowOverview({ current: config() }))
    const onClose = vi.fn()
    const user = userEvent.setup()
    renderWithStore(
      <EscrowOrderCreateDialog
        open
        masterId='master-1'
        masterLabel='MC000001 - Công ty Alpha'
        onClose={onClose}
      />,
      [VIEW, CREATE]
    )
    const dialog = await findDialog(TITLE)
    await user.type(
      await within(dialog).findByLabelText('Số tiền nạp (VND)'),
      '1000'
    )
    await user.click(within(dialog).getByRole('button', { name: 'Hủy' }))
    const confirm = await findDialog('Bỏ lệnh đang nhập?')
    expect(onClose).not.toHaveBeenCalled()
    await user.click(within(confirm).getByRole('button', { name: 'Bỏ lệnh' }))
    expect(onClose).toHaveBeenCalled()
  })
})
