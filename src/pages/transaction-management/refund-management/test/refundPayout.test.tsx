import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { suppressAntPseudoElementWarning } from '../../../merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import {
  APPROVER,
  apiError,
  makeRefund,
  mockDetail,
  mockList,
  renderRefundPage
} from './refund.setup'

suppressAntPseudoElementWarning()

const ACCOUNTANT = [PERMISSION.PAYOUT_APPROVE]

const WAITING = makeRefund({
  id: 'p1',
  refundCode: 'RF-P1',
  channel: 'TO_BANK',
  status: 'PENDING_PAYOUT_APPROVAL',
  createdBy: 'ketoan.truong'
})

const findRow = async (code: string): Promise<HTMLElement> => {
  const row = (await screen.findByText(code)).closest('tr')
  if (!row) throw new Error('Không thấy dòng')
  return row
}

describe('duyệt chi của Kế toán', () => {
  it('hiện nhãn Chờ duyệt chi và nút duyệt chi, kể cả với người tạo', async () => {
    mockList(() => [WAITING])
    renderRefundPage(ACCOUNTANT)

    const row = await findRow('RF-P1')
    expect(within(row).getByText('Chờ duyệt chi')).toBeInTheDocument()
    expect(
      within(row).getByRole('button', { name: 'Duyệt chi RF-P1' })
    ).toBeInTheDocument()
    expect(
      within(row).getByRole('button', { name: 'Xem chi tiết RF-P1' })
    ).toBeInTheDocument()
  })

  it('chỉ có REFUND:APPROVE thì không có nút duyệt chi', async () => {
    mockList(() => [WAITING])
    renderRefundPage(APPROVER)

    const row = await findRow('RF-P1')
    expect(
      within(row).queryByRole('button', { name: 'Duyệt chi RF-P1' })
    ).not.toBeInTheDocument()
  })

  it('duyệt chi gọi payout-approve rồi đóng popover', async () => {
    let called = false
    mockList(() => [WAITING])
    server.use(
      http.post('*/refunds/p1/payout-approve', () => {
        called = true
        return HttpResponse.json({
          data: { ...WAITING, status: 'PROCESSING' }
        })
      })
    )
    renderRefundPage(ACCOUNTANT)

    const row = await findRow('RF-P1')
    await userEvent.click(
      within(row).getByRole('button', { name: 'Duyệt chi RF-P1' })
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Duyệt chi' })
    )

    await waitFor(() => expect(called).toBe(true))
  })

  it('từ chối chi gửi lý do 1 ký tự tới payout-reject', async () => {
    let body: unknown
    mockList(() => [WAITING])
    server.use(
      http.post('*/refunds/p1/payout-reject', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: { ...WAITING, status: 'REJECTED' } })
      })
    )
    renderRefundPage(ACCOUNTANT)

    const row = await findRow('RF-P1')
    await userEvent.click(
      within(row).getByRole('button', { name: 'Duyệt chi RF-P1' })
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Từ chối chi' })
    )
    const dialog = await screen.findByRole('dialog')
    await userEvent.type(within(dialog).getByRole('textbox'), 'x')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Xác nhận từ chối chi' })
    )

    await waitFor(() => expect(body).toEqual({ reason: 'x' }))
  })

  it('drawer hiện Duyệt chi và báo lỗi tiếng Việt khi BE từ chối', async () => {
    mockList(() => [WAITING])
    mockDetail(WAITING)
    server.use(
      http.post('*/refunds/p1/payout-approve', () =>
        apiError('Lệnh chi hoàn tiền vừa được xử lý bởi người khác.')
      )
    )
    renderRefundPage(ACCOUNTANT)

    await userEvent.click(
      await screen.findByRole('button', { name: 'Xem chi tiết RF-P1' })
    )
    const drawer = await screen.findByRole('dialog')
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
        'Lệnh chi hoàn tiền vừa được xử lý bởi người khác.'
      )
    ).toBeInTheDocument()
  })
})
