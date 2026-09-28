import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import NotificationPage from '../pages/NotificationPage'

const masterRow = {
  configId: 'config-master',
  merchantId: 'merchant-1',
  subMerchantId: null,
  merchantName: 'Highlands Coffee',
  merchantCode: 'MC000142',
  appliedLevel: 'MASTER',
  source: 'OWN',
  transactionNotificationEnabled: true,
  channels: ['EMAIL'],
  notificationEmails: ['ops@hlc.vn'],
  reconciliationEmails: [],
  invoiceEmails: [],
  active: true,
  updatedAt: '2026-09-25T04:00:00',
  updatedBy: 'admin',
  version: 3
}

const inheritedSubRow = {
  ...masterRow,
  configId: null,
  subMerchantId: 'sub-1',
  merchantName: 'HLC Nguyễn Huệ',
  merchantCode: 'SUB-0142-01',
  appliedLevel: 'SUB',
  source: 'INHERITED',
  version: null
}

const ownSubRow = {
  ...inheritedSubRow,
  configId: 'config-sub',
  source: 'OWN',
  version: 7
}

const listRequests: URL[] = []

beforeEach(() => {
  listRequests.length = 0
  server.use(
    http.get('*/merchants/notifications', ({ request }) => {
      listRequests.push(new URL(request.url))
      return HttpResponse.json({
        data: {
          content: [masterRow, inheritedSubRow, ownSubRow],
          totalElements: 3,
          number: 0,
          size: 20
        }
      })
    })
  )
})

const renderPage = (
  permissions = [
    PERMISSION.MERCHANT_NOTIFICATION_VIEW,
    PERMISSION.MERCHANT_NOTIFICATION_MANAGE
  ]
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<NotificationPage />, { store })
}

describe('NotificationPage — danh sách cấu hình thông báo', () => {
  it('hiển thị mọi phạm vi kèm nguồn cấu hình và lọc trên server khi bấm Tìm kiếm', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText('Highlands Coffee')).toBeInTheDocument()
    expect(screen.getByText('Kế thừa Master')).toBeInTheDocument()
    expect(screen.getAllByText('Cấu hình riêng')).toHaveLength(2)

    await user.type(screen.getByLabelText('Từ khóa'), ' HLC ')
    await user.click(screen.getByText('Tìm kiếm'))

    await waitFor(() =>
      expect(listRequests.at(-1)?.searchParams.get('search')).toBe('HLC')
    )
    expect(listRequests.at(-1)?.searchParams.get('page')).toBe('1')
  })

  it('chỉ quyền xem thì không có thao tác thêm hay sửa', async () => {
    renderPage([PERMISSION.MERCHANT_NOTIFICATION_VIEW])

    expect(await screen.findByText('Highlands Coffee')).toBeInTheDocument()
    expect(screen.queryByText('Thêm cấu hình')).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Sửa cấu hình Highlands Coffee' })
    ).toBeNull()
  })

  it('sửa cấu hình chỉ gửi field thay đổi kèm version và bắt buộc lý do', async () => {
    const user = userEvent.setup()
    let patchBody: unknown
    server.use(
      http.patch(
        '*/merchants/notifications/config-master',
        async ({ request }) => {
          patchBody = await request.json()
          return HttpResponse.json({
            data: { before: {}, after: {}, changes: {} }
          })
        }
      )
    )
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Sửa cấu hình Highlands Coffee'
      })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Cập nhật cấu hình thông báo'
    })
    expect(
      within(dialog).getByText('Chưa có thay đổi nào.')
    ).toBeInTheDocument()

    fireEvent.change(within(dialog).getByLabelText('Email đối soát'), {
      target: { value: 'Finance@HLC.vn\nfinance@hlc.vn' }
    })
    expect(
      within(dialog).getByText('Sẽ cập nhật: Email đối soát.')
    ).toBeInTheDocument()

    await user.click(
      within(dialog).getByRole('button', { name: 'Lưu thay đổi' })
    )
    expect(
      await within(dialog).findByText('Vui lòng nhập lý do thay đổi')
    ).toBeInTheDocument()
    expect(patchBody).toBeUndefined()

    await user.type(
      within(dialog).getByLabelText(/Lý do thay đổi/),
      'Thêm email kế toán'
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Lưu thay đổi' })
    )

    await waitFor(() =>
      expect(patchBody).toEqual({
        version: 3,
        reason: 'Thêm email kế toán',
        reconciliationEmails: ['finance@hlc.vn']
      })
    )
  })

  it('thiết lập riêng cho Sub đang kế thừa tạo cấu hình đúng phạm vi, điền sẵn giá trị', async () => {
    const user = userEvent.setup()
    let createdBody: unknown
    server.use(
      http.post('*/merchants/notifications', async ({ request }) => {
        createdBody = await request.json()
        return HttpResponse.json({ data: {} })
      })
    )
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Thiết lập cấu hình riêng HLC Nguyễn Huệ'
      })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Thiết lập cấu hình riêng'
    })
    expect(within(dialog).getByLabelText('Email thông báo')).toHaveValue(
      'ops@hlc.vn'
    )
    await user.click(
      within(dialog).getByRole('button', { name: 'Tạo cấu hình' })
    )

    await waitFor(() =>
      expect(createdBody).toEqual({
        masterMerchantId: 'merchant-1',
        subMerchantId: 'sub-1',
        transactionNotificationEnabled: true,
        channels: ['EMAIL'],
        notificationEmails: ['ops@hlc.vn'],
        active: true
      })
    )
  })

  it('kế thừa lại Master xóa cấu hình riêng của Sub kèm version và lý do', async () => {
    const user = userEvent.setup()
    let inheritUrl: URL | undefined
    server.use(
      http.delete(
        '*/merchants/notifications/config-sub/inherit',
        ({ request }) => {
          inheritUrl = new URL(request.url)
          return HttpResponse.json({ data: {} })
        }
      )
    )
    renderPage()

    await user.click(
      await screen.findByRole('button', {
        name: 'Kế thừa Master cho HLC Nguyễn Huệ'
      })
    )
    const dialog = await screen.findByRole('dialog', {
      name: 'Kế thừa cấu hình Master'
    })
    await user.type(within(dialog).getByLabelText(/Lý do/), 'Dùng chung Master')
    await user.click(
      within(dialog).getByRole('button', { name: 'Xác nhận kế thừa' })
    )

    await waitFor(() =>
      expect(inheritUrl?.searchParams.get('version')).toBe('7')
    )
    expect(inheritUrl?.searchParams.get('reason')).toBe('Dùng chung Master')
  })
})
