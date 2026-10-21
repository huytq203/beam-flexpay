import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SystemLedgerManagement from '../SystemLedgerManagement'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  getLedgerEntries: vi.fn(),
  totalElements: 42
}))

vi.mock('@services/apiSystemLedger', () => ({
  useGetLedgerEntriesQuery: (params: unknown) => {
    mocks.getLedgerEntries(params)

    return {
      data: {
        content: [],
        totalElements: mocks.totalElements,
        summary: {
          totalCount: 863,
          debitAmount: 157817347,
          creditAmount: 148001798
        }
      },
      isFetching: false,
      refetch: vi.fn()
    }
  }
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportLedgerEntriesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

const renderScreen = () =>
  renderWithProviders(
    <MessageProvider>
      <SystemLedgerManagement />
    </MessageProvider>
  )

describe('Sổ cái — xuất CSV', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.totalElements = 42
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('nói trước rằng sổ cái chỉ có bút toán đã hạch toán thành công', () => {
    renderScreen()

    expect(
      screen.getByText(/chỉ ghi bút toán đã hạch toán thành công/i)
    ).toBeInTheDocument()
  })

  it('hiển thị tổng bút toán, tổng Nợ và tổng Có từ API', () => {
    renderScreen()

    expect(screen.getByText('863')).toBeInTheDocument()
    expect(screen.getByText('157,817,347 ₫')).toBeInTheDocument()
    expect(screen.getByText('148,001,798 ₫')).toBeInTheDocument()
  })

  it('click tổng Nợ/Có để lọc theo chiều bút toán và click Tổng để bỏ lọc', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByRole('button', { name: /Tổng Nợ/i }))
    await waitFor(() =>
      expect(mocks.getLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({ direction: 'DEBIT', includeSummary: true })
      )
    )

    await user.click(screen.getByRole('button', { name: /Tổng Có/i }))
    await waitFor(() =>
      expect(mocks.getLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({ direction: 'CREDIT', includeSummary: true })
      )
    )

    await user.click(screen.getByRole('button', { name: /Tổng bút toán/i }))
    await waitFor(() => {
      const lastPayload = mocks.getLedgerEntries.mock.calls.at(-1)?.[0]
      expect(lastPayload).not.toHaveProperty('direction')
    })
  })

  it('gửi đúng bộ lọc đang áp và bỏ các ô để trống, không kèm page/size', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.type(screen.getByLabelText(/Chủ tài khoản/), '  0962341913  ')
    await user.type(
      screen.getByLabelText(/Mã tài khoản kế toán/),
      'USER_WALLET_VND'
    )
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    await user.click(screen.getByRole('button', { name: /Xuất CSV/i }))

    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith({
        ownerUsername: '0962341913',
        glCode: 'USER_WALLET_VND'
      })
    )
  })

  it('chỉ cho chọn loại giao dịch trong bộ mã wallet-core đang trả về', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByLabelText(/Loại giao dịch/))

    expect(await screen.findByTitle('Nạp tiền')).toBeInTheDocument()
    expect(screen.getByTitle('Rút tiền')).toBeInTheDocument()
    expect(screen.queryByTitle('Bút toán đảo')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Ghi có ví')).not.toBeInTheDocument()
  })

  it('gửi mã CASH_OUT xuống API khi chọn Rút tiền', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByLabelText(/Loại giao dịch/))
    await user.click(await screen.findByTitle('Rút tiền'))
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    await waitFor(() =>
      expect(mocks.getLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({ transactionType: 'CASH_OUT' })
      )
    )
  })

  it('khoá nút Xuất khi bộ lọc vượt trần 100.000 dòng', () => {
    mocks.totalElements = 250_000
    renderScreen()

    expect(screen.getByRole('button', { name: /Xuất CSV/i })).toBeDisabled()
  })
})
