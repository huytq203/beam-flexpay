import { MessageProvider } from '@hooks/useMessage'
import { renderWithProviders } from '@/test/render'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionManagement from '../TransactionManagement'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  filter: {
    transactionCode: 'TXN-001',
    transactionType: 'CASH_OUT',
    status: 'POSTED',
    fromDate: '2026-08-01T00:00:00.000',
    toDate: '2026-08-25T23:59:59.999',
    sourceDomain: '',
    paymentMethod: '',
    senderUsername: '0962341913',
    receiverUsername: ''
  } as Record<string, string>
}))

vi.mock('../hooks/useTransaction', () => ({
  default: () => ({
    filter: mocks.filter,
    dataSource: [],
    totalElements: 0,
    page: 1,
    setPage: vi.fn(),
    pageSize: 10,
    setPageSize: vi.fn(),
    isFetching: false,
    handleSearch: vi.fn(),
    canFreeze: false,
    selectedTransaction: null,
    selectedUnfreezeTransaction: null,
    unfreezeOrders: [],
    freezeTargets: [],
    openingFreezeTransactionId: undefined,
    openingUnfreezeTransactionId: undefined,
    handleOpenFreeze: vi.fn(),
    handleCloseFreeze: vi.fn(),
    handleOpenUnfreeze: vi.fn(),
    handleCloseUnfreeze: vi.fn(),
    refetch: vi.fn(),
    isLoadingGetTransaction: false
  })
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

describe('TransactionManagement export', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gửi cùng bộ filter với lưới, bao gồm senderUsername, không kèm page/size', async () => {
    renderWithProviders(
      <MessageProvider>
        <TransactionManagement />
      </MessageProvider>
    )

    await userEvent.click(screen.getByRole('button', { name: /Xuất CSV/i }))

    expect(mocks.exportFile).toHaveBeenCalledWith({
      transactionCode: 'TXN-001',
      type: 'CASH_OUT',
      status: 'POSTED',
      fromDate: '2026-08-01T00:00:00.000',
      toDate: '2026-08-25T23:59:59.999',
      senderUsername: '0962341913'
    })
  })
})
