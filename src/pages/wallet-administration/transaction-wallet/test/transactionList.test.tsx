import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import TransactionManagement from '../TransactionManagement'
import {
  FULL,
  FULL_ONLY_TRANSACTION,
  makeTransaction,
  renderAs
} from './transaction.setup'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'

const page = (content: UnifiedContentJournal[]) =>
  HttpResponse.json({
    data: { content, totalElements: content.length, totalPages: 1, size: 10 }
  })

const mockList = (content: UnifiedContentJournal[]) =>
  server.use(http.get('*/wallet/journal/unified', () => page(content)))

const UNAVAILABLE =
  'Không tra được danh sách giao dịch đã hoàn tiền từ dịch vụ ví người dùng, vui lòng thử lại sau'

describe('Lịch sử giao dịch — hoàn tiền', () => {
  it('lỗi 503 hiện nguyên văn detail và nút Thử lại, không phải 0 kết quả', async () => {
    let calls = 0
    server.use(
      http.get('*/wallet/journal/unified', () => {
        calls += 1
        if (calls === 1) {
          return HttpResponse.json(
            {
              success: false,
              message: 'EXTERNAL_API_UNAVAILABLE',
              detail: UNAVAILABLE,
              status: '18003'
            },
            { status: 503 }
          )
        }
        return page([makeTransaction()])
      })
    )

    renderAs(<TransactionManagement />, FULL)

    // Toast chung của errorMiddleware cũng in cùng câu detail nên có thể có hai bản.
    expect(await screen.findAllByText(UNAVAILABLE)).not.toHaveLength(0)
    expect(screen.getByRole('alert')).toHaveTextContent(UNAVAILABLE)
    expect(screen.queryByText(/Không có dữ liệu|No data|0 Bản ghi/)).toBeNull()

    await userEvent.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByText('TXN20261008000456')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('cột Số tiền đã hoàn: null hiện "-", 0 hiện 0, kèm Đang chờ hoàn khi > 0', async () => {
    mockList([
      makeTransaction({ id: 'a', transactionCode: 'TXN-NULL' }),
      makeTransaction({
        id: 'b',
        transactionCode: 'TXN-ZERO',
        refundedAmount: 0,
        pendingRefundAmount: 0,
        refunded: false
      }),
      makeTransaction({
        id: 'c',
        transactionCode: 'TXN-PENDING',
        refundedAmount: 50000,
        pendingRefundAmount: 30000,
        refunded: true
      })
    ])

    renderAs(<TransactionManagement />, FULL)

    const nullRow = (await screen.findByText('TXN-NULL')).closest('tr')
    const zeroRow = (await screen.findByText('TXN-ZERO')).closest('tr')
    const pendingRow = (await screen.findByText('TXN-PENDING')).closest('tr')
    expect(within(nullRow as HTMLElement).getByText('-')).toBeInTheDocument()
    expect(nullRow?.textContent).not.toMatch(/Đang chờ hoàn/)
    expect(zeroRow).toHaveTextContent('0 VND')
    expect(zeroRow?.textContent).not.toMatch(/Đang chờ hoàn/)
    expect(pendingRow).toHaveTextContent('50.000 VND')
    expect(pendingRow).toHaveTextContent('Đang chờ hoàn 30.000 VND')
  })

  it('hiển thị nhãn theo displayStatus: FAILED_REFUND là "Thất bại hoàn tiền"', async () => {
    mockList([
      makeTransaction({
        status: 'FAILED',
        displayStatus: 'FAILED_REFUND',
        transactionType: 'CASH_IN'
      })
    ])

    renderAs(<TransactionManagement />, FULL)

    const row = (await screen.findByText('TXN20261008000456')).closest('tr')
    expect(row).toHaveTextContent('Thất bại hoàn tiền')
  })

  it('nút Hoàn tiền: hiện với giao dịch thành công, không đóng băng, người có EWALLET:FULL', async () => {
    mockList([makeTransaction()])

    renderAs(<TransactionManagement />, FULL)

    expect(
      await screen.findByRole('button', { name: 'Hoàn tiền' })
    ).toBeInTheDocument()
  })

  it.each([
    ['đang đóng băng', { frozen: true }, FULL],
    ['chưa thành công', { status: 'PENDING' }, FULL],
    ['thiếu transactionId của wallet-core', { transactionId: null }, FULL],
    ['loại không hoàn được', { transactionType: 'REVERSAL' }, FULL],
    ['thiếu quyền EWALLET:FULL', {}, FULL_ONLY_TRANSACTION]
  ])('ẩn nút Hoàn tiền khi %s', async (_name, overrides, permissions) => {
    mockList([makeTransaction(overrides)])

    renderAs(<TransactionManagement />, permissions)

    await screen.findByText('TXN20261008000456')
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Hoàn tiền' })).toBeNull()
    )
  })
})
