import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/useMessage'
import { screen, waitFor } from '@testing-library/react'
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
      data: { content: [], totalElements: mocks.totalElements },
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
      expect.objectContaining({ transactionType: 'CASH_OUT' })
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
