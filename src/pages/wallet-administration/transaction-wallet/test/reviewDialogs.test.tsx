import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { http } from 'msw'
import { server } from '@/test/mocks/server'
import { FULL } from './transaction.setup'
import {
  CODE,
  approveAction,
  fill,
  fillDate,
  json,
  record,
  rejectAction,
  renderPanel,
  result,
  snapshot
} from './review.setup'

const openWith = async (
  actions: object[],
  button: RegExp,
  username = 'nguoi.duyet'
) => {
  record('refresh', () => json(snapshot('REVIEW', actions as never)))
  renderPanel(FULL, username)
  await userEvent.click(
    await screen.findByRole('button', { name: /Kiểm tra trạng thái/ })
  )
  await userEvent.click(await screen.findByRole('button', { name: button }))
  return within(await screen.findByRole('dialog'))
}

const chooseChannel = async () => {
  await userEvent.click(screen.getByLabelText(/Kênh xác nhận/))
  await userEvent.click(await screen.findByTitle('Email'))
}

const fillBank = async (outcome: 'POSTED' | 'FAILED') => {
  await chooseChannel()
  fill('Tham chiếu xác nhận', 'MAIL-2026-10-09-02')
  fillDate(/Thời điểm xác nhận/, '02/01/2026 10:00:00')
  if (outcome === 'FAILED') return
  fill('Mã giao dịch ngân hàng', 'FT26282XXXXXX')
  fillDate(/Ngày giá trị/, '02/01/2026')
  fillDate(/Thời điểm ngân hàng ghi sổ/, '02/01/2026 09:00:00')
}

describe('Duyệt', () => {
  it('không đòi bằng chứng ngân hàng khi requiredFields không có bankConfirmation', async () => {
    const approve = record('review/approve', () => json(result()))
    const dialog = await openWith([approveAction(false)], /Duyệt$/)

    expect(screen.queryByLabelText(/Kênh xác nhận/)).toBeNull()
    fill(/Mã chuẩn chi/, 'AUTH112233')
    fill(/Mã đối soát/, 'STL20261009007')
    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )

    await waitFor(() => expect(approve.bodies).toHaveLength(1))
    expect(approve.bodies[0]).toEqual({
      authCode: 'AUTH112233',
      settlementId: 'STL20261009007'
    })
  })

  it('bắt buộc authCode và settlementId, tối đa 50 ký tự', async () => {
    const approve = record('review/approve', () => json(result()))
    const dialog = await openWith([approveAction(false)], /Duyệt$/)

    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )
    expect(
      await screen.findAllByText('Vui lòng nhập đầy đủ thông tin đối soát')
    ).toHaveLength(2)

    fill(/Mã chuẩn chi/, 'A'.repeat(51))
    fill(/Mã đối soát/, 'S')
    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )
    expect(
      await screen.findByText('Mã chuẩn chi tối đa 50 ký tự')
    ).toBeInTheDocument()
    expect(approve.calls.count).toBe(0)
  })

  it('có bankConfirmation trong requiredFields: bắt buộc nhập và gửi outcome POSTED đầy đủ', async () => {
    const approve = record('review/approve', () => json(result()))
    const dialog = await openWith([approveAction(true)], /Duyệt$/)

    fill(/Mã chuẩn chi/, 'AUTH112233')
    fill(/Mã đối soát/, 'STL20261009007')
    fill(/Ghi chú/, 'Đã đối soát khớp sao kê VCB')
    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )
    expect(
      await screen.findByText('Vui lòng chọn kênh xác nhận')
    ).toBeInTheDocument()
    expect(approve.calls.count).toBe(0)

    await fillBank('POSTED')
    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )

    await waitFor(() => expect(approve.bodies).toHaveLength(1))
    expect(approve.bodies[0]).toEqual({
      authCode: 'AUTH112233',
      settlementId: 'STL20261009007',
      note: 'Đã đối soát khớp sao kê VCB',
      bankConfirmation: {
        outcome: 'POSTED',
        confirmationChannel: 'EMAIL',
        confirmationReference: 'MAIL-2026-10-09-02',
        confirmedAt: new Date('2026-01-02T10:00').toISOString(),
        bankReference: 'FT26282XXXXXX',
        valueDate: '2026-01-02',
        bankBookedAt: new Date('2026-01-02T09:00').toISOString()
      }
    })
  })

  it('thời điểm xác nhận ở tương lai bị chặn', async () => {
    const approve = record('review/approve', () => json(result()))
    const dialog = await openWith([approveAction(true)], /Duyệt$/)

    fill(/Mã chuẩn chi/, 'AUTH112233')
    fill(/Mã đối soát/, 'STL20261009007')
    await fillBank('POSTED')
    fillDate(/Thời điểm xác nhận/, '02/01/2099 10:00:00')
    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )

    expect(
      await screen.findByText(
        'Nhập thời điểm xác nhận hợp lệ, không ở tương lai'
      )
    ).toBeInTheDocument()
    expect(approve.calls.count).toBe(0)
  })

  it('409 đang được xử lý bởi người khác: hiện lỗi, giữ hộp thoại và tự kiểm tra lại trạng thái', async () => {
    const detail = 'Giao dịch đang được xử lý bởi người khác'
    const approve = record('review/approve', () =>
      json({ success: false, message: 'RECONCILIATION_CONFLICT', detail }, 409)
    )
    const refresh = record('refresh', () =>
      json(snapshot('REVIEW', [approveAction(false)]))
    )
    renderPanel(FULL, 'nguoi.duyet')
    await userEvent.click(
      await screen.findByRole('button', { name: /Kiểm tra trạng thái/ })
    )
    await userEvent.click(await screen.findByRole('button', { name: /Duyệt$/ }))
    const dialog = within(await screen.findByRole('dialog'))
    fill(/Mã chuẩn chi/, 'AUTH1')
    fill(/Mã đối soát/, 'STL1')
    const before = refresh.calls.count

    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )

    expect(await dialog.findByRole('alert')).toHaveTextContent(detail)
    await waitFor(() => expect(refresh.calls.count).toBe(before + 1))
    expect(approve.calls.count).toBe(1)
  })

  it('400 người đánh dấu tự duyệt: hiện nguyên văn detail của BE', async () => {
    const detail =
      'Người đánh dấu Review không được tự duyệt hoặc từ chối giao dịch này'
    record('review/approve', () =>
      json({ success: false, message: 'BUSINESS_ERROR', detail }, 400)
    )
    const dialog = await openWith([approveAction(false)], /Duyệt$/)
    fill(/Mã chuẩn chi/, 'AUTH1')
    fill(/Mã đối soát/, 'STL1')
    await userEvent.click(
      dialog.getByRole('button', { name: 'Duyệt giao dịch' })
    )

    expect(await dialog.findByRole('alert')).toHaveTextContent(detail)
  })
})

describe('Từ chối', () => {
  const submit = (dialog: ReturnType<typeof within>) =>
    userEvent.click(dialog.getByRole('button', { name: 'Từ chối giao dịch' }))

  it('Chỉ hủy (mặc định): không có ô mã hoàn, gửi option và reason', async () => {
    const reject = record('review/reject', () => json(result()))
    const dialog = await openWith([rejectAction(false)], /Từ chối$/)

    expect(screen.queryByLabelText(/Mã chuẩn chi \(hoàn\)/)).toBeNull()
    fill(/Lý do gửi khách hàng/, 'Ngân hàng không ghi có, giao dịch bị hủy')
    await submit(dialog)

    await waitFor(() => expect(reject.bodies).toHaveLength(1))
    expect(reject.bodies[0]).toEqual({
      option: 'CANCEL_ONLY',
      reason: 'Ngân hàng không ghi có, giao dịch bị hủy'
    })
  })

  it('submit lần hai khi đang gửi chỉ gọi API một lần', async () => {
    let calls = 0
    server.use(
      http.post(`*/transactions/${CODE}/review/reject`, async () => {
        calls += 1
        await new Promise((resolve) => setTimeout(resolve, 150))
        return json(result())
      })
    )
    const dialog = await openWith([rejectAction(false)], /Từ chối$/)
    fill(/Lý do gửi khách hàng/, 'Ngân hàng không ghi có, giao dịch bị hủy')
    const form = dialog.getByLabelText(/Lý do gửi khách hàng/).closest('form')
    fireEvent.submit(form as HTMLFormElement)
    await waitFor(() => expect(calls).toBe(1))
    fireEvent.submit(form as HTMLFormElement)
    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(calls).toBe(1)
  })

  it('Hủy và hoàn tiền: bắt buộc hai mã hoàn rồi gửi cùng option REFUND', async () => {
    const reject = record('review/reject', () =>
      json(result({ refundCode: 'RF-20261009-000124' }))
    )
    const dialog = await openWith([rejectAction(false)], /Từ chối$/)

    await userEvent.click(dialog.getByLabelText('Hủy và hoàn tiền'))
    fill(
      /Lý do gửi khách hàng/,
      'Ngân hàng không ghi có, tiền hoàn về tài khoản'
    )
    await submit(dialog)
    expect(
      await screen.findAllByText('Vui lòng nhập đầy đủ thông tin đối soát')
    ).toHaveLength(2)
    expect(reject.calls.count).toBe(0)

    fill(/Mã chuẩn chi \(hoàn\)/, 'AUTH445566')
    fill(/Mã đối soát \(hoàn\)/, 'STL20261009009')
    await submit(dialog)

    await waitFor(() => expect(reject.bodies).toHaveLength(1))
    expect(reject.bodies[0]).toEqual({
      option: 'REFUND',
      reason: 'Ngân hàng không ghi có, tiền hoàn về tài khoản',
      refundAuthCode: 'AUTH445566',
      refundSettlementId: 'STL20261009009'
    })
  })

  it('có bankConfirmation trong requiredFields: gửi outcome FAILED, không kèm trường POSTED', async () => {
    const reject = record('review/reject', () => json(result()))
    const dialog = await openWith([rejectAction(true)], /Từ chối$/)

    fill(/Lý do gửi khách hàng/, 'Ngân hàng không ghi có, giao dịch bị hủy')
    await submit(dialog)
    expect(
      await screen.findByText('Vui lòng chọn kênh xác nhận')
    ).toBeInTheDocument()
    expect(screen.queryByLabelText(/Mã giao dịch ngân hàng/)).toBeNull()

    await fillBank('FAILED')
    await submit(dialog)

    await waitFor(() => expect(reject.bodies).toHaveLength(1))
    expect(reject.bodies[0]).toEqual({
      option: 'CANCEL_ONLY',
      reason: 'Ngân hàng không ghi có, giao dịch bị hủy',
      bankConfirmation: {
        outcome: 'FAILED',
        confirmationChannel: 'EMAIL',
        confirmationReference: 'MAIL-2026-10-09-02',
        confirmedAt: new Date('2026-01-02T10:00').toISOString()
      }
    })
  })

  it('lý do trống bị chặn', async () => {
    const reject = record('review/reject', () => json(result()))
    const dialog = await openWith([rejectAction(false)], /Từ chối$/)

    fill(/Lý do gửi khách hàng/, '   ')
    await submit(dialog)

    expect(
      await screen.findByText('Nhập lý do gửi khách hàng')
    ).toBeInTheDocument()
    expect(reject.calls.count).toBe(0)
  })
})
