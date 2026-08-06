import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { Table } from 'antd'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import type { DataRoleItem } from '@type/roleManagement'
import { getRoleManagementColumn } from '../RoleManagement.column'

const role = {
  id: '1',
  name: 'ROLE_ADMIN',
  description: 'Quản trị'
} as unknown as DataRoleItem

const renderColumns = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <Table
        rowKey='id'
        dataSource={[role]}
        pagination={false}
        columns={getRoleManagementColumn({ openModal: vi.fn() })}
      />
    </Provider>
  )
}

describe('cột thao tác màn Nhóm quyền', () => {
  it('ROLE:VIEW chỉ hiện hai hành động xem', () => {
    renderColumns(['EWALLET:ROLE:VIEW'])

    expect(screen.getByLabelText('Xem quyền của nhóm')).toBeInTheDocument()
    expect(screen.getByLabelText('Xem thành viên')).toBeInTheDocument()
    expect(screen.queryByLabelText('Sửa nhóm quyền')).toBeNull()
    expect(screen.queryByLabelText('Xoá nhóm quyền')).toBeNull()
    expect(screen.queryByLabelText('Gán quyền')).toBeNull()
  })

  it('ROLE:UPDATE hiện sửa và gán quyền', () => {
    renderColumns(['EWALLET:ROLE:VIEW', 'EWALLET:ROLE:UPDATE'])

    expect(screen.getByLabelText('Sửa nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán quyền')).toBeInTheDocument()
    expect(screen.queryByLabelText('Xoá nhóm quyền')).toBeNull()
  })

  it('ROLE:FULL hiện đủ hành động', () => {
    renderColumns(['EWALLET:ROLE:FULL'])
    expect(screen.getByLabelText('Xoá nhóm quyền')).toBeInTheDocument()
    expect(screen.getByLabelText('Gán quyền')).toBeInTheDocument()
  })
})
