import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FreezeBalance from '../FreezeBalance'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn()
}))

vi.mock('../hooks/useFetchFreeze', () => ({
  default: () => ({
    accountId: 'wallet-account-1',
    dataFreeze: { totalElements: 0 },
    isLoadingGetFreeze: false,
    dataSource: [],
    page: 1,
    size: 10,
    setPage: vi.fn(),
    setPageSize: vi.fn(),
    isUnfreezeModalOpen: false,
    selectedFreezeItem: undefined,
    handleOpenUnfreezeModal: vi.fn(),
    handleCloseUnfreezeModal: vi.fn()
  })
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportFreezesMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({
    exportFile: mocks.exportFile,
    isExporting: false
  })
}))

describe('FreezeBalance', () => {
  beforeEach(() => vi.clearAllMocks())

  it('xuất CSV bằng accountId của ví đang xem', async () => {
    render(<FreezeBalance />)

    await userEvent.click(
      screen.getByRole('button', { name: /Xuất CSV/ })
    )

    expect(mocks.exportFile).toHaveBeenCalledWith({
      accountId: 'wallet-account-1'
    })
  })
})
