import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { suppressAntPseudoElementWarning } from '../../../merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import { getRefundActions } from '../utils/refund.utils'
import {
  APPROVER,
  apiError,
  makeRefund,
  mockDetail,
  mockList,
  renderRefundPage
} from './refund.setup'

suppressAntPseudoElementWarning()

/** Kế toán chỉ có quyền duyệt chi, không có quyền duyệt hoàn (REFUND:APPROVE). */
const ACCOUNTANT = [PERMISSION.PAYOUT_APPROVE]

const AWAITING = makeRefund({
  id: 'p1',
  refundCode: 'RF-PAYOUT-1',
  channel: 'TO_BANK',
  status: 'PENDING_PAYOUT_APPROVAL',
  // Người tạo chính là kế toán đang đăng nhập: duyệt chi không chặn người tạo (chốt 23/10).
  createdBy: 'ketoan.truong'
})

const openDrawer = async (refund = AWAITING): Promise<HTMLElement> => {
  mockDetail(refund)
  await userEvent.click(
    await screen.findByRole('button', {
      name: `Xem chi tiết ${refund.refundCode}`
    })
  )
  return screen.findByRole('dialog')
}

describe('getRefundActions: duyệt chi', () => {
  const context = {
    username: 'ketoan.truong',
    canApprove: false,
    canPayoutApprove: true,
    canSettle: false,
    canPayoutRefresh: false
  }

  it('hiện duyệt chi khi chờ duyệt chi và có quyền, kể cả với yêu cầu do chính mình tạo', () => {
    expect(getRefundActions(AWAITING, context).payoutDecide).toBe(true)
  })

  it('ẩn khi thiếu quyền duyệt chi hoặc sai trạng thái', () => {
    expect(
      getRefundActions(AWAITING, { ...context, canPayoutApprove: false })
        .payoutDecide
    ).toBe(false)
    for (const status of [
      'PENDING_APPROVAL',
      'WAITING_FUNDS',
      'PROCESSING',
      'SUCCESS',
      'REJECTED'
    ] as const) {
      expect(
        getRefundActions({ ...AWAITING, status }, context).payoutDecide
      ).toBe(false)
    }
  })

  it('quyền duyệt hoàn không tự mở duyệt chi', () => {
    const approverOnly = {
      ...context,
      canApprove: true,
      canPayoutApprove: false
    }
    const flags = getRefundActions(AWAITING, approverOnly)
    expect(flags.payoutDecide).toBe(false)
    expect(flags.decide).toBe(false)
  })
})

describe('màn Quản lý hoàn tiền: duyệt chi', () => {
  it('kế toán chỉ có quyền duyệt chi vẫn thấy danh sách, nhãn Chờ duyệt chi và mở được chi tiết', async () => {
    mockList(() => [AWAITING])
    renderRefundPage(ACCOUNTANT)

    const row = (await screen.findByText('RF-PAYOUT-1')).closest('tr')
    if (!row) throw new Error('Không thấy dòng')
    expect(within(row).getByText('Chờ duyệt chi')).toBeInTheDocument()

    const drawer = await openDrawer()
    expect(
      await within(drawer).findByRole('button', { name: 'Duyệt chi' })
    ).toBeInTheDocument()
    expect(
      within(drawer).getByRole('button', { name: 'Từ chối chi' })
    ).toBeInTheDocument()
    // Không có quyền duyệt hoàn nên không có nút duyệt/từ chối hoàn.
    expect(
      within(drawer).queryByRole('button', { name: 'Duyệt' })
    ).not.toBeInTheDocument()
  })

  it('người chỉ có quyền duyệt hoàn không thấy nút duyệt chi', async () => {
    mockList(() => [AWAITING])
    renderRefundPage(APPROVER)

    const drawer = await openDrawer()
    await within(drawer).findByText('RF-PAYOUT-1')
    expect(
      within(drawer).queryByRole('button', { name: 'Duyệt chi' })
    ).not.toBeInTheDocument()
  })

  it('duyệt chi gọi payout-approve rồi đóng hộp thoại', async () => {
    let calledWith = ''
    mockList(() => [AWAITING])
    server.use(
      http.post('*/refunds/:id/payout-approve', ({ params }) => {
        calledWith = String(params.id)
        return HttpResponse.json({
          data: { ...AWAITING, status: 'PROCESSING' }
        })
      })
    )
    renderRefundPage(ACCOUNTANT)
    const drawer = await openDrawer()
    await userEvent.click(
      await within(drawer).findByRole('button', { name: 'Duyệt chi' })
    )
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2))
    const dialog = screen.getAllByRole('dialog')[1]

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Duyệt chi' })
    )

    await waitFor(() => expect(calledWith).toBe('p1'))
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1))
  })

  it('hiện lỗi của BE và giữ hộp thoại khi duyệt chi thất bại', async () => {
    mockList(() => [AWAITING])
    server.use(
      http.post('*/refunds/:id/payout-approve', () =>
        apiError('Lệnh chi hoàn tiền vừa được xử lý bởi người khác')
      )
    )
    renderRefundPage(ACCOUNTANT)
    const drawer = await openDrawer()
    await userEvent.click(
      await within(drawer).findByRole('button', { name: 'Duyệt chi' })
    )
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2))
    const dialog = screen.getAllByRole('dialog')[1]

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Duyệt chi' })
    )

    expect(
      await within(dialog).findByText(
        'Lệnh chi hoàn tiền vừa được xử lý bởi người khác'
      )
    ).toBeInTheDocument()
    expect(screen.getAllByRole('dialog')).toHaveLength(2)
  })

  it('từ chối chi bắt buộc lý do và gửi lý do tới payout-reject', async () => {
    let body: unknown
    mockList(() => [AWAITING])
    server.use(
      http.post('*/refunds/:id/payout-reject', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({
          data: { ...AWAITING, status: 'REJECTED' }
        })
      })
    )
    renderRefundPage(ACCOUNTANT)
    const drawer = await openDrawer()
    await userEvent.click(
      await within(drawer).findByRole('button', { name: 'Từ chối chi' })
    )
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2))
    const dialog = screen.getAllByRole('dialog')[1]

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Từ chối chi' })
    )
    expect(
      await within(dialog).findByText('Vui lòng nhập lý do')
    ).toBeInTheDocument()
    expect(body).toBeUndefined()

    await userEvent.type(
      within(dialog).getByRole('textbox'),
      'Sai thông tin chi'
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Từ chối chi' })
    )

    await waitFor(() => expect(body).toEqual({ reason: 'Sai thông tin chi' }))
    await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1))
  })

  it('trên lưới chỉ có 1 icon phê duyệt chi, chọn Từ chối chi thì mở hộp thoại từ chối', async () => {
    mockList(() => [AWAITING])
    renderRefundPage(ACCOUNTANT)

    const row = (await screen.findByText('RF-PAYOUT-1')).closest('tr')
    if (!row) throw new Error('Không thấy dòng')
    expect(
      within(row).queryByRole('button', { name: 'Từ chối chi RF-PAYOUT-1' })
    ).not.toBeInTheDocument()

    await userEvent.click(
      within(row).getByRole('button', { name: 'Duyệt chi RF-PAYOUT-1' })
    )
    const popover = (
      await screen.findByText(/Chọn kết quả duyệt chi/)
    ).closest<HTMLElement>('.ant-popover')
    if (!popover) throw new Error('Không thấy popover phê duyệt chi')
    expect(
      within(popover).getByRole('button', { name: 'Duyệt chi' })
    ).toBeInTheDocument()
    await userEvent.click(
      within(popover).getByRole('button', { name: 'Từ chối chi' })
    )

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('button', { name: 'Từ chối chi' })
    ).toBeInTheDocument()
  })
})
