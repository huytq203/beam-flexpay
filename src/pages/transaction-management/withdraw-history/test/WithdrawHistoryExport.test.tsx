import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/useMessage'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import WithdrawHistory from '../WithdrawHistory'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  getUnified: vi.fn(),
  totalElements: 12
}))

vi.mock('@services/apiJournal', () => ({
  useGetUnifiedQuery: (params: Record<string, unknown>) => {
    mocks.getUnified(params)
    return {
      data: {
        content: [],
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
  }
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
    openDetail: vi.fn(),
    closeDetail: vi.fn()
  })
}))

const renderScreen = () =>
  renderWithProviders(
    <MessageProvider>
      <WithdrawHistory />
    </MessageProvider>
  )

describe('Lịch sử rút tiền — xuất CSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.totalElements = 12
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
    expect(screen.queryByText('Đang xử lý (Chờ duyệt + Đã phê duyệt)')).not.toBeInTheDocument()
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
})
