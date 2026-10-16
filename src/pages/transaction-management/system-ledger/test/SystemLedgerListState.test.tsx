import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SystemLedgerManagement from '../SystemLedgerManagement'

const ROUTE = '/secure-panel/transaction-management/system-ledger'
const STORAGE_KEY = `${LIST_STATE_PREFIX}${ROUTE}`

const mocks = vi.hoisted(() => ({ getLedgerEntries: vi.fn() }))

vi.mock('../services/apiSystemLedger', () => ({
  useGetLedgerEntriesQuery: (params: unknown) => {
    mocks.getLedgerEntries(params)
    return {
      data: { content: [], totalElements: 30, summary: undefined },
      isFetching: false,
      refetch: vi.fn()
    }
  }
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportLedgerEntriesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

const renderScreen = (route = ROUTE) =>
  renderWithProviders(
    <MessageProvider>
      <SystemLedgerManagement />
    </MessageProvider>,
    { route }
  )

describe('Sổ cái — giữ bộ lọc khi quay lại màn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    sessionStorage.clear()
  })

  it('khôi phục bộ lọc, ô nhạy cảm và trang từ bản sao khi URL trống', () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query: 'journalCode=JRN-1&minAmount=5000&page=2',
        sensitive: { ownerUsername: '0962341913' }
      })
    )
    renderScreen()

    expect(screen.getByLabelText(/Mã bút toán/)).toHaveValue('JRN-1')
    expect(screen.getByLabelText(/Chủ tài khoản/)).toHaveValue('0962341913')
    expect(mocks.getLedgerEntries.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        page: 2,
        size: 10,
        journalCode: 'JRN-1',
        minAmount: 5000,
        ownerUsername: '0962341913'
      })
    )
  })

  it('Tìm kiếm thì về trang 1, số điện thoại không lên URL; Xóa lọc thì bỏ bản sao', async () => {
    const user = userEvent.setup()
    renderScreen(`${ROUTE}?page=3`)

    await user.type(screen.getByLabelText(/Chủ tài khoản/), '0962341913')
    await user.type(screen.getByLabelText(/Mã tài khoản kế toán/), 'GL_1')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    await waitFor(() =>
      expect(mocks.getLedgerEntries).toHaveBeenLastCalledWith(
        expect.objectContaining({
          page: 1,
          glCode: 'GL_1',
          ownerUsername: '0962341913'
        })
      )
    )
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      query: 'glCode=GL_1',
      sensitive: { ownerUsername: '0962341913' }
    })

    await user.click(screen.getByRole('button', { name: /Xóa lọc/ }))
    await waitFor(() =>
      expect(mocks.getLedgerEntries.mock.calls.at(-1)?.[0]).not.toHaveProperty(
        'glCode'
      )
    )
    expect(screen.getByLabelText(/Mã tài khoản kế toán/)).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
