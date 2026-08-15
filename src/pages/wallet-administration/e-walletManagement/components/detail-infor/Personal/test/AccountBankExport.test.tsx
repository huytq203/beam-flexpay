import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MessageProvider } from '@/app/hooks/useMessage'
import AccountBank from '../AccountBank'

const mocks = vi.hoisted(() => ({
  exportFile: vi.fn()
}))

vi.mock('@services/apiBankLink', () => ({
  useGetBankLinksQuery: () => ({
    data: { content: [], totalElements: 0 },
    isFetching: false,
    refetch: vi.fn()
  }),
  useUnlinkBankLinkMutation: () => [vi.fn(), { isLoading: false }]
}))

vi.mock('@services/apiExportCsv', () => ({
  useExportBankLinksMutation: () => [vi.fn(), { reset: vi.fn() }]
}))

vi.mock('@hooks/useExportCsv', () => ({
  useExportCsv: () => ({
    exportFile: mocks.exportFile,
    isExporting: false
  })
}))

describe('AccountBank export', () => {
  beforeEach(() => vi.clearAllMocks())

  it('xuất CSV bằng id ví thay vì ownerId', async () => {
    render(
      <MessageProvider>
        <AccountBank
          userId='owner-1'
          walletAccountId='wallet-account-1'
        />
      </MessageProvider>
    )

    await userEvent.click(
      screen.getByRole('button', { name: /Xuất CSV/ })
    )

    expect(mocks.exportFile).toHaveBeenCalledWith({
      walletAccountId: 'wallet-account-1'
    })
  })
})
