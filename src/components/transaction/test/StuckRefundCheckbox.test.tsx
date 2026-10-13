import { screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  FAILED_DEPOSIT,
  FAILED_PLAIN,
  NOTE,
  POSTED_FULL,
  choose,
  fill,
  mockRefresh,
  mockUpdate,
  openForm,
  renderAction,
  submit
} from './stuck.setup'

const REFUND_BOX = /Hoàn tiền cho khách hàng/

describe('Checkbox "Hoàn tiền cho khách hàng" ở cập nhật giao dịch treo', () => {
  it('chỉ hiện khi chọn Thất bại và optionalFields có refund (lệnh nạp)', async () => {
    mockRefresh([POSTED_FULL, FAILED_DEPOSIT])
    const user = renderAction()
    await openForm(user)

    expect(screen.queryByRole('checkbox', { name: /Hoàn tiền/ })).toBeNull()
    await choose(user, 'Thành công')
    expect(screen.queryByRole('checkbox', { name: /Hoàn tiền/ })).toBeNull()
    await choose(user, 'Thất bại')
    expect(
      await screen.findByRole('checkbox', { name: REFUND_BOX })
    ).toBeInTheDocument()
  })

  it.each(['CASH_OUT', 'MERCHANT_PAYMENT'])(
    'không hiện với giao dịch %s vì action FAILED không có refund',
    async (type) => {
      mockRefresh([POSTED_FULL, FAILED_PLAIN])
      const user = renderAction({ transactionType: type })
      await openForm(user)
      await choose(user, 'Thất bại')

      expect(screen.queryByRole('checkbox', { name: /Hoàn tiền/ })).toBeNull()
    }
  )

  it('tích hoàn thì hiện ba mã hoàn, đều không bắt buộc: chỉ Lý do vẫn gửi được refund=true', async () => {
    mockRefresh([FAILED_DEPOSIT])
    const bodies = mockUpdate('FAILED')
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thất bại')
    await user.click(await screen.findByRole('checkbox', { name: REFUND_BOX }))

    for (const label of [
      /Mã chuẩn chi \(hoàn\)/,
      /Mã đối soát \(hoàn\)/,
      /Mã tham chiếu \(hoàn\)/
    ]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument()
    }
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ newStatus: 'FAILED', note: NOTE, refund: true })
  })

  it('gửi các mã hoàn đã nhập, kể cả mã tham chiếu hoàn', async () => {
    mockRefresh([FAILED_DEPOSIT])
    const bodies = mockUpdate('FAILED')
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thất bại')
    await user.click(await screen.findByRole('checkbox', { name: REFUND_BOX }))
    fill(/Mã chuẩn chi \(hoàn\)/, 'AUTH778899')
    fill(/Mã đối soát \(hoàn\)/, 'STL20261009001')
    fill(/Mã tham chiếu \(hoàn\)/, 'FT-REFUND-1')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({
      newStatus: 'FAILED',
      note: NOTE,
      refund: true,
      refundAuthCode: 'AUTH778899',
      refundSettlementId: 'STL20261009001',
      refundBankReference: 'FT-REFUND-1'
    })
  })

  it('mã hoàn dài quá 50 ký tự bị chặn', async () => {
    mockRefresh([FAILED_DEPOSIT])
    const bodies = mockUpdate('FAILED')
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thất bại')
    await user.click(await screen.findByRole('checkbox', { name: REFUND_BOX }))
    // maxLength của input chặn gõ, nên ép giá trị để kiểm tra riêng schema.
    const input = screen.getByLabelText(/Mã chuẩn chi \(hoàn\)/)
    input.removeAttribute('maxlength')
    fill(/Mã chuẩn chi \(hoàn\)/, 'A'.repeat(51))
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    expect(
      await screen.findByText('Mã chuẩn chi (hoàn) tối đa 50 ký tự')
    ).toBeInTheDocument()
    expect(bodies).toHaveLength(0)
  })

  it('không tích thì không gửi trường refund hay mã hoàn', async () => {
    mockRefresh([FAILED_DEPOSIT])
    const bodies = mockUpdate('FAILED')
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thất bại')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() => expect(bodies).toHaveLength(1))
    expect(bodies[0]).toEqual({ newStatus: 'FAILED', note: NOTE })
  })
})
