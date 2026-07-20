import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import { Key, useEffect, useState, memo } from 'react'
import { ButtonComponent } from '@components/index'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import {
  useGetUserRoleQuery,
  useAssignRoleUserMutation,
  useDeleteRoleUserMutation
} from '@services/apiUserRoleAssign'
import { useMessage } from '@hooks/useMessage'
import { DataRoleItem } from '@type/roleManagement'
import { RoleName } from '@pages/role-management-V2/permission-management/constants/PermissionManagement.constant'

interface Props {
  userId?: string
  onSuccess: () => void
  onCancel: () => void
}

const DialogAssignRoles = ({ userId, onSuccess, onCancel }: Props) => {
  const { successMess } = useMessage()
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([])

  const { data: roleData } = useGetRoleQuery({ page: 1, size: 1000 })
  const { data: userRoleData, isLoading: isLoadingUserRoles } = useGetUserRoleQuery(userId!, {
    skip: !userId
  })

  const [assignRoleUser] = useAssignRoleUserMutation()
  const [deleteRoleUser] = useDeleteRoleUserMutation()

  useEffect(() => {
    if (userRoleData?.data) {
      // `useGetUserRoleQuery` has no typed result (see @services/apiUserRoleAssign),
      // so the response payload is pinned to its real shape here.
      const assignedRoles: DataRoleItem[] = userRoleData.data
      const existingRoleIds = assignedRoles.map((role) => role.id)
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
    }
  }

  const dataSource = roleData?.content?.map((item) => ({
    ...item,
    key: item.id
  })) ?? []

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)

    const rolesToAdd = (selectedRowKeys as string[]).filter(
      (id) => !initialRoleIds.includes(id)
    )
    const rolesToRemove = initialRoleIds.filter(
      (id) => !(selectedRowKeys as string[]).includes(id)
    )

    try {
      if (rolesToAdd.length > 0) {
        await assignRoleUser({
          id: userId,
          body: { roleIds: rolesToAdd }
        }).unwrap()
      }
      if (rolesToRemove.length > 0) {
        await deleteRoleUser({
          id: userId,
          body: { roleIds: rolesToRemove }
        }).unwrap()
      }
      successMess('Cập nhật thành công')
      onSuccess()
    } catch {
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        size='small'
        bordered
        loading={isLoadingUserRoles}
        pagination={false}
      />
      <div className='flex justify-end items-center gap-2 mt-4'>
        <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
        <ButtonComponent
          type='primary'
          content='Lưu'
          onClick={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  )
}

export default memo(DialogAssignRoles)
