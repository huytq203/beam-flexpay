import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { MessageProvider } from '@/app/hooks/useMessage'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import type { FreezeItem } from '@type/freeze.type'
import { UnfreezeRequestDialog } from '../UnfreezeRequestDialog'

const freeze = (overrides: Partial<FreezeItem> = {}): FreezeItem => ({
  id: 'freeze-1',
  accountId: 'account-1',
  sourceTransactionId: null,
  sourceTransactionCode: null,
  ownerId: 'owner-1',
  ownerType: 'USER',
  ownerUsername: '0988753731',
  amount: 50_000,
  requestedAmount: 50_000,
  releasedAmount: 0,
  remainingAmount: 50_000,
  shortfallAmount: 0,
  totalHeldAmount: 50_000,
  totalReleasedAmount: 0,
  topUpCount: 0,
  parentFreezeId: null,
  displayStatus: 'FROZEN',
  reason: 'Nghi ngờ gian lận',
  unfreezeReason: null,
  status: 'ACTIVE',
  releaseType: null,
  type: 'ADMIN_LOCK',
  createdAt: '2026-08-25T15:56:05.326622',
  createdBy: 'huytq',
  updatedAt: '2026-08-25T15:56:05.326622',
  updatedBy: 'huytq',
  unfreezeLogs: [],
  unfreezeCommandId: null,
  unfreezeCommandStatus: null,
  unfreezeCommandAmount: null,
  unfreezeCommandMakerId: null,
  unfreezeCommandReason: null,
  unfreezeCommandCreatedAt: null,
  unfreezeCommands: [],
  ...overrides
})

const renderDialog = (item: FreezeItem = freeze()) => {
  const user = userEvent.setup()
  renderWithProviders(
    <MessageProvider>
      <UnfreezeRequestDialog open item={item} onCancel={() => {}} />
    </MessageProvider>
  )
  return { user }
}

const amountInput = () => screen.getByRole('spinbutton')

describe('UnfreezeRequestDialog', () => {
  it('mặc định mở toàn bộ: số tiền khoá theo trần, không cho sửa', () => {
    renderDialog()

    expect(screen.getByRole('radio', { name: 'Mở băng toàn bộ' })).toBeChecked()
    expect(amountInput()).toBeDisabled()
    expect(amountInput()).toHaveValue('50,000')
  })

  it('chuyển sang một phần thì mở khoá ô số tiền và xoá trắng', async () => {
    const { user } = renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Mở băng một phần' }))

    await waitFor(() => expect(amountInput()).toBeEnabled())
    expect(amountInput()).toHaveValue('0')
  })

  it('trần gồm cả phần còn thiếu và nói rõ hệ quả huỷ đòi', () => {
    renderDialog(freeze({ remainingAmount: 50_000, shortfallAmount: 15_000 }))

    expect(amountInput()).toHaveValue('65,000')
    expect(screen.getByText('Còn thiếu chưa giữ được')).toBeInTheDocument()
    expect(screen.getByText('15,000 VNĐ')).toBeInTheDocument()
    expect(
      screen.getByText(/huỷ đòi phần còn thiếu/)
    ).toBeInTheDocument()
  })

  it('không cho số tiền vượt trần lọt xuống API', async () => {
    let body: Record<string, unknown> | null = null
    server.use(
      http.post('*/wallet/accounts/unfreeze', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Mở băng một phần' }))
    await waitFor(() => expect(amountInput()).toBeEnabled())
    await user.clear(amountInput())
    await user.type(amountInput(), '60000')
    await user.type(screen.getByRole('textbox'), 'Khách khiếu nại')
    await user.click(screen.getByRole('button', { name: /Gửi yêu cầu mở băng/ }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toMatchObject({ amount: 50_000 })
  })

  it('gửi đúng số tiền một phần lên endpoint mở băng theo số dư', async () => {
    let body: Record<string, unknown> | null = null
    server.use(
      http.post('*/wallet/accounts/unfreeze', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true, data: null })
      })
    )
    const { user } = renderDialog()

    await user.click(screen.getByRole('radio', { name: 'Mở băng một phần' }))
    await waitFor(() => expect(amountInput()).toBeEnabled())
    await user.clear(amountInput())
    await user.type(amountInput(), '20000')
    await user.type(screen.getByRole('textbox'), 'Khách khiếu nại')
    await user.click(screen.getByRole('button', { name: /Gửi yêu cầu mở băng/ }))

    await waitFor(() => expect(body).not.toBeNull())
    expect(body).toMatchObject({
      accountId: 'account-1',
      freezeId: 'freeze-1',
      amount: 20_000,
      reason: 'Khách khiếu nại'
    })
  })
})
