import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { Table } from 'antd'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { PERMISSION } from '@/app/permissions'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { UserInfor } from '@type/userManagement'
import { getUserManagementColumn } from '../../../role-management-V2/user-management/columns/UserManagement.column'
import { UserAssignmentDialog } from '../components/UserAssignmentDialog'

vi.setConfig({ testTimeout: 30000 })

const ACTIVE = { id: 'u-1', username: 'sales.an', enabled: true } as UserInfor
const LOCKED = { id: 'u-2', username: 'old.user', enabled: false } as UserInfor

const renderWith = (ui: React.ReactNode, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MessageProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </MessageProvider>
    </Provider>
  )
}

const envelope = (data: unknown) => HttpResponse.json({ data, success: true })

describe('hành động "Gán phụ trách merchant" ở danh sách tài khoản', () => {
  const renderColumns = (permissions: string[]) =>
    renderWith(
      <Table
        rowKey='id'
        pagination={false}
        dataSource={[ACTIVE, LOCKED]}
        columns={getUserManagementColumn({ openModal: vi.fn() })}
      />,
      permissions
    )

  it('ẩn khi không có quyền MANAGE (chỉ xem)', () => {
    renderColumns([PERMISSION.MERCHANT_ASSIGNMENT_VIEW])
    expect(screen.queryByLabelText('Gán phụ trách merchant')).toBeNull()
  })

  it('chỉ hiện cho tài khoản đang hoạt động khi có quyền MANAGE', () => {
    renderColumns([PERMISSION.MERCHANT_ASSIGNMENT_MANAGE])
    expect(screen.getAllByLabelText('Gán phụ trách merchant')).toHaveLength(1)
  })
})

describe('hộp thoại gán phụ trách theo người dùng', () => {
  const open = (onClose = () => {}) => {
    server.use(
      http.get('*/users/u-1/assignments', () =>
        envelope({
          content: [
            {
              level: 'MASTER',
              merchantId: 'm1',
              merchantCode: 'MC1',
              merchantName: 'Cà phê Mộc',
              adminUserId: 'u-1',
              assignedAt: '2026-10-22T10:15:30'
            }
          ],
          totalElements: 1,
          number: 1,
          size: 100
        })
      )
    )
    return renderWith(
      <UserAssignmentDialog
        user={{ id: 'u-1', label: 'An (sales.an)' }}
        onClose={onClose}
      />,
      [PERMISSION.MERCHANT_ASSIGNMENT_MANAGE]
    )
  }

  it('hiện danh sách đang phụ trách và chặn khi chưa chọn merchant', async () => {
    const user = userEvent.setup()
    open()
    const dialog = await screen.findByRole('dialog', {
      name: 'Gán phụ trách merchant'
    })
    expect(
      await within(dialog).findByText('Cà phê Mộc (MC1)')
    ).toBeInTheDocument()
    expect(within(dialog).getByText(/Gán lúc/)).toBeInTheDocument()
    await user.click(
      within(dialog).getByRole('button', { name: 'Gán phụ trách' })
    )
    expect(
      await within(dialog).findByText(/Chọn Master cần/)
    ).toBeInTheDocument()
  })

  it.each([
    ['Master', 'merchants', 'Chọn Merchant Cà phê Mộc'],
    ['Sub-merchant', 'sub-merchants', 'Chọn Sub-merchant Quầy 1']
  ])(
    'cấp %s: POST đúng adminUserId và lý do tới /%s/{id}/assignments',
    async (level, path, pickLabel) => {
      const user = userEvent.setup()
      let body: unknown
      const onClose = vi.fn()
      server.use(
        http.get('*/merchants', () =>
          envelope({
            content: [{ id: 't1', code: 'MC1', name: 'Cà phê Mộc' }],
            totalElements: 1
          })
        ),
        http.get('*/sub-merchants', () =>
          envelope({
            content: [{ id: 't1', code: 'SB1', name: 'Quầy 1' }],
            totalElements: 1
          })
        ),
        http.post(`*/${path}/t1/assignments`, async ({ request }) => {
          body = await request.json()
          return envelope({ adminUserId: 'u-1' })
        })
      )
      open(onClose)
      const dialog = await screen.findByRole('dialog', {
        name: 'Gán phụ trách merchant'
      })
      await user.click(within(dialog).getByRole('radio', { name: level }))
      await user.click(within(dialog).getByPlaceholderText(`Chọn ${level}`))
      await user.click(await screen.findByLabelText(pickLabel))
      await user.type(within(dialog).getByLabelText(/Lý do/), 'Phụ trách HCM')
      await user.click(
        within(dialog).getByRole('button', { name: 'Gán phụ trách' })
      )
      await waitFor(() => expect(onClose).toHaveBeenCalled())
      expect(body).toEqual({ adminUserId: 'u-1', reason: 'Phụ trách HCM' })
    }
  )
})
