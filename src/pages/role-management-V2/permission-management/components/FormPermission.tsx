import { ModeAction } from '@pages/role-management-V2/permission-management/hooks/usePermissionRole'
import { PermissionItem } from '@type/permissionManagement'
import { Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { Key, useState } from 'react'

interface Props {
  dataSource?: PermissionItem[]
  onSelectionChange?: (selectedIds: string[]) => void
  modeAction?: ModeAction
}

const FormPermission = ({ dataSource, onSelectionChange, modeAction }: Props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])

  const columns: ColumnType<PermissionItem>[] = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      align: 'center'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'center',
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

export default FormPermission