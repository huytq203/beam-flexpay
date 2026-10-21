import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { WithdrawalStatus } from '@type/withdrawalApproval.type'
import {
  CODE,
  FAILED_PLAIN,
  NOTE,
  POSTED_FULL,
  TRIGGER,
  choose,
  fill,
  mockRefresh,
  openForm,
  renderAction,
  submit
} from './stuck.setup'

const mockWithdrawalStatus = (status: string) => {
  server.use(
    http.get('*/withdrawals', () =>
      HttpResponse.json({
        data: {
          id: 'withdrawal-1',
          transactionCode: CODE,
          beneficiary: null,
          status
        }
      })
    )
  )
}

describe('StuckTransactionUpdateAction - hiển thị nút', () => {
  it('ẩn nút khi lệnh rút đang chờ duyệt', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PENDING_APPROVAL)
    renderAction({ transactionType: 'CASH_OUT' })

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: TRIGGER })).toBeNull()
    )
  })

  it('hiện nút khi lệnh rút đã rời khỏi hàng chờ duyệt', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)
    renderAction({ transactionType: 'CASH_OUT' })

    expect(await screen.findByRole('button', { name: TRIGGER })).toBeVisible()
  })

  it('chuyển tiền (P2P_TRANSFER) không có nút cập nhật, cả ở dạng icon trong danh sách', () => {
    renderAction({ transactionType: 'P2P_TRANSFER' })
    expect(screen.queryByRole('button', { name: TRIGGER })).toBeNull()

    renderAction({ transactionType: 'P2P_TRANSFER', compact: true })
    expect(screen.queryByRole('button', { name: /Xử lý chi tiền/ })).toBeNull()
  })

  it('ẩn nút khi tài khoản thiếu quyền', () => {
    renderAction({ permissions: ['EWALLET:TRANSACTION:VIEW'] })

    expect(screen.queryByRole('button', { name: TRIGGER })).toBeNull()
  })

  it('hiển thị dạng icon ở danh sách, mở form thì mới hỏi refresh', async () => {
    mockWithdrawalStatus(WithdrawalStatus.PAYING)
    const refresh = mockRefresh([POSTED_FULL, FAILED_PLAIN])
    const user = renderAction({ compact: true, transactionType: 'CASH_OUT' })

    expect(refresh.calls).toBe(0)
    await openForm(user)
    expect(await screen.findByLabelText(/Kết quả cuối/)).toBeInTheDocument()
    expect(refresh.calls).toBe(1)
  })

  it('snapshot không còn POSTED/FAILED: popup báo hết thao tác, đóng rồi nút biến mất', async () => {
    mockRefresh([])
    const user = renderAction()
    await openForm(user)

    expect(
      await screen.findByText(/không còn thao tác cập nhật kết quả/)
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/Kết quả cuối/)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Đóng' }))
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: TRIGGER })).toBeNull()
    )
  })

  it('hiện kết quả kiểm tra của refresh và cho kiểm tra lại', async () => {
    const refresh = mockRefresh([POSTED_FULL], {
      source: 'VPBANK',
      status: 'BANK_UNKNOWN',
      detail: 'VPBank chưa trả kết quả cuối cho lệnh nạp'
    })
    const user = renderAction()
    await openForm(user)

    expect(
      await screen.findByText('VPBank chưa trả kết quả cuối cho lệnh nạp')
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: /Kiểm tra trạng thái/ })
    )
    await waitFor(() => expect(refresh.calls).toBe(2))
  })

  it('refresh lỗi thì báo lỗi nguyên văn, không dựng form', async () => {
    server.use(
      http.post(`*/transactions/${CODE}/refresh`, () =>
        HttpResponse.json(
          { message: 'BUSINESS_ERROR', detail: 'Không kết nối được ngân hàng' },
          { status: 400 }
        )
      )
    )
    const user = renderAction()
    await openForm(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không kết nối được ngân hàng'
    )
    expect(screen.queryByLabelText(/Kết quả cuối/)).toBeNull()
  })
})

describe('StuckTransactionUpdateAction - lỗi update-status', () => {
  it('400: hiện nguyên văn detail, giữ popup và dữ liệu đã nhập, không refresh lại', async () => {
    const refresh = mockRefresh([POSTED_FULL])
    server.use(
      http.post(`*/transactions/${CODE}/update-status`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'BUSINESS_ERROR',
            detail: 'Lệnh rút đang chờ duyệt, hãy dùng chức năng duyệt lệnh rút'
          },
          { status: 400 }
        )
      )
    )
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Lệnh rút đang chờ duyệt, hãy dùng chức năng duyệt lệnh rút'
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/Lý do cập nhật/)).toHaveValue(NOTE)
    expect(refresh.calls).toBe(1)
  })

  it('400 chỉ có message mã máy: dùng câu chung thay vì in mã', async () => {
    mockRefresh([POSTED_FULL])
    server.use(
      http.post(`*/transactions/${CODE}/update-status`, () =>
        HttpResponse.json({ message: 'BUSINESS_ERROR' }, { status: 400 })
      )
    )
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    expect(await screen.findByText(/Không thể chốt giao dịch/)).toBeVisible()
  })

  it('409: hiện nguyên văn lỗi rồi tự refresh lại snapshot', async () => {
    const refresh = mockRefresh([POSTED_FULL])
    server.use(
      http.post(`*/transactions/${CODE}/update-status`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'RECONCILIATION_CONFLICT',
            detail: 'Giao dịch đang chờ review, hãy dùng chức năng duyệt review'
          },
          { status: 409 }
        )
      )
    )
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Giao dịch đang chờ review, hãy dùng chức năng duyệt review'
    )
    await waitFor(() => expect(refresh.calls).toBe(2))
    expect(await screen.findByLabelText(/Kết quả cuối/)).toBeInTheDocument()
  })
})
