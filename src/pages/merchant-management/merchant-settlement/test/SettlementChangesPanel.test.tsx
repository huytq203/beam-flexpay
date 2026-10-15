import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import { SettlementChangesPanel } from '../components/SettlementChangesPanel'
import { cfg, renderWithStore } from './settlement.setup'

const CHANGES = '*/sub-merchants/sub-1/settlement-config/changes'
const VIEW = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW
const APPROVE = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_APPROVE

const pending = {
  id: 'chg-1',
  subMerchantId: 'sub-1',
  status: 'PENDING_APPROVAL',
  authorId: 'u-1',
  reason: 'Merchant đủ điều kiện',
  proposedRequest: { settlementMode: 'AUTOMATIC', holdbackDays: 1 },
  createdAt: '2026-10-14T03:00:00Z'
}

const mockChanges = (rows: unknown[]) =>
  server.use(http.get(CHANGES, () => HttpResponse.json({ data: rows })))

describe('SettlementChangesPanel', { timeout: 20000 }, () => {
  it('có quyền APPROVE thì duyệt gọi POST approve', async () => {
    const user = userEvent.setup()
    let approved = false
    mockChanges([pending])
    server.use(
      http.post(`${CHANGES}/chg-1/approve`, () => {
        approved = true
        return HttpResponse.json({ data: cfg() })
      })
    )
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW, APPROVE])
    await user.click(
      await screen.findByRole('button', { name: 'Duyệt đề xuất' })
    )
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Duyệt'
      })
    )
    await waitFor(() => expect(approved).toBe(true))
  })

  it('thiếu quyền APPROVE thì không render nút Duyệt và Từ chối', async () => {
    mockChanges([pending])
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW])
    await screen.findByText('Merchant đủ điều kiện')
    expect(screen.queryByRole('button', { name: 'Duyệt đề xuất' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Từ chối đề xuất' })).toBeNull()
  })

  it('từ chối kèm ghi chú gọi POST reject?note=', async () => {
    const user = userEvent.setup()
    let note: string | null = null
    mockChanges([pending])
    server.use(
      http.post(`${CHANGES}/chg-1/reject`, ({ request }) => {
        note = new URL(request.url).searchParams.get('note')
        return HttpResponse.json({ data: cfg() })
      })
    )
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW, APPROVE])
    await user.click(
      await screen.findByRole('button', { name: 'Từ chối đề xuất' })
    )
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Ghi chú'), 'Chưa đủ hồ sơ')
    await user.click(within(dialog).getByRole('button', { name: 'Từ chối' }))
    await waitFor(() => expect(note).toBe('Chưa đủ hồ sơ'))
  })

  it('lỗi 5708 hiện câu detail của BE', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    const detail =
      'Đề xuất cấu hình quyết toán không còn ở trạng thái chờ phê duyệt'
    mockChanges([pending])
    server.use(
      http.post(`${CHANGES}/chg-1/approve`, () =>
        HttpResponse.json(
          {
            success: false,
            status: '5708',
            message: 'MERCHANT_SETTLEMENT_CHANGE_NOT_PENDING',
            detail
          },
          { status: 409 }
        )
      )
    )
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW, APPROVE])
    await user.click(
      await screen.findByRole('button', { name: 'Duyệt đề xuất' })
    )
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Duyệt'
      })
    )
    await waitFor(() => expect(error).toHaveBeenCalledWith(detail))
    error.mockRestore()
  })

  it('người tạo trùng người duyệt vẫn thấy nút Duyệt', async () => {
    mockChanges([{ ...pending, authorId: 'me', approverId: 'me' }])
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW, APPROVE])
    expect(
      await screen.findByRole('button', { name: 'Duyệt đề xuất' })
    ).toBeInTheDocument()
  })

  it('đề xuất đã duyệt không còn nút thao tác', async () => {
    mockChanges([{ ...pending, status: 'APPROVED' }])
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW, APPROVE])
    await screen.findByText('Đã duyệt')
    expect(screen.queryByRole('button', { name: 'Duyệt đề xuất' })).toBeNull()
  })

  it('danh sách rỗng hiện Chưa có đề xuất', async () => {
    mockChanges([])
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW])
    expect(await screen.findByText('Chưa có đề xuất')).toBeInTheDocument()
  })

  it('lỗi tải hiện nút Thử lại', async () => {
    server.use(http.get(CHANGES, () => HttpResponse.json({}, { status: 500 })))
    renderWithStore(<SettlementChangesPanel subId='sub-1' />, [VIEW])
    expect(
      await screen.findByRole('button', { name: 'Thử lại' })
    ).toBeInTheDocument()
  })
})
