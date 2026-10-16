import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { renderWithProviders } from '@/test/render'
import PaymentMethodPage from '../pages/PaymentMethodPage'

afterEach(() => sessionStorage.clear())

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

describe('PaymentMethodPage API', () => {
  it('hiển thị cấu hình merchant từ API và giữ nút làm mới của bảng', async () => {
    renderPage([PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW])
    expect(await screen.findByText('Merchant A')).toBeInTheDocument()
    expect(screen.getByText('QR')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Làm mới dữ liệu' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Bộ lọc tìm kiếm' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Danh sách phương thức thanh toán' })
    ).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: '1' })).toBeInTheDocument()
  })

  it('lọc theo tên trong trang hiện tại và xóa lọc', async () => {
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW])
    await screen.findByText('Merchant A')
    await user.type(screen.getByLabelText('Tên Merchant'), 'Không tồn tại')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    expect(screen.queryByText('Merchant A')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xóa lọc' }))
    expect(await screen.findByText('Merchant A')).toBeInTheDocument()
  })

  it('mở cấu hình chi tiết đúng merchant', async () => {
    const user = userEvent.setup()
    renderPage([
      PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW,
      PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE
    ])
    await screen.findByText('Merchant A')
    await user.click(
      screen.getByRole('button', { name: 'Cập nhật Merchant A' })
    )
    expect(
      await screen.findByRole('dialog', {
        name: 'Cập nhật hình thức thanh toán · Merchant A'
      })
    ).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'QR' })).toBeChecked()
    expect(
      screen.getByRole('switch', { name: 'Thẻ nội địa' })
    ).not.toBeChecked()
  })

  it('dùng nhãn thiết lập khi chưa có cấu hình và báo lỗi lý do ngay dưới trường', async () => {
    server.use(
      http.get('*/merchants/payment-methods', () =>
        HttpResponse.json({
          data: {
            content: [
              {
                merchantId: 'merchant-1',
                merchantCode: 'M001',
                merchantName: 'Merchant A',
                appliedLevel: 'SYSTEM_DEFAULT',
                enabledMethods: ['QR'],
                configured: false,
                isDefault: true,
                active: false
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
            enabledMethods: { value: ['QR'], inherited: true },
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
      await screen.findByRole('button', { name: 'Thiết lập Merchant A' })
    )
    expect(
      await screen.findByRole('dialog', {
        name: 'Thiết lập hình thức thanh toán · Merchant A'
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('switch', { name: 'Cấu hình đang hoạt động' })
    ).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Thiết lập' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Vui lòng nhập lý do thay đổi'
    )
    expect(screen.getByLabelText(/Lý do thay đổi/)).toHaveAttribute(
      'aria-invalid',
      'true'
    )
    await user.type(
      screen.getByLabelText(/Lý do thay đổi/),
      'Thiết lập lần đầu'
    )
    expect(
      screen.queryByText('Vui lòng nhập lý do thay đổi')
    ).not.toBeInTheDocument()
  })

  it('chọn Merchant ở trang tiếp theo trong modal, không tải trước 100 Merchant', async () => {
    const requests: string[] = []
    server.use(
      http.get('*/merchants/merchant-101/payment-methods', () =>
        HttpResponse.json({
          data: {
            merchantId: 'merchant-101',
            level: 'MASTER',
            enabledMethods: { value: ['QR'], inherited: true },
            methodLimits: { value: [], inherited: true },
            configured: false,
            active: false
          }
        })
      ),
      http.get('*/merchants', ({ request }) => {
        const url = new URL(request.url)
        requests.push(url.search)
        const page = Number(url.searchParams.get('page'))
        const content =
          page === 2
            ? [
                {
                  id: 'merchant-101',
                  code: 'MC000101',
                  name: 'Merchant 101',
                  status: 'ACTIVE'
                }
              ]
            : Array.from({ length: 10 }, (_, index) => ({
                id: `merchant-${index + 1}`,
                code: `MC0000${index + 1}`,
                name: `Merchant ${index + 1}`,
                status: 'ACTIVE'
              }))
        return HttpResponse.json({
          data: { content, totalElements: 11, number: page - 1, size: 10 }
        })
      })
    )
    const user = userEvent.setup()
    renderPage([
      PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW,
      PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE
    ])
    await screen.findByText('Merchant A')
    expect(requests).toHaveLength(0)
    expect(
      screen.queryByRole('button', { name: 'Chọn Merchant' })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Thêm mới cấu hình' }))
    expect(
      await screen.findByRole('dialog', { name: 'Chọn Merchant' })
    ).toBeInTheDocument()
    expect(requests[0]).toContain('size=10')
    expect(screen.queryByText('ACTIVE')).not.toBeInTheDocument()
    expect(await screen.findAllByText('Hoạt động')).toHaveLength(10)
    await user.click(screen.getByTitle('2'))
    await user.click(
      await screen.findByRole('button', { name: 'Chọn Merchant Merchant 101' })
    )
    expect(
      await screen.findByText('Thiết lập hình thức thanh toán · Merchant 101')
    ).toBeInTheDocument()
    expect(requests).toHaveLength(2)
  })
})
