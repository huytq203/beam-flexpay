import { Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import { Key, useEffect, useState } from 'react'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRoleItem } from '@type/roleManagement'
import { RoleName } from '@pages/role-management-V2/permission-management/configs/PermissionManagement.config'
import { useGetUserRoleQuery } from '@services/apiUserRoleAssign'

interface RoleData {
  content?: DataRoleItem[]
}

interface Props {
  userId?: string
  onSelectionChange?: (selectedIds: string[], initialIds: string[]) => void
  isLoadingRoles?: boolean
  roleData?: RoleData
  onLoadingUserRolesChange?: (isLoading: boolean) => void
}

const FormRoleAssign = ({ userId, onSelectionChange, roleData, isLoadingRoles, onLoadingUserRolesChange }: Props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([])
  
  const { data: userRoleData, isLoading: isLoadingUserRoles } = useGetUserRoleQuery(userId!, {
    skip: !userId
  })
  useEffect(() => {
    onLoadingUserRolesChange?.(isLoadingUserRoles)
  }, [isLoadingUserRoles, onLoadingUserRolesChange])

  useEffect(() => {
    if (userRoleData?.data) {
      const existingRoleIds = userRoleData.data.map((role: any) => role.id)
      setSelectedRowKeys(existingRoleIds)
      setInitialRoleIds(existingRoleIds)
    }
  }, [userRoleData])

  const columns: ColumnType<DataRoleItem>[] = [
    {
      title: 'Tên nhóm quyền',
      dataIndex: 'name',
      align: 'center',
      render: (value) => RoleName[value] ?? value ?? '--'
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
      onSelectionChange?.(newSelectedRowKeys as string[], initialRoleIds)
    }
  }

  const dataSource = roleData?.content?.map((item) => ({
    ...item,
    key: item.id
  })) ?? []

  return (
    <div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        size='small'
        bordered
        loading={isLoadingUserRoles }
        pagination={false}
      />
    </div>
  )
}

export default FormRoleAssign


