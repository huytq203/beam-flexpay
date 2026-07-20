import { CardComponent, Table } from '@components/index'
import { useState, useEffect, memo } from 'react'
import { useLazyGetPermissionAssignQuery } from '@services/apiPermissionAssign'
import { translatePermissionName } from '@pages/role-management-V2/role-management/constants/RoleManagement.config'
import { PermissionItem } from '@type/permissionManagement'
import { ColumnType } from 'antd/es/table'
import { ButtonComponent } from '@components/index'

interface Props {
  roleId?: string
  onCancel: () => void
}

const DialogViewPermissions = ({ roleId, onCancel }: Props) => {
  const [dataSource, setDataSource] = useState<PermissionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [getPermissionAssigned] = useLazyGetPermissionAssignQuery()

  useEffect(() => {
    if (!roleId) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getPermissionAssigned(roleId).unwrap()
        setDataSource(data.data ?? [])
      } catch {
        setDataSource([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roleId, getPermissionAssigned])

  const columns: ColumnType<PermissionItem>[] = [
    {
      title: 'Tên quyền',
      dataIndex: 'name',
      align: 'left',
      render: (_, record) => translatePermissionName(record.name)
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'left',
      render: (value) => value || '--'
    }
  ]

  return (
    <div>
      <CardComponent
        content={
          <Table
            columns={columns}
            dataSource={dataSource?.map((item) => ({ ...item, key: item.name }))}
            size='small'
            bordered
            loading={loading}
            pagination={false}
          />
        }
      />
      <div className='flex justify-end items-center gap-2 mt-4'>
        <ButtonComponent type='default' content='Đóng' onClick={onCancel} />
      </div>
    </div>
  )
}

export default memo(DialogViewPermissions)
