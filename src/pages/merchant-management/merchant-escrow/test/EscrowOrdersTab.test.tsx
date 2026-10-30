import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import EscrowDetailPage from '../pages/EscrowDetailPage'
import type {
  EscrowConfig,
  EscrowOrder,
  EscrowOrderImpact
} from '../types/merchantEscrow.types'
import { escrowOverview, renderWithStore } from './escrow.setup'

const VIEW = PERMISSION.MERCHANT_ESCROW_VIEW
const CREATE = PERMISSION.MERCHANT_ESCROW_ORDER_CREATE

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
  authorId: 'admin-1',
  approverId: null,
  decisionReason: null,
  decidedAt: null,
  failureReason: null,
  reserved: false,
  stale: true,
  createdAt: '2026-10-20T03:00:00Z',
  documents: [
    {
      fileRef: 'file-1',
      fileName: 'sao-ke.pdf',
      contentType: 'application/pdf',
      sizeBytes: 2048
    }
  ],
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

/** Trang chi tiết mở thẳng tab lệnh nạp; các tab khác không dựng nên không cần mock. */
const mockPage = (orders: EscrowOrder[]) => {
  const listUrls: URL[] = []
  server.use(
    http.get('*/merchant-escrows/master-1', () =>
      env(
        escrowOverview({
          current: {
            id: 'cfg-1',
            version: 1,
            requiredAmount: 50_000_000,
            allowTransfer: true
          } as EscrowConfig
        })
      )
    ),
    http.get('*/merchant-escrow-orders', ({ request }) => {
      listUrls.push(new URL(request.url))
      return HttpResponse.json(page(orders))
    }),
    http.get('*/sub-merchants', () =>
      HttpResponse.json(
        page([
          {
            id: 'sub-1',
            code: 'SUB001',
            name: 'Cửa hàng Một',
            status: 'ACTIVE',
            merchantId: 'master-1'
          }
        ])
      )
    )
  )
  return listUrls
}

const renderPage = (permissions: string[] = [VIEW, CREATE]) =>
  renderWithStore(
    <Routes>
      <Route
        path='/escrow/:masterId'
        element={<EscrowDetailPage />}
      />
    </Routes>,
    permissions,
    '/escrow/master-1?tab=orders'
  )

describe('Tab Lệnh nạp ký quỹ', { timeout: 30000 }, () => {
  afterEach(() => vi.restoreAllMocks())

  it('mở bằng ?tab=orders, liệt kê lệnh nạp theo masterId với nhãn tiếng Việt và cờ chờ quá 7 ngày', async () => {
    const urls = mockPage([
      order(),
      order({
        id: 'o-2',
        orderCode: 'MEO2',
        source: 'SUB_REVENUE',
        subMerchantId: 'sub-1',
        transferReference: null,
        receivingAccountRef: null,
        creditedOn: null,
        status: 'APPROVED',
        stale: false
      })
    ])
    renderPage()
    expect(await screen.findByText('MEO0123456789AB')).toBeInTheDocument()
    expect(urls[0].searchParams.get('masterId')).toBe('master-1')
    // BE (flex.merchant) bật one-indexed-parameters: trang đầu là page=1.
    expect(urls[0].searchParams.get('page')).toBe('1')
    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
    expect(screen.getByText('Đã ghi sổ')).toBeInTheDocument()
    expect(screen.getByText('Chờ quá 7 ngày')).toBeInTheDocument()
    expect(await screen.findByText('SUB001 - Cửa hàng Một')).toBeInTheDocument()
    expect(screen.getByText('29/10/2026')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Tạo lệnh nạp ký quỹ' })
    ).toBeEnabled()
  })

  it('mở drawer hiện failureReason nổi bật; bấm "Xem" chứng từ gọi read-url rồi mở tab mới', async () => {
    mockPage([order()])
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    let readUrl = ''
    server.use(
      http.get('*/merchant-escrow-orders/o-1', () =>
        env({
          order: order({
            status: 'APPROVING',
            failureReason: 'Ghi sổ thất bại: Wallet Core từ chối bút toán'
          }),
          impact
        })
      ),
      http.get(
        '*/merchant-escrow-orders/o-1/documents/file-1/read-url',
        ({ request }) => {
          readUrl = request.url
          return env({
            url: 'https://files.example/sao-ke.pdf?sig=1',
            expiresAt: '2026-10-30T10:05:00'
          })
        }
      )
    )
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByText('MEO0123456789AB'))

    const drawer = await screen.findByRole('dialog', {
      name: /Lệnh nạp MEO0123456789AB/
    })
    const alert = await within(drawer).findByRole('alert')
    expect(alert).toHaveTextContent(
      'Ghi sổ thất bại: Wallet Core từ chối bút toán'
    )
    await user.click(
      within(drawer).getByRole('button', { name: 'Xem sao-ke.pdf' })
    )
    await waitFor(() =>
      expect(open).toHaveBeenCalledWith(
        'https://files.example/sao-ke.pdf?sig=1',
        '_blank',
        'noopener'
      )
    )
    expect(readUrl).toContain('/documents/file-1/read-url')
  })

  it('read-url trả 404 thì hiện câu lỗi của BE', async () => {
    mockPage([order()])
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const detail =
      'Không tìm thấy chứng từ này trong lệnh, hoặc chứng từ được đính kèm trước khi hệ thống lưu lâu dài nên không còn mở được'
    server.use(
      http.get('*/merchant-escrow-orders/o-1', () =>
        env({ order: order(), impact })
      ),
      http.get('*/merchant-escrow-orders/o-1/documents/file-1/read-url', () =>
        HttpResponse.json(
          { success: false, message: 'DOCUMENT_NOT_FOUND', status: '0', detail },
          { status: 404 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByText('MEO0123456789AB'))
    const drawer = await screen.findByRole('dialog', {
      name: /Lệnh nạp MEO0123456789AB/
    })
    await user.click(
      await within(drawer).findByRole('button', { name: 'Xem sao-ke.pdf' })
    )
    expect(await within(drawer).findByText(detail)).toBeInTheDocument()
    expect(open).not.toHaveBeenCalled()
  })
})
