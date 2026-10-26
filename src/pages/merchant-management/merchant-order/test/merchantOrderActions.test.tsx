import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { describeOrderError } from '../utils/orderError.utils'
import { buildCreateBody, EMPTY_CREATE_FORM } from '../utils/orderCreate.utils'
import { ORDERS, renderPage } from './merchantOrder.setup'

// Máy dev chậm: dựng bảng antd cộng hộp thoại có thể vượt 5 giây mặc định.
vi.setConfig({ testTimeout: 30000 })

describe('thao tác ghi trên đơn hàng', () => {
  it('hủy đơn gọi cancel không kèm body rồi đóng hộp thoại', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.post('*/merchant-orders/a1/cancel', async ({ request }) => {
        called = true
        expect(await request.text()).toBe('')
        return HttpResponse.json({
          data: { ...ORDERS[0], status: 'CANCELLED' }
        })
      })
    )
    renderPage()
    await user.click(await screen.findByLabelText('Hủy đơn ORD-a1'))
    const dialog = await screen.findByRole('dialog', { name: 'Hủy đơn hàng' })
    await user.click(within(dialog).getByRole('button', { name: 'Hủy đơn' }))
    await waitFor(() => expect(called).toBe(true))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Hủy đơn hàng' })).toBeNull()
    )
  })

  it('xác nhận thủ công chặn số tiền khác số tiền đơn', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.post('*/merchant-orders/a1/confirm', () => {
        called = true
        return HttpResponse.json({ data: ORDERS[0] })
      })
    )
    renderPage()
    await user.click(
      await screen.findByLabelText('Xác nhận thanh toán đơn ORD-a1')
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Xác nhận thanh toán thủ công'
    })
    await user.type(within(dialog).getByLabelText(/Số tiền đã nhận/), '1000')
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận đã nhận tiền' })
    )
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'bằng đúng số tiền của đơn'
    )
    expect(called).toBe(false)
  })

  it('ghi có lại trả 200 nhưng vẫn lỗi thì không coi là thành công', async () => {
    const user = userEvent.setup()
    server.use(
      http.post('*/merchant-orders/b2/retry-credit', () =>
        HttpResponse.json({
          data: {
            ...ORDERS[1],
            creditFailureReason: 'Vẫn chưa rõ kết quả ghi sổ bút toán'
          }
        })
      )
    )
    renderPage()
    await user.click(await screen.findByLabelText('Ghi có lại đơn ORD-b2'))
    const dialog = await screen.findByRole('dialog', {
      name: 'Ghi có lại cho merchant'
    })
    await user.click(within(dialog).getByRole('button', { name: 'Ghi có lại' }))
    expect(
      await within(dialog).findByText(/Chưa ghi có xong/)
    ).toBeInTheDocument()
    expect(
      within(dialog).getByText('Vẫn chưa rõ kết quả ghi sổ bút toán')
    ).toBeInTheDocument()
  })
})

describe('xử lý lỗi và dữ liệu gửi lên', () => {
  it('lỗi 5514 đổi tên enum sang câu tiếng Việt', () => {
    const message = describeOrderError(
      {
        data: {
          message: 'MERCHANT_PAYMENT_METHOD_NOT_ACCEPTED',
          detail: 'QR',
          status: '5514'
        }
      },
      'fallback'
    )
    expect(message).toContain('Mã QR')
    expect(message).not.toBe('QR')
  })

  it('tạo đơn chỉ gửi trường BE cho phép và bỏ trường trống', () => {
    const result = buildCreateBody({
      ...EMPTY_CREATE_FORM,
      merchantId: 'merchant-1',
      orderCode: ' ORD-1 ',
      amount: 500000,
      expiredAt: '2099-10-22T18:30'
    })
    expect(result.body).toEqual({
      merchantId: 'merchant-1',
      orderCode: 'ORD-1',
      amount: 500000,
      bankCode: 'VPB',
      paymentMethod: 'QR',
      expiredAt: '2099-10-22T18:30:00'
    })
    expect(
      buildCreateBody({
        ...EMPTY_CREATE_FORM,
        merchantId: 'merchant-1',
        orderCode: 'X',
        amount: 1,
        bankCode: 'VCB',
        paymentMethod: 'VIRTUAL_ACCOUNT'
      }).error
    ).toContain('VPBank')
  })
})
