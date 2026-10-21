import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useExportWalletAccounts } from '../hooks/useExportWalletAccounts'

const mocks = vi.hoisted(() => ({ exportFile: vi.fn() }))

vi.mock('@services/apiExportCsv', () => ({
  useExportWalletAccountsMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({ exportFile: mocks.exportFile, isExporting: false })
}))

describe('useExportWalletAccounts', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gửi bộ lọc đang áp, bỏ ô trống và không kèm page/size', () => {
    const { result } = renderHook(() =>
      useExportWalletAccounts({
        username: '0962341913',
        status: 'ACTIVE',
        walletType: '',
        fromDate: '2026-08-01T00:00:00.000'
      })
    )

    result.current.exportFile()

    expect(mocks.exportFile).toHaveBeenCalledWith({
      username: '0962341913',
      status: 'ACTIVE',
      fromDate: '2026-08-01T00:00:00.000'
    })
  })
})
