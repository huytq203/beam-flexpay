import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { UserInfor } from '@type/userManagement'
import { getUserManagementColumn } from '../UserManagement.column'

const user = {
  id: '1',
  username: 'nguyenvana',
  firstName: 'Nguyen',
  lastName: 'Van A',
  email: 'a@example.com',
  emailVerified: true,
  enabled: true,
  createdAt: '2026-08-01T08:00:00',
  createdBy: 'root.admin',
  updatedAt: '2026-08-10T09:15:30',
  updatedBy: 'admin.cms'
} as unknown as UserInfor

const renderColumns = (
  permissions: string[],
  options: { currentUserId?: string; record?: UserInfor } = {}
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <Table
        rowKey='id'
        dataSource={[options.record ?? user]}
        pagination={false}
        columns={getUserManagementColumn({
          openModal: vi.fn(),
          currentUserId: options.currentUserId
        })}
      />
    </Provider>
  )
}

describe('cột thao tác quản lý tài khoản Admin', () => {
  it('USER:VIEW chỉ hiện xem chi tiết', () => {
    renderColumns(['EWALLET:USER:VIEW'])

    expect(screen.getByLabelText('Xem chi tiết')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sửa tài khoản')).toBeNull()
    expect(screen.queryByLabelText('Gán nhóm quyền')).toBeNull()
    expect(screen.queryByLabelText('Đặt lại mật khẩu')).toBeNull()
  })

  it('USER:UPDATE hiện các hành động cập nhật', () => {
    renderColumns(['EWALLET:USER:VIEW', 'EWALLET:USER:UPDATE'])

    expect(screen.getByLabelText('Sửa tài khoản')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Đặt lại mật khẩu')).toBeInTheDocument()
  })

  it('super-admin thấy đủ hành động', () => {
    renderColumns(['EWALLET:ADMIN:FULL'])
    expect(screen.getByLabelText('Sửa tài khoản')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán nhóm quyền')).toBeInTheDocument()
  })

  it('hiển thị dấu vết cập nhật ngay trên danh sách', () => {
    renderColumns(['EWALLET:USER:VIEW'])

    expect(screen.getByText('01/08/2026 08:00:00')).toBeInTheDocument()
    expect(screen.getByText('Bởi root.admin')).toBeInTheDocument()
    expect(screen.getByText('10/08/2026 09:15:30')).toBeInTheDocument()
    expect(screen.getByText('Bởi admin.cms')).toBeInTheDocument()
  })

  it('không hiện reset cho chính mình hoặc tài khoản không đủ điều kiện', () => {
    const rendered = renderColumns(
      ['EWALLET:USER:UPDATE'],
      { currentUserId: user.id }
    )

    expect(screen.queryByLabelText('Đặt lại mật khẩu')).toBeNull()
    rendered.unmount()

    renderColumns(
      ['EWALLET:USER:UPDATE'],
      { record: { ...user, enabled: false } }
    )
    expect(screen.queryByLabelText('Đặt lại mật khẩu')).toBeNull()
  })
})
