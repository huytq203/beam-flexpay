import { ModeAction } from '@pages/role-management-V2/permission-management/hooks/usePermissionRole'
import { translatePermissionName } from '@pages/role-management-V2/role-management/constants/RoleManagement.config'
import { PermissionItem } from '@type/permissionManagement'
import { Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { Key, useEffect, useState, memo } from 'react'

interface Props {
  dataSource?: PermissionItem[]
  onSelectionChange?: (selectedIds: string[]) => void
  modeAction?: ModeAction
  // Pre-selected permission names (for unified permission flow)
  assignedPermissionNames?: string[]
}

const FormPermission = ({
  dataSource,
  onSelectionChange,
  modeAction,
  assignedPermissionNames = []
}: Props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  // Sync selected rows with assigned permissions when modal opens
  useEffect(() => {
    if (assignedPermissionNames.length > 0) {
      setSelectedRowKeys(assignedPermissionNames)
      onSelectionChange?.(assignedPermissionNames)
    }
  }, [assignedPermissionNames])

  const columns: ColumnType<PermissionItem>[] = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      align: 'left',
      render(value, record) {
        return (
          <div className=''>
            <p>{translatePermissionName(record.name)}</p>
          </div>
        )
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'left',
      render: (value) => value || '--'
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
      onSelectionChange?.(newSelectedRowKeys as string[])
    }
  }

  return (
    <div>
      <Table
        rowSelection={modeAction !== 'view' ? rowSelection : undefined}
        columns={columns}
        dataSource={dataSource?.map((item) => ({ ...item, key: item.name }))}
        size='small'
        bordered
        pagination={false}
      />
    </div>
  )
}

export default memo(FormPermission)
