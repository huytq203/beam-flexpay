import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { suppressAntPseudoElementWarning } from '../../../merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import type { RefundDetail } from '../schemas/refund.schema'
import {
  APPROVER,
  FULL,
  apiError,
  makeRefund,
  mockDetail,
  mockList,
  renderRefundPage,
  toPage
} from './refund.setup'

suppressAntPseudoElementWarning()

const PENDING = makeRefund({
  id: 'r1',
  refundCode: 'RF-R1',
  createdBy: 'ketoan.a'
})

const clickRowAction = async (code: string, name: string): Promise<void> => {
  const row = (await screen.findByText(code)).closest('tr')
  if (!row) throw new Error('Không thấy dòng')
  await userEvent.click(
    within(row).getByRole('button', { name: `${name} ${code}` })
  )
}

/** Duyệt/Từ chối chỉ có ở drawer vì danh sách BE không trả `createdBy`. */
const openDrawerDialog = async (
  refund: RefundDetail,
  action: string
): Promise<HTMLElement> => {
  mockDetail(refund)
  await userEvent.click(
    await screen.findByRole('button', {
      name: `Xem chi tiết ${refund.refundCode}`
    })
  )
  const drawer = await screen.findByRole('dialog')
  await userEvent.click(
    await within(drawer).findByRole('button', { name: action })
  )
  // Drawer vẫn mở phía dưới nên hộp thoại hành động là dialog thứ hai.
  await waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(2))
  return screen.getAllByRole('dialog')[1]
}

const waitDialogClosed = () =>
  waitFor(() => expect(screen.getAllByRole('dialog')).toHaveLength(1))

describe('từ chối', () => {
  it('bắt buộc lý do 5 đến 500 ký tự và không gọi API khi chưa hợp lệ', async () => {
    let called = false
    mockList(() => [PENDING])
    server.use(
      http.post('*/refunds/:id/reject', () => {
        called = true
        return HttpResponse.json({ data: { ...PENDING, status: 'REJECTED' } })
      })
    )
    renderRefundPage(APPROVER)
    const dialog = await openDrawerDialog(PENDING, 'Từ chối')

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Từ chối' })
    )
    expect(
      await within(dialog).findByText('Vui lòng nhập lý do')
    ).toBeInTheDocument()

    await userEvent.type(within(dialog).getByRole('textbox'), 'abc')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Từ chối' })
    )
    expect(
      await within(dialog).findByText(
        'Lý do từ chối phải có từ 5 đến 500 ký tự'
      )
    ).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('gửi lý do đã trim và đóng hộp thoại khi thành công', async () => {
    let body: unknown
    mockList(() => [PENDING])
    server.use(
      http.post('*/refunds/:id/reject', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: { ...PENDING, status: 'REJECTED' } })
      })
    )
    renderRefundPage(APPROVER)
    const dialog = await openDrawerDialog(PENDING, 'Từ chối')
    await userEvent.type(
      within(dialog).getByRole('textbox'),
      '  Không đủ chứng từ  '
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Từ chối' })
    )
    await waitFor(() => expect(body).toEqual({ reason: 'Không đủ chứng từ' }))
    await waitDialogClosed()
  })
})

describe('duyệt', () => {
  it('đổi trạng thái sau khi duyệt thành công', async () => {
    let current: RefundDetail = PENDING
    server.use(
      http.get('*/refunds', () => HttpResponse.json(toPage([current]))),
      http.post('*/refunds/:id/approve', () => {
        current = { ...PENDING, status: 'SUCCESS', approvedBy: 'ketoan.truong' }
        return HttpResponse.json({ data: current })
      })
    )
    renderRefundPage(APPROVER, 'ketoan.truong')
    const dialog = await openDrawerDialog(PENDING, 'Duyệt')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Duyệt hoàn tiền' })
    )

    await waitDialogClosed()
    await screen.findAllByText('RF-R1')
    const row = screen
      .getAllByText('RF-R1')
      .map((cell) => cell.closest('tr'))
      .find(Boolean)
    expect(row).not.toBeNull()
    expect(
      await within(row as HTMLElement).findByText('Hoàn thành')
    ).toBeInTheDocument()
  })

  it('bấm Duyệt hai lần liên tiếp chỉ gọi API một lần', async () => {
    let calls = 0
    mockList(() => [PENDING])
    server.use(
      http.post('*/refunds/:id/approve', async () => {
        calls += 1
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json({ data: { ...PENDING, status: 'SUCCESS' } })
      })
    )
    renderRefundPage(APPROVER, 'ketoan.truong')
    const dialog = await openDrawerDialog(PENDING, 'Duyệt')
    const ok = within(dialog).getByRole('button', { name: 'Duyệt hoàn tiền' })
    await userEvent.dblClick(ok)
    await waitDialogClosed()
    expect(calls).toBe(1)
  })

  it('hiển thị detail tiếng Việt nguyên văn khi BE từ chối và giữ hộp thoại', async () => {
    const detail =
      'Người tạo yêu cầu hoàn tiền không được tự duyệt hoặc từ chối yêu cầu của mình'
    mockList(() => [PENDING])
    server.use(http.post('*/refunds/:id/approve', () => apiError(detail)))
    renderRefundPage(APPROVER, 'ketoan.truong')
    const dialog = await openDrawerDialog(PENDING, 'Duyệt')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Duyệt hoàn tiền' })
    )

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(detail)
    expect(screen.queryByText('BUSINESS_ERROR')).not.toBeInTheDocument()
  })
})

describe('quyết toán', () => {
  it('thất bại thì bắt buộc lý do', async () => {
    const processing = makeRefund({
      id: 'p',
      refundCode: 'RF-P',
      status: 'PROCESSING',
      createdBy: 'a'
    })
    mockList(() => [processing])
    renderRefundPage(FULL)
    await clickRowAction('RF-P', 'Quyết toán')
    const dialog = await screen.findByRole('dialog')

    await userEvent.click(
      within(dialog).getByRole('radio', { name: 'Thất bại' })
    )
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Xác nhận quyết toán' })
    )
    expect(
      await within(dialog).findByText('Nhập lý do thất bại')
    ).toBeInTheDocument()
  })
})
