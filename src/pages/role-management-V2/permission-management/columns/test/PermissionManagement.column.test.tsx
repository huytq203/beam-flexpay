import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { PermissionItem } from '@type/permissionManagement'
import { getPermissionManagementColumns } from '../PermissionManagement.column'

const permission = {
  id: '1',
  name: 'EWALLET:USER:VIEW',
  description: 'Xem user',
  createdAt: '2026-08-10 14:30:00',
  createdBy: 'admin.creator',
  updatedAt: '2026-08-11 09:05:12',
  updatedBy: 'admin.editor'
} as unknown as PermissionItem

const renderColumns = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <Table
        rowKey='id'
        dataSource={[permission]}
        pagination={false}
        columns={getPermissionManagementColumns({ openModal: vi.fn() })}
      />
    </Provider>
  )
}

describe('cột thao tác màn Quyền', () => {
  it('chỉ hiển thị mã và mô tả quyền, không hiển thị tên quyền', () => {
    renderColumns(['EWALLET:PERMISSION:VIEW'])

    expect(screen.queryByRole('columnheader', { name: 'Tên quyền' })).toBeNull()
    expect(
      screen.getByRole('columnheader', { name: 'Mã quyền' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('columnheader', { name: 'Mô tả' })
    ).toBeInTheDocument()
  })

  it('hiển thị đầy đủ dấu vết tạo và cập nhật', () => {
    renderColumns(['EWALLET:PERMISSION:VIEW'])

    expect(screen.getByText('10/08/2026 14:30:00')).toBeInTheDocument()
    expect(screen.getByText('Bởi admin.creator')).toBeInTheDocument()
    expect(screen.getByText('11/08/2026 09:05:12')).toBeInTheDocument()
    expect(screen.getByText('Bởi admin.editor')).toBeInTheDocument()
  })

  it('PERMISSION:VIEW ẩn sửa và xoá', () => {
    renderColumns(['EWALLET:PERMISSION:VIEW'])
    expect(screen.queryByLabelText('Sửa quyền')).toBeNull()
    expect(screen.queryByLabelText('Xoá quyền')).toBeNull()
  })

  it('PERMISSION:UPDATE chỉ hiện sửa', () => {
    renderColumns(['EWALLET:PERMISSION:UPDATE'])
    expect(screen.getByLabelText('Sửa quyền')).toBeInTheDocument()
    expect(screen.queryByLabelText('Xoá quyền')).toBeNull()
  })

  it('PERMISSION:FULL hiện sửa và xoá', () => {
    renderColumns(['EWALLET:PERMISSION:FULL'])
    expect(screen.getByLabelText('Sửa quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Xoá quyền')).toBeInTheDocument()
  })
})
