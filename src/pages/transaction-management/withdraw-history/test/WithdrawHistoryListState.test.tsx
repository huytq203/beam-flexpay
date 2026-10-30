import { renderWithProviders } from '@/test/render'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@hooks/MessageProvider'
import { savePermissions } from '@slices/authSlice'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WithdrawHistory from '../WithdrawHistory'

const ROUTE = '/secure-panel/transaction-management/withdraw-history'
const STORAGE_KEY = `${LIST_STATE_PREFIX}${ROUTE}`

const mocks = vi.hoisted(() => ({
  getUnified: vi.fn(),
  exportFile: vi.fn()
}))

vi.mock('@services/apiJournal', () => ({
  useGetUnifiedQuery: (params: Record<string, unknown>) => {
    mocks.getUnified(params)
    return {
      data: { content: [], totalElements: 40, summary: undefined },
      isLoading: false,
      isFetching: false,
      refetch: vi.fn()
    }
  },
  useGetWithdrawalByTransactionCodeQuery: () => ({ data: undefined }),
  useLazyGetWithdrawalByTransactionCodeQuery: () => [
    vi.fn(),
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
    openDetail: vi.fn(),
    closeDetail: vi.fn()
  })
}))

const renderScreen = (route = ROUTE) => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:EWALLET:FULL']))
  return renderWithProviders(
    <MessageProvider>
      <WithdrawHistory />
    </MessageProvider>,
    { store, route }
  )
}

describe('Lịch sử rút tiền — giữ bộ lọc khi quay lại màn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('khôi phục từ khóa và trang từ bản sao khi URL trống', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ query: 'page=2', sensitive: { keyword: 'FW26' } })
    )
    renderScreen()

    expect(screen.getByLabelText(/^Từ khóa/)).toHaveValue('FW26')
    expect(mocks.getUnified.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        page: 2,
        size: 10,
        keyword: 'FW26',
        transactionType: 'CASH_OUT,REFUND_BANK_PAYOUT'
      })
    )
    expect(screen.getByTitle('2')).toHaveClass('ant-pagination-item-active')
  })

  it('Tìm kiếm thì về trang 1 và lưu bản sao; Xóa lọc thì bỏ bản sao', async () => {
    const user = userEvent.setup()
    renderScreen(`${ROUTE}?page=3`)

    await user.type(screen.getByLabelText(/Mã giao dịch$/), ' FW1 ')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    await waitFor(() =>
      expect(mocks.getUnified).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 1, transactionCode: 'FW1' })
      )
    )
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      query: 'transactionCode=FW1',
      sensitive: {}
    })

    await user.click(screen.getByRole('button', { name: /Xóa lọc/ }))
    await waitFor(() =>
      expect(mocks.getUnified.mock.calls.at(-1)?.[0]).not.toHaveProperty(
        'transactionCode'
      )
    )
    expect(screen.getByLabelText(/Mã giao dịch$/)).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
