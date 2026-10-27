import { renderWithProviders } from '@/test/render'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WithdrawHistory from '../WithdrawHistory'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  getUnified: vi.fn(),
  openDetail: vi.fn(),
  hasRow: false,
  displayStatus: null as string | null,
  totalElements: 12
}))

vi.mock('@services/apiJournal', () => ({
  useGetUnifiedQuery: (params: Record<string, unknown>) => {
    mocks.getUnified(params)
    return {
      data: {
        content: mocks.hasRow
          ? [
              {
                id: 'withdraw-1',
                transactionCode: 'FW26XL3DA',
                description: 'Rút tiền về tài khoản',
                status: 'PENDING',
                displayStatus: mocks.displayStatus,
                amount: 50000,
                feeAmount: 100,
                grossAmount: 50100,
                currency: 'VND',
                paymentMethod: 'LINKED_ACCOUNT',
                createdAt: '2026-09-15T10:00:00Z'
              }
            ]
          : [],
        totalElements: mocks.totalElements,
        summary: {
          totalCount: 144,
          successCount: 109,
          processingCount: 34,
          pendingCount: 34,
          failedCount: 1
        }
      },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn()
    }
  },
  useGetWithdrawalByTransactionCodeQuery: () => ({ data: undefined }),
  useLazyGetWithdrawalByTransactionCodeQuery: () => [
    vi.fn(() => ({
      unwrap: () => Promise.resolve({ status: 'PAYING' })
    })),
    { isFetching: false }
  ]
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportTransactionsMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

vi.mock('../hooks/useHandle', () => ({
  default: () => ({
    isDetailOpen: false,
    detailData: null,
    withdrawalDetail: null,
    isDetailLoading: false,
    loadingId: undefined,
    openDetail: mocks.openDetail,
    closeDetail: vi.fn()
  })
}))

const renderScreen = () => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:EWALLET:FULL']))

  return renderWithProviders(
    <MessageProvider>
      <WithdrawHistory />
    </MessageProvider>,
    { store }
  )
}

describe('Lịch sử rút tiền — xuất CSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.hasRow = false
    mocks.displayStatus = null
    mocks.totalElements = 12
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('luôn ghim lưới về nhóm lệnh rút kể cả khi chưa chọn loại', () => {
    renderScreen()

    expect(mocks.getUnified).toHaveBeenCalledWith(
      expect.objectContaining({
        size: 10,
        transactionType: 'CASH_OUT',
        includeSummary: true
      })
    )
  })

  it('hiển thị tổng quan trạng thái do API trả về', () => {
    renderScreen()

    const summary = screen.getByRole('region', {
      name: 'Tổng quan giao dịch rút tiền'
    })

    expect(within(summary).getByText('Tổng giao dịch')).toBeInTheDocument()
    expect(within(summary).getByText('144')).toBeInTheDocument()
    expect(within(summary).getByText('109')).toBeInTheDocument()
    expect(within(summary).getByText('34')).toBeInTheDocument()
    expect(within(summary).getByText('1')).toBeInTheDocument()
  })

  it('lọc bảng theo nhóm trạng thái khi bấm số tổng quan', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByRole('button', { name: /Chờ xử lý 34/ }))

    await waitFor(() =>
      expect(mocks.getUnified).toHaveBeenLastCalledWith(
        expect.objectContaining({ status: 'PENDING' })
      )
    )
    expect(
      screen.queryByText('Đang xử lý (Chờ duyệt + Đã phê duyệt)')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Thất bại / Đã hủy')).not.toBeInTheDocument()
  })

  it('bấm Tổng giao dịch sẽ xóa riêng bộ lọc trạng thái', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByRole('button', { name: /Thất bại 1/ }))
    await user.click(screen.getByRole('button', { name: /Tổng giao dịch 144/ }))

    await waitFor(() =>
      expect(mocks.getUnified).toHaveBeenLastCalledWith(
        expect.not.objectContaining({ status: expect.anything() })
      )
    )
  })

  it('gửi từ khóa và ngày thành công vào file, kèm loại lệnh rút', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.type(screen.getByLabelText(/^Từ khóa/), ' 0962341913 ')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await user.click(screen.getByRole('button', { name: /Xuất CSV/i }))

    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith({
        type: 'CASH_OUT',
        keyword: '0962341913'
      })
    )
  })

  it('nói trước tên file dùng chung với màn Quản lý giao dịch', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.hover(screen.getByRole('button', { name: /Xuất CSV/i }))

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      /Quan-ly-giao-dich_/
    )
  })

  it('khoá nút Xuất khi chưa có bản ghi nào', () => {
    mocks.totalElements = 0
    renderScreen()

    expect(screen.getByRole('button', { name: /Xuất CSV/i })).toBeDisabled()
  })

  it('mở thẳng modal Xử lý chi tiền từ icon trong cột thao tác', async () => {
    mocks.hasRow = true
    const user = userEvent.setup()
    renderScreen()
    const action = screen.getByRole('button', {
      name: 'Xử lý chi tiền'
    })

    expect(action).toBeEnabled()
    await user.click(action)
    expect(await screen.findByText('Xử lý chi tiền')).toBeInTheDocument()
    expect(mocks.openDetail).not.toHaveBeenCalled()
    expect(screen.queryByRole('radio')).not.toBeInTheDocument()
  })

  it('ẩn nút Xử lý chi tiền khi lệnh đang chờ duyệt', () => {
    mocks.hasRow = true
    mocks.displayStatus = 'PENDING_APPROVAL'
    renderScreen()

    expect(
      screen.queryByRole('button', { name: 'Xử lý chi tiền' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Xem chi tiết' })
    ).toBeInTheDocument()
  })
})
