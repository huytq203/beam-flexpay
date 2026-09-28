import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'
import PaymentMethodPage from '../pages/PaymentMethodPage'

beforeEach(() =>
  server.use(
    http.get('*/merchants', () =>
      HttpResponse.json({
        data: {
          content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }],
          totalElements: 1
        }
      })
    ),
    http.get('*/merchants/payment-methods', () =>
      HttpResponse.json({
        data: {
          content: [
            {
              merchantId: 'merchant-1',
              merchantCode: 'M001',
              merchantName: 'Merchant A',
              appliedLevel: 'MASTER',
              enabledMethods: ['QR'],
              configured: true,
              isDefault: false,
              active: true
            }
          ],
          totalElements: 1,
          number: 0,
          size: 20
        }
      })
    ),
    http.get('*/merchants/merchant-1/payment-methods', () =>
      HttpResponse.json({
        data: {
          merchantId: 'merchant-1',
          level: 'MASTER',
          enabledMethods: { value: ['QR'], inherited: false },
          methodLimits: { value: [], inherited: false },
          configured: true,
          active: true
        }
      })
    )
  )
)

const renderPage = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<PaymentMethodPage />, { store })
}

describe('PaymentMethodEditor mặc định hệ thống', () => {
  it('hiển thị rõ 5 phương thức mặc định và khóa chỉnh sửa', async () => {
    server.use(
      http.get('*/merchants/merchant-1/payment-methods', () =>
        HttpResponse.json({
          data: {
            merchantId: 'merchant-1',
            level: 'MASTER',
            enabledMethods: {
              value: ['QR', 'DOMESTIC_CARD'],
              inherited: true,
              source: 'SYSTEM_DEFAULT'
            },
            methodLimits: { value: [], inherited: true },
            configured: false,
            active: false
          }
        })
      )
    )
    const user = userEvent.setup()
    renderPage([
      PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW,
      PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE
    ])
    await user.click(
      await screen.findByRole('button', { name: 'Cập nhật Merchant A' })
    )
    expect(screen.getByRole('switch', { name: 'QR' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Thẻ nội địa' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Thẻ quốc tế' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Ví liên kết' })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: 'Tài khoản định danh' })
    ).toBeChecked()
    expect(screen.getByRole('switch', { name: 'QR' })).toBeDisabled()
    expect(screen.getByRole('switch', { name: 'Thẻ nội địa' })).toBeDisabled()
    expect(screen.getByText('Theo mặc định hệ thống')).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'QR' })).toHaveClass(
      'opacity-100!'
    )
  })

  it('bật mặc định hiển thị đủ 5 phương thức và tắt lại khôi phục lựa chọn riêng', async () => {
    const user = userEvent.setup()
    renderPage([
      PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW,
      PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE
    ])
    await user.click(
      await screen.findByRole('button', { name: 'Cập nhật Merchant A' })
    )
    const inheritSwitch = screen.getByRole('switch', {
      name: 'Dùng mặc định hệ thống'
    })
    expect(
      screen.getByRole('switch', { name: 'Thẻ nội địa' })
    ).not.toBeChecked()
    await user.click(inheritSwitch)
    expect(screen.getByRole('switch', { name: 'Thẻ nội địa' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Thẻ nội địa' })).toBeDisabled()
    expect(screen.getByRole('switch', { name: 'Thẻ quốc tế' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Ví liên kết' })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: 'Tài khoản định danh' })
    ).toBeChecked()
    await user.click(inheritSwitch)
    expect(screen.getByRole('switch', { name: 'QR' })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: 'Thẻ nội địa' })
    ).not.toBeChecked()
    expect(screen.getByRole('switch', { name: 'Thẻ nội địa' })).toBeEnabled()
  })
})
