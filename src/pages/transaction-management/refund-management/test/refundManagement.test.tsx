import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import { suppressAntPseudoElementWarning } from '../../../merchant-management/sub-merchant-management/sub-merchant/test/domTestSetup'
import {
  APPROVER,
  FULL,
  apiError,
  makeRefund,
  mockDetail,
  mockList,
  renderRefundPage
} from './refund.setup'

suppressAntPseudoElementWarning()

const OWN = makeRefund({
  id: 'own',
  refundCode: 'RF-OWN',
  createdBy: 'ketoan.truong'
})
const OTHER = makeRefund({
  id: 'other',
  refundCode: 'RF-OTHER',
  createdBy: 'admin.b',
  requestedAmount: 1250000,
  netCredit: 1250000,
  originalAmount: 1500000
})

const rowOf = async (code: string): Promise<HTMLElement> => {
  const cell = await screen.findByText(code)
  const row = cell.closest('tr')
  if (!row) throw new Error(`Không thấy dòng ${code}`)
  return row
}

describe('danh sách hoàn tiền', () => {
  it('hiển thị cột #, mã, khách, số tiền đủ chữ số và trạng thái', async () => {
    mockList(() => [OTHER, OWN])
    renderRefundPage(APPROVER)

    const row = await rowOf('RF-OTHER')
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(
      within(row).getByText('GD gốc TXN20261008000456')
    ).toBeInTheDocument()
    expect(within(row).getByText('Nguyễn Văn An')).toBeInTheDocument()
    expect(within(row).getAllByText('1.250.000 đ')).toHaveLength(2)
    expect(within(row).getByText('GD gốc 1.500.000 đ')).toBeInTheDocument()
    expect(within(row).getByText('Chờ duyệt')).toBeInTheDocument()
    expect(within(await rowOf('RF-OWN')).getByText('2')).toBeInTheDocument()
  })

  it('gửi bộ lọc trạng thái lên API', async () => {
    const seen: string[] = []
    server.use(
      http.get('*/refunds', ({ request }) => {
        seen.push(new URL(request.url).searchParams.get('status') ?? '')
        return HttpResponse.json({ data: { content: [], totalElements: 0 } })
      })
    )
    renderRefundPage(APPROVER)
    await userEvent.click(
      await screen.findByRole('button', { name: 'Chờ duyệt' })
    )
    await waitFor(() => expect(seen).toContain('PENDING_APPROVAL'))
  })

  it('báo lỗi tải danh sách bằng detail của BE và cho thử lại', async () => {
    server.use(
      http.get('*/refunds', () =>
        apiError('Bạn không có quyền xử lý hoàn tiền')
      )
    )
    renderRefundPage(APPROVER)
    expect(
      await screen.findByText(/Không tải được danh sách hoàn tiền/)
    ).toHaveTextContent('Bạn không có quyền xử lý hoàn tiền')
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })

  it('hiện trạng thái rỗng khi không có yêu cầu', async () => {
    mockList(() => [])
    renderRefundPage(APPROVER)
    expect(
      await screen.findByText('Chưa có yêu cầu hoàn tiền nào khớp điều kiện')
    ).toBeInTheDocument()
  })
})

describe('quy tắc nút', () => {
  it('dòng chỉ có nút Xem, Duyệt/Từ chối chỉ ở drawer', async () => {
    mockList(() => [OTHER])
    renderRefundPage(APPROVER, 'ketoan.truong')

    const row = await rowOf('RF-OTHER')
    expect(
      within(row).getByRole('button', { name: 'Xem chi tiết RF-OTHER' })
    ).toBeInTheDocument()
    expect(
      within(row).queryByRole('button', { name: /^Duyệt/ })
    ).not.toBeInTheDocument()
    expect(
      within(row).queryByRole('button', { name: /^Từ chối/ })
    ).not.toBeInTheDocument()
    expect(within(row).queryByText(/^bởi /)).not.toBeInTheDocument()
  })

  it('drawer hiện Duyệt/Từ chối với yêu cầu của người khác', async () => {
    mockList(() => [OTHER])
    mockDetail(OTHER)
    renderRefundPage(APPROVER, 'ketoan.truong')
    await userEvent.click(
      await screen.findByRole('button', { name: 'Xem chi tiết RF-OTHER' })
    )
    const drawer = await screen.findByRole('dialog')
    expect(
      await within(drawer).findByRole('button', { name: 'Duyệt' })
    ).toBeInTheDocument()
    expect(
      within(drawer).getByRole('button', { name: 'Từ chối' })
    ).toBeInTheDocument()
  })

  it('drawer ẩn Duyệt/Từ chối với yêu cầu do chính mình tạo (không phân biệt hoa thường)', async () => {
    mockList(() => [OWN])
    mockDetail({ ...OWN, createdBy: 'Ketoan.Truong ' })
    renderRefundPage(APPROVER, 'ketoan.truong')
    await userEvent.click(
      await screen.findByRole('button', { name: 'Xem chi tiết RF-OWN' })
    )
    const drawer = await screen.findByRole('dialog')
    await within(drawer).findByText('Bạn là người tạo yêu cầu này', {
      exact: false
    })
    expect(
      within(drawer).queryByRole('button', { name: 'Duyệt' })
    ).not.toBeInTheDocument()
    expect(
      within(drawer).queryByRole('button', { name: 'Từ chối' })
    ).not.toBeInTheDocument()
  })

  it('Quyết toán và làm mới lệnh chi chỉ cho EWALLET:FULL', async () => {
    const wallet = makeRefund({
      id: 'w',
      refundCode: 'RF-W',
      status: 'PROCESSING',
      createdBy: 'a'
    })
    const bank = makeRefund({
      id: 'b',
      refundCode: 'RF-B',
      status: 'WAITING_FUNDS',
      channel: 'TO_BANK',
      createdBy: 'a'
    })
    mockList(() => [wallet, bank])
    const { unmount } = renderRefundPage(APPROVER)
    const row = await rowOf('RF-W')
    expect(
      within(row).queryByRole('button', { name: /Quyết toán/ })
    ).not.toBeInTheDocument()
    expect(
      within(await rowOf('RF-B')).queryByRole('button', {
        name: /Làm mới lệnh chi/
      })
    ).not.toBeInTheDocument()
    unmount()

    renderRefundPage(FULL)
    expect(
      within(await rowOf('RF-W')).getByRole('button', {
        name: 'Quyết toán RF-W'
      })
    ).toBeInTheDocument()
    expect(
      within(await rowOf('RF-B')).getByRole('button', {
        name: 'Làm mới lệnh chi RF-B'
      })
    ).toBeInTheDocument()
  })
})
