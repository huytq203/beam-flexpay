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
  description: 'Xem user'
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
