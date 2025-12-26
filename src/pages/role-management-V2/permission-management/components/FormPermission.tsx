import { PermissionItem } from '@type/permissionManagement'
import { Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import React, { useState } from 'react'

interface Props {
  dataSource?: PermissionItem[]
  onSelectionChange?: (selectedIds: string[]) => void
}

const FormPermission = ({ dataSource, onSelectionChange }: Props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])

  const columns: ColumnType<PermissionItem>[] = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      align: 'center',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'center',
      render: (value) => value || '--',
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
      onSelectionChange?.(newSelectedRowKeys as string[])
    },
  }

  return (
    <div>
      <Table
        rowSelection={rowSelection}
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