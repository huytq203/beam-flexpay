import { useState, useEffect, memo, Key } from 'react'
import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import { ButtonComponent } from '@components/index'
import { useGetPermissionQuery } from '@services/apiPermission'
import {
  useLazyGetPermissionAssignQuery,
  usePostPermissionAvailableMutation,
  useDeletePermissionAssignMutation
} from '@services/apiPermissionAssign'
import { useMessage } from '@hooks/useMessage'
import { translatePermissionName } from '@pages/role-management-V2/role-management/constants/RoleManagement.config'
import { PermissionItem } from '@type/permissionManagement'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'

interface Props {
  roleId?: string
  onSuccess: () => void
  onCancel: () => void
}

const DialogAssignPermissions = ({ roleId, onSuccess, onCancel }: Props) => {
  const { successMess, errorMess } = useMessage()
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [assignedPermissionNames, setAssignedPermissionNames] = useState<string[]>([])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: allPermissionsData } = useGetPermissionQuery({
    page,
    size: pageSize,
    sortBy: 'id',
    sortDirection: 'DESC'
  })

  const [getPermissionAssigned] = useLazyGetPermissionAssignQuery()
  const [postPermission] = usePostPermissionAvailableMutation()
  const [deletePermissionAssign] = useDeletePermissionAssignMutation()

  useEffect(() => {
    if (!roleId) return
    const fetchAssigned = async () => {
      try {
        const data = await getPermissionAssigned(roleId).unwrap()
        const names = (data.data ?? []).map((p: PermissionItem) => p.name)
        setAssignedPermissionNames(names)
        setSelectedRowKeys(names)
      } catch {
        setAssignedPermissionNames([])
        setSelectedRowKeys([])
      }
    }
    fetchAssigned()
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

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (newSelectedRowKeys: Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys)
    }
  }

  const handleSubmit = async () => {
    if (!roleId) return
    setLoading(true)

    const originalAssigned = new Set(assignedPermissionNames)
    const newSelected = new Set(selectedRowKeys as string[])

    const toAdd = (selectedRowKeys as string[]).filter((p) => !originalAssigned.has(p))
    const toRemove = assignedPermissionNames.filter((p) => !newSelected.has(p))

    try {
      if (toAdd.length > 0) {
        await postPermission({
          roleId,
          body: { permissionNames: toAdd }
        }).unwrap()
      }
      if (toRemove.length > 0) {
        await deletePermissionAssign({
          roleId,
          body: { permissionNames: toRemove }
        }).unwrap()
      }
      successMess('Cập nhật quyền thành công')
      onSuccess()
    } catch (error) {
      errorMess(getApiErrorDetail(error) || 'Có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={allPermissionsData?.content?.map((item) => ({
          ...item,
          key: item.name
        }))}
        size='small'
        bordered
        pagination={{
          current: page,
          pageSize: pageSize,
          total: allPermissionsData?.totalElements ?? 0,
          showSizeChanger: true,
          onChange: (newPage, newPageSize) => {
            setPage(newPage)
            setPageSize(newPageSize)
          }
        }}
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

export default memo(DialogAssignPermissions)
