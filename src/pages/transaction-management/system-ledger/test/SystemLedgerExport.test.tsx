import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/useMessage'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SystemLedgerManagement from '../SystemLedgerManagement'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn(),
  totalElements: 42
}))

vi.mock('../services/apiSystemLedger', () => ({
  useGetLedgerEntriesQuery: () => ({
    data: { content: [], totalElements: mocks.totalElements },
    isFetching: false,
    refetch: vi.fn()
  })
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

  it('nói trước rằng sổ cái chỉ có bút toán đã hạch toán thành công', () => {
    renderScreen()

    expect(
      screen.getByText(/chỉ ghi bút toán đã hạch toán thành công/i)
    ).toBeInTheDocument()
  })

  it('gửi đúng bộ lọc đang áp và bỏ các ô để trống, không kèm page/size', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.type(
      screen.getByLabelText(/Chủ tài khoản/),
      '  0962341913  '
    )
    await user.type(screen.getByLabelText(/Mã tài khoản kế toán/), 'USER_WALLET_VND')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    await user.click(screen.getByRole('button', { name: /Xuất CSV/i }))

    await waitFor(() =>
      expect(mocks.exportFile).toHaveBeenCalledWith({
        ownerUsername: '0962341913',
        glCode: 'USER_WALLET_VND'
      })
    )
  })

  it('chỉ cho chọn loại giao dịch trong từ vựng riêng của sổ cái', async () => {
    const user = userEvent.setup()
    renderScreen()

    await user.click(screen.getByLabelText(/Loại giao dịch/))

    expect(await screen.findByTitle('Bút toán đảo')).toBeInTheDocument()
    expect(screen.queryByTitle('CASH_OUT')).not.toBeInTheDocument()
    expect(screen.queryByTitle('P2P_TRANSFER')).not.toBeInTheDocument()
  })

  it('khoá nút Xuất khi bộ lọc vượt trần 100.000 dòng', () => {
    mocks.totalElements = 250_000
    renderScreen()

    expect(screen.getByRole('button', { name: /Xuất CSV/i })).toBeDisabled()
  })
})
