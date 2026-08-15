import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import HistoryPayment from '../HistoryPayment'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn()
}))

vi.mock('../hooks/useFetchDataHistory', () => ({
  default: () => ({
    page: 1,
    size: 10,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    dataSourceUnified: [],
    isLoadingGetUnified: false,
    dataUnified: { totalElements: 0 }
  })
}))

vi.mock('../components/HistoryFormSearch', () => ({
  default: ({
    onSearch
  }: {
    onSearch: (data: Record<string, string | null>) => void
  }) => (
    <button
      type='button'
      onClick={() => onSearch({
        transactionCode: 'TX-1',
        counterpartyUsername: 'recipient',
        sourceDomain: 'WALLET',
        status: 'SUCCESS',
        transactionType: 'TRANSFER',
        paymentMethod: 'BALANCE',
        fromDate: null,
        toDate: null
      })}
    >
      Áp dụng bộ lọc test
    </button>
  )
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportTransactionsMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({
    exportFile: mocks.exportFile,
    isExporting: false
  })
}))

describe('HistoryPayment export', () => {
  beforeEach(() => vi.clearAllMocks())

  it('chỉ gửi filter export hỗ trợ và cảnh báo filter bị bỏ qua', async () => {
    const user = userEvent.setup()
    render(<HistoryPayment ownerId='owner-1' initiatorUsername='user-1' />)

    await user.click(
      screen.getByRole('button', { name: 'Áp dụng bộ lọc test' })
    )

    const exportButton = screen.getByRole('button', { name: /Xuất CSV/ })
    await user.hover(exportButton)

    expect(
      await screen.findByText(
        'File xuất không áp dụng bộ lọc Nguồn / Phương thức thanh toán / Người nhận'
      )
    ).toBeInTheDocument()

    await user.click(exportButton)

    expect(mocks.exportFile).toHaveBeenCalledWith({
      ownerId: 'owner-1',
      transactionCode: 'TX-1',
      status: 'SUCCESS',
      type: 'TRANSFER',
      fromDate: undefined,
      toDate: undefined
    })
  })
})
