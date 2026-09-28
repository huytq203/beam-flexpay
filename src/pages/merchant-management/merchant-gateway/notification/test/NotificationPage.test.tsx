import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { renderWithProviders } from '@/test/render'
import { savePermissions } from '@slices/authSlice'
import NotificationPage from '../pages/NotificationPage'

beforeEach(() => server.use(
  http.get('*/merchants', () => HttpResponse.json({ data: { content: [{ id: 'merchant-1', code: 'M001', name: 'Merchant A' }], totalElements: 1 } })),
  http.get('*/merchants/merchant-1/notifications', () => HttpResponse.json({ data: { merchantId: 'merchant-1', level: 'MASTER', transactionNotificationEnabled: { value: true, inherited: false }, channels: { value: ['EMAIL'], inherited: false }, notificationEmails: { value: ['ops@example.com'], inherited: false }, reconciliationEmails: { value: [], inherited: false }, invoiceEmails: { value: [], inherited: false }, configured: true, active: true } }))
))

const renderPage = (permissions = [PERMISSION.MERCHANT_NOTIFICATION_VIEW, PERMISSION.MERCHANT_NOTIFICATION_MANAGE]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<NotificationPage />, { store })
}

describe('NotificationPage API', () => {
  it('chỉ tải cấu hình sau khi chọn Merchant', async () => {
    renderPage()
    expect(screen.getByText('Chọn Merchant để xem và chỉnh sửa thông báo.')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getAllByLabelText('Chọn Merchant')[0].querySelector('.ant-select-selector')!)
    await userEvent.setup().click(await screen.findByText('M001 — Merchant A'))
    expect(await screen.findByDisplayValue('ops@example.com')).toBeInTheDocument()
  })

  it('không cho quyền chỉ xem lưu cấu hình', async () => {
    renderPage([PERMISSION.MERCHANT_NOTIFICATION_VIEW])
    fireEvent.mouseDown(screen.getAllByLabelText('Chọn Merchant')[0].querySelector('.ant-select-selector')!)
    await userEvent.setup().click(await screen.findByText('M001 — Merchant A'))
    await screen.findByDisplayValue('ops@example.com')
    expect(screen.queryByRole('button', { name: 'Lưu cấu hình' })).toBeNull()
  })
})
