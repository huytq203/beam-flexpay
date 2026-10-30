import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { findDialog } from '../../merchant-gateway/key-connection/test/keyConnection.setup'
import { within } from '@testing-library/react'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import EscrowDetailPage from '../pages/EscrowDetailPage'
import { escrowOverview, renderWithStore } from './escrow.setup'
import type {
  EscrowConfig,
  EscrowContributionRow,
  EscrowLedgerEntry,
  EscrowOverview
} from '../types/merchantEscrow.types'

const VIEW = PERMISSION.MERCHANT_ESCROW_VIEW
const UPDATE = PERMISSION.MERCHANT_ESCROW_CONFIG_UPDATE
const ORDER_APPROVE = PERMISSION.MERCHANT_ESCROW_ORDER_APPROVE

const env = (data: unknown) => HttpResponse.json({ data })
const emptyPage = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 20,
  number: 0,
  first: true,
  last: true,
  empty: true
}

const ledgerEntry = (
  over: Partial<EscrowLedgerEntry> = {}
): EscrowLedgerEntry => ({
  id: 'l1',
  masterId: 'master-1',
  seq: 1,
  kind: 'DEPOSIT_TRANSFER',
  eventKey: 'EV-1',
  sourceType: null,
  sourceId: null,
  amountDelta: 10_000_000,
  balanceAfter: 10_000_000,
  note: null,
  createdBy: null,
  occurredAt: '2026-10-20T03:00:00Z',
  ...over
})

/** Dựng các endpoint nền; từng test ghi đè phần cần. */
const mockBase = (overview: EscrowOverview, ledger: EscrowLedgerEntry[] = []) =>
  server.use(
    http.get('*/merchant-escrows/master-1', () => env(overview)),
    http.get('*/merchant-escrows/master-1/ledger', () =>
      env({ ...emptyPage, content: ledger, totalElements: ledger.length })
    ),
    http.get('*/merchant-escrows/master-1/contributions', () => env([])),
    http.get('*/merchant-escrows/master-1/config-history', () => env([])),
    http.get('*/merchant-escrow-returns/obligation-wait/master-1', () =>
      env(90)
    )
  )

const renderPage = (permissions: string[]) =>
  renderWithStore(
    <Routes>
      <Route
        path='/escrow/:masterId'
        element={<EscrowDetailPage />}
      />
    </Routes>,
    permissions,
    '/escrow/master-1'
  )

describe('EscrowDetailPage', { timeout: 30000 }, () => {
  it('sổ cái gửi page=1 cho trang đầu (BE đánh số trang từ 1)', async () => {
    mockBase(escrowOverview())
    const urls: URL[] = []
    server.use(
      http.get('*/merchant-escrows/master-1/ledger', ({ request }) => {
        urls.push(new URL(request.url))
        return env(emptyPage)
      })
    )
    renderPage([VIEW])
    await waitFor(() => expect(urls.length).toBeGreaterThan(0))
    expect(urls[0].searchParams.get('page')).toBe('1')
  })

  it('state UNKNOWN hiện "Chưa đọc được số dư" thay vì 0 ₫', async () => {
    mockBase(
      escrowOverview({
        state: 'UNKNOWN',
        balance: null,
        shortfall: null,
        surplus: null,
        percent: null
      })
    )
    renderPage([VIEW])
    expect(
      (await screen.findAllByText('Chưa đọc được số dư')).length
    ).toBeGreaterThan(0)
    expect(screen.queryByText(/^0\s*₫$/)).not.toBeInTheDocument()
    // Ô "Số dư ký quỹ" phải đúng là ô mang nhãn UNKNOWN.
    const balanceCell = screen.getByText('Số dư ký quỹ').nextElementSibling
    expect(balanceCell).toHaveTextContent('Chưa đọc được số dư')
  })

  it('Master chưa cấu hình: có số dư, thiếu/dư/tỷ lệ null thì hiện "—" chứ không phải "Chưa đọc được số dư"', async () => {
    mockBase(
      escrowOverview({
        state: 'NOT_CONFIGURED',
        requiredAmount: 0,
        balance: 10_000_000,
        shortfall: null,
        surplus: null,
        percent: null
      })
    )
    renderPage([VIEW])
    const balanceCell = (await screen.findByText('Số dư ký quỹ'))
      .nextElementSibling
    expect(balanceCell).toHaveTextContent(/10\.000\.000\s*₫/)
    expect(screen.queryByText('Chưa đọc được số dư')).not.toBeInTheDocument()
    expect(screen.getByText('Còn thiếu').nextElementSibling).toHaveTextContent(
      '—'
    )
    expect(screen.getByText('Tỷ lệ đạt').nextElementSibling).toHaveTextContent(
      '—'
    )
  })

  it('verify sạch vẫn hiện nút Gỡ chặn hoàn trả: bấm, xác nhận trong dialog rồi gửi POST clear', async () => {
    mockBase(escrowOverview(), [ledgerEntry()])
    let cleared = false
    server.use(
      http.post('*/merchant-escrows/master-1/ledger/verify', () =>
        env({
          continuous: true,
          breaks: [],
          balance: 10_000_000,
          contributionTotal: 10_000_000,
          contributionsMatch: true
        })
      ),
      http.post('*/merchant-escrows/master-1/return-block/clear', () => {
        cleared = true
        return env(null)
      })
    )
    const user = userEvent.setup()
    renderPage([VIEW, ORDER_APPROVE])
    await user.click(await screen.findByText('Sổ cái'))
    await user.click(await screen.findByRole('button', { name: 'Kiểm tra sổ' }))
    await user.click(
      await screen.findByRole('button', { name: 'Gỡ chặn hoàn trả' })
    )
    const dialog = await findDialog('Gỡ chặn hoàn trả')
    expect(
      within(dialog).getByText(/Nếu Master đang bị chặn lập lệnh hoàn trả/)
    ).toBeInTheDocument()
    expect(cleared).toBe(false)
    await user.click(
      within(dialog).getByRole('button', { name: /Xác nhận gỡ chặn/ })
    )
    await waitFor(() => expect(cleared).toBe(true))
  })

  it('sổ cái trả 500 thì hiện cảnh báo kèm nút Thử lại', async () => {
    mockBase(escrowOverview())
    server.use(
      http.get('*/merchant-escrows/master-1/ledger', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'x',
            status: '0',
            detail: 'Lỗi máy chủ sổ cái'
          },
          { status: 500 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(await screen.findByText('Sổ cái'))
    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(/Lỗi máy chủ sổ cái|Không tải được sổ cái/)
    expect(
      within(alert).getByRole('button', { name: 'Thử lại' })
    ).toBeInTheDocument()
  })

  it('Lịch sử cấu hình: authorId hệ thống hiện "Hệ thống"', async () => {
    mockBase(escrowOverview())
    server.use(
      http.get('*/merchant-escrows/master-1/config-history', () =>
        env([
          {
            id: 'c1',
            masterId: 'master-1',
            version: 1,
            approvalStatus: 'APPROVED',
            source: 'REVIEW',
            requirementMode: 'FIXED',
            requiredAmount: 1,
            allowTransfer: true,
            allowSetoff: false,
            deadlineDays: 30,
            reminderDays: 7,
            authorId: '00000000-0000-0000-0000-000000000001',
            createdAt: '2026-10-20T03:00:00Z'
          }
        ])
      )
    )
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(await screen.findByText('Lịch sử cấu hình'))
    expect(await screen.findByText('Hệ thống')).toBeInTheDocument()
  })

  it('verify lệch đóng góp thì cảnh báo và hiện nút Gỡ chặn hoàn trả cho người có quyền', async () => {
    mockBase(escrowOverview(), [ledgerEntry()])
    server.use(
      http.post('*/merchant-escrows/master-1/ledger/verify', () =>
        env({
          continuous: true,
          breaks: [],
          balance: 10_000_000,
          contributionTotal: 9_000_000,
          contributionsMatch: false
        })
      )
    )
    const user = userEvent.setup()
    renderPage([VIEW, ORDER_APPROVE])
    await user.click(await screen.findByText('Sổ cái'))
    await user.click(await screen.findByRole('button', { name: 'Kiểm tra sổ' }))
    expect(
      await screen.findByText(/Đóng góp không khớp số dư/)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Gỡ chặn hoàn trả' })
    ).toBeInTheDocument()
  })

  it('không có quyền duyệt thì không thấy nút Gỡ chặn hoàn trả', async () => {
    mockBase(escrowOverview(), [ledgerEntry()])
    server.use(
      http.post('*/merchant-escrows/master-1/ledger/verify', () =>
        env({
          continuous: false,
          breaks: ['seq 3'],
          balance: 1,
          contributionTotal: 2,
          contributionsMatch: false
        })
      )
    )
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(await screen.findByText('Sổ cái'))
    await user.click(await screen.findByRole('button', { name: 'Kiểm tra sổ' }))
    await screen.findByText(/Đóng góp không khớp số dư/)
    expect(
      screen.queryByRole('button', { name: 'Gỡ chặn hoàn trả' })
    ).not.toBeInTheDocument()
  })

  it('sổ cái hiện số tiền âm của RETURN màu đỏ', async () => {
    mockBase(escrowOverview(), [
      ledgerEntry({ kind: 'RETURN', amountDelta: -5_000_000 })
    ])
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(await screen.findByText('Sổ cái'))
    const cell = await screen.findByText(/-5\.000\.000\s*₫/)
    expect(cell.className).toMatch(/danger/)
  })

  it('nhập 0 ngày chờ nghĩa vụ thì báo lỗi và không gọi PUT', async () => {
    mockBase(escrowOverview())
    let puts = 0
    server.use(
      http.put('*/merchant-escrow-returns/obligation-wait/master-1', () => {
        puts += 1
        return env(1)
      })
    )
    const user = userEvent.setup()
    renderPage([VIEW, UPDATE])
    await user.click(
      await screen.findByRole('tab', { name: 'Số ngày chờ nghĩa vụ' })
    )
    const input = await screen.findByRole('spinbutton', {
      name: 'Số ngày chờ nghĩa vụ'
    })
    await waitFor(() => expect(input).toHaveValue('90'))
    await user.clear(input)
    await user.type(input, '0')
    await user.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(
      await screen.findByText('Số ngày chờ nghĩa vụ phải từ 1 đến 365')
    ).toBeInTheDocument()
    expect(puts).toBe(0)
  })

  it('Đóng góp: đủ ba cột hình thức tiếng Việt và số tiền từng Sub', async () => {
    mockBase(escrowOverview())
    const row: EscrowContributionRow = {
      subMerchantId: 's1',
      subCode: 'SUB01',
      subName: 'Sub một',
      amount: 7_000_000,
      byForm: { TRANSFER: 5_000_000, SUB_REVENUE: 2_000_000 }
    }
    server.use(
      http.get('*/merchant-escrows/master-1/contributions', () => env([row]))
    )
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(await screen.findByRole('tab', { name: 'Đóng góp' }))
    for (const h of ['Chuyển khoản', 'Từ doanh thu Sub', 'Cấn trừ lệnh rút'])
      expect((await screen.findAllByText(h)).length).toBeGreaterThan(0)
    expect(await screen.findByText(/5\.000\.000\s*₫/)).toBeInTheDocument()
    expect(screen.getByText(/7\.000\.000\s*₫/)).toBeInTheDocument()
  })

  it('Đóng góp: chọn 28/10/2026 gửi asOf = cuối ngày giờ VN đổi sang UTC', async () => {
    mockBase(escrowOverview())
    const asOfs: (string | null)[] = []
    server.use(
      http.get('*/merchant-escrows/master-1/contributions', ({ request }) => {
        asOfs.push(new URL(request.url).searchParams.get('asOf'))
        return env([])
      })
    )
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(await screen.findByRole('tab', { name: 'Đóng góp' }))
    await user.type(
      await screen.findByLabelText('Tính đến hết ngày'),
      '28/10/2026{Enter}'
    )
    await waitFor(() => expect(asOfs).toContain('2026-10-28T16:59:59.999Z'))
  })

  it('Lịch sử cấu hình: hiện nhãn trạng thái và nguồn theo đặc tả', async () => {
    mockBase(escrowOverview())
    const cfg = {
      id: 'c1',
      masterId: 'master-1',
      version: 2,
      approvalStatus: 'APPROVED',
      source: 'REVIEW',
      requiredAmount: 50_000_000,
      reason: 'Soát xét quý',
      createdAt: '2026-10-01T00:00:00Z'
    } as EscrowConfig
    server.use(
      http.get('*/merchant-escrows/master-1/config-history', () => env([cfg]))
    )
    const user = userEvent.setup()
    renderPage([VIEW])
    await user.click(
      await screen.findByRole('tab', { name: 'Lịch sử cấu hình' })
    )
    expect(await screen.findByText('Đã áp dụng')).toBeInTheDocument()
    expect(
      screen.getByText('Do job soát xét định kỳ đề xuất')
    ).toBeInTheDocument()
  })
})
