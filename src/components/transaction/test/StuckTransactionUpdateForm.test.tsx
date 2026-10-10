import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import {
  FAILED_DEPOSIT,
  FAILED_PLAIN,
  NOTE,
  POSTED_FULL,
  POSTED_INTERNAL,
  choose,
  fill,
  mockRefresh,
  mockUpdate,
  openForm,
  renderAction,
  submit
} from './stuck.setup'

describe('StuckTransactionUpdateAction - form theo allowedActions', () => {
  it('Thành công: nhóm đối soát có 4 trường không bắt buộc, không còn khối bankConfirmation', async () => {
    mockRefresh([POSTED_FULL, FAILED_DEPOSIT])
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')

    expect(
      screen.getByText('Thông tin đối soát (không bắt buộc)')
    ).toBeInTheDocument()
    for (const label of [/Auth Code/, /Settlement ID/, /Mã tham chiếu/]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    expect(screen.getByLabelText('Ảnh biên lai')).toBeInTheDocument()
    expect(screen.queryByLabelText(/Kênh xác nhận/)).toBeNull()
    expect(screen.queryByText(/Xác nhận trực tiếp với ngân hàng/)).toBeNull()
  })

  it('chuyển nội bộ: chỉ có Auth Code và Settlement ID', async () => {
    mockRefresh([POSTED_INTERNAL, FAILED_PLAIN])
    const user = renderAction({ transactionType: 'P2P_TRANSFER' })
    await openForm(user)
    await choose(user, 'Thành công')

    expect(screen.getByLabelText(/Auth Code/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Settlement ID/)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Mã tham chiếu/)).toBeNull()
    expect(screen.queryByLabelText('Ảnh biên lai')).toBeNull()
  })

  it('chỉ cho chọn những kết quả có trong allowedActions', async () => {
    mockRefresh([POSTED_FULL])
    const user = renderAction()
    await openForm(user)
    await user.click(await screen.findByLabelText(/Kết quả cuối/))

    expect(await screen.findByTitle('Thành công')).toBeInTheDocument()
    expect(screen.queryByTitle('Thất bại')).toBeNull()
  })

  it('nói trước hậu quả của lựa chọn trước khi người dùng bấm', async () => {
    mockRefresh([POSTED_FULL, FAILED_PLAIN])
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thất bại')

    expect(
      await screen.findByText(/giải phóng khoản tiền đang bị giữ/i)
    ).toBeInTheDocument()
  })
})

describe('StuckTransactionUpdateAction - payload', () => {
  it('chỉ Lý do là bắt buộc: gửi {newStatus, note}, không có bankConfirmation', async () => {
    mockRefresh([POSTED_FULL, FAILED_DEPOSIT])
    const bodies = mockUpdate()
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ newStatus: 'POSTED', note: NOTE })
  })

  it('Lý do 10-500 ký tự: ngắn hơn 10 bị chặn, không gửi request', async () => {
    mockRefresh([POSTED_FULL])
    const bodies = mockUpdate()
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill('Lý do cập nhật', 'quá ngắn')
    await submit(user)

    expect(
      await screen.findByText('Lý do phải từ 10 ký tự trở lên')
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(0)
  })

  it('Thành công gửi authCode, settlementId, bankReference đã nhập', async () => {
    mockRefresh([POSTED_FULL])
    const bodies = mockUpdate()
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill(/Auth Code/, 'AUTH-12')
    fill(/Settlement ID/, 'SET-34')
    fill(/Mã tham chiếu/, 'FT26282ABCDE')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({
      newStatus: 'POSTED',
      note: NOTE,
      authCode: 'AUTH-12',
      settlementId: 'SET-34',
      bankReference: 'FT26282ABCDE'
    })
  })

  it('chuyển nội bộ không gửi bankReference/receiptKey', async () => {
    mockRefresh([POSTED_INTERNAL])
    const bodies = mockUpdate()
    const user = renderAction({ transactionType: 'P2P_TRANSFER' })
    await openForm(user)
    await choose(user, 'Thành công')
    fill(/Auth Code/, 'AUTH-12')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({
      newStatus: 'POSTED',
      note: NOTE,
      authCode: 'AUTH-12'
    })
  })

  it('đã nhập bankReference rồi đổi sang Thất bại: không gửi bankReference/authCode', async () => {
    mockRefresh([POSTED_FULL, FAILED_DEPOSIT])
    const bodies = mockUpdate('FAILED')
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill(/Mã tham chiếu/, 'FT26282ABCDE')
    fill(/Auth Code/, 'AUTH-12')
    await choose(user, 'Thất bại')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ newStatus: 'FAILED', note: NOTE })
  })
})
