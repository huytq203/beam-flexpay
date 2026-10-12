import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { renderPage } from './merchantAccess.setup'

const REVIEW_BUTTON = 'Duyệt đề xuất phạm vi User Chờ Duyệt'
const REVIEWER = [
  PERMISSION.MERCHANT_USER_VIEW,
  PERMISSION.MERCHANT_USER_SCOPE_PROPOSAL_APPROVE,
  PERMISSION.MERCHANT_USER_SCOPE_PROPOSAL_REJECT
]

const mockUsers = (pendingScopeProposalId: string | null) =>
  server.use(
    http.get('*/merchant-users', () =>
      HttpResponse.json({
        data: {
          content: [
            {
              id: 'user-p',
              fullName: 'Chờ Duyệt',
              email: 'pending@example.com',
              status: 'ACTIVE',
              merchantIds: ['merchant-0142'],
              subMerchantIds: [],
              pendingScopeProposalId
            }
          ],
          totalElements: 1,
          number: 0,
          size: 20
        }
      })
    )
  )

const mockProposal = (overrides: Record<string, unknown> = {}) =>
  server.use(
    http.get('*/merchant-users/user-p/scope-proposal', () =>
      HttpResponse.json({
        data: {
          id: 'prop-1',
          merchantUserId: 'user-p',
          status: 'PENDING_APPROVAL',
          merchantIds: ['merchant-0142'],
          subMerchantIds: ['sub-hlc-north'],
          requestReason: 'Thêm chi nhánh miền Bắc',
          createdAt: '2026-10-10T17:25:00',
          outdated: false,
          ownProposal: false,
          ...overrides
        }
      })
    )
  )

describe('duyệt đề xuất phạm vi Merchant User', () => {
  it('không hiện nút duyệt khi User không có đề xuất', async () => {
    mockUsers(null)
    renderPage('/secure-panel/merchant/user', REVIEWER)
    expect(await screen.findByText('Chờ Duyệt')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: REVIEW_BUTTON })
    ).not.toBeInTheDocument()
  })

  it('không hiện nút duyệt khi thiếu quyền duyệt và từ chối', async () => {
    mockUsers('prop-1')
    renderPage('/secure-panel/merchant/user', [PERMISSION.MERCHANT_USER_VIEW])
    expect(await screen.findByText('Chờ duyệt')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: REVIEW_BUTTON })
    ).not.toBeInTheDocument()
  })

  it('duyệt: gọi approve với id đề xuất', async () => {
    const user = userEvent.setup()
    mockUsers('prop-1')
    mockProposal()
    const approved: string[] = []
    server.use(
      http.post(
        '*/merchant-users/scope-proposals/:id/approve',
        ({ params }) => {
          approved.push(String(params.id))
          return HttpResponse.json({ data: { id: params.id } })
        }
      )
    )
    renderPage('/secure-panel/merchant/user', REVIEWER)
    await user.click(await screen.findByRole('button', { name: REVIEW_BUTTON }))
    expect(
      await screen.findByText('Thêm chi nhánh miền Bắc')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Duyệt và áp dụng' }))
    await waitFor(() => expect(approved).toEqual(['prop-1']))
  })

  it('từ chối bắt buộc có lý do rồi gửi lý do lên BE', async () => {
    const user = userEvent.setup()
    mockUsers('prop-1')
    mockProposal()
    const bodies: unknown[] = []
    server.use(
      http.post(
        '*/merchant-users/scope-proposals/:id/reject',
        async ({ request }) => {
          bodies.push(await request.json())
          return HttpResponse.json({ data: { id: 'prop-1' } })
        }
      )
    )
    renderPage('/secure-panel/merchant/user', REVIEWER)
    await user.click(await screen.findByRole('button', { name: REVIEW_BUTTON }))
    await screen.findByText('Thêm chi nhánh miền Bắc')
    await user.click(screen.getByRole('button', { name: 'Từ chối' }))
    expect(await screen.findByText('Nhập lý do từ chối.')).toBeInTheDocument()
    expect(bodies).toHaveLength(0)

    await user.type(screen.getByLabelText('Lý do từ chối'), 'Sai chi nhánh')
    await user.click(screen.getByRole('button', { name: 'Từ chối' }))
    await waitFor(() => expect(bodies).toEqual([{ reason: 'Sai chi nhánh' }]))
  })

  it('người tự đề xuất không thấy nút duyệt hay từ chối', async () => {
    const user = userEvent.setup()
    mockUsers('prop-1')
    mockProposal({ ownProposal: true })
    renderPage('/secure-panel/merchant/user', REVIEWER)
    await user.click(await screen.findByRole('button', { name: REVIEW_BUTTON }))
    expect(await screen.findByText(/Bạn là người đề xuất/)).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Duyệt và áp dụng' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Từ chối' })
    ).not.toBeInTheDocument()
  })

  it('đề xuất lỗi thời chỉ cho từ chối, không cho duyệt', async () => {
    const user = userEvent.setup()
    mockUsers('prop-1')
    mockProposal({ outdated: true })
    renderPage('/secure-panel/merchant/user', REVIEWER)
    await user.click(await screen.findByRole('button', { name: REVIEW_BUTTON }))
    expect(
      await screen.findByText(/đã thay đổi từ khi đề xuất/)
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Duyệt và áp dụng' })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument()
  })
})
