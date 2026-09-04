import { useState, useEffect, memo, Key, useMemo } from 'react'
import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import { useGetPermissionQuery } from '@services/apiPermission'
import {
  useLazyGetPermissionAssignQuery,
  usePostPermissionAvailableMutation,
  useDeletePermissionAssignMutation
} from '@services/apiPermissionAssign'
import { useMessage } from '@hooks/useMessage'
import { translatePermissionName } from '@/pages/role-management-V2/permission-management/constants/PermissionManagement.constant'
import { PermissionItem } from '@type/permissionManagement'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'
import { ASSIGN_PERMISSIONS_FORM_ID } from '../constants/RoleManagement.constant'

interface Props {
  roleId?: string
  onSuccess: () => void
  onLoadingChange?: (loading: boolean) => void
}

const PERMISSION_CATALOG_SORT = {
  sortBy: 'createdAt',
  sortDirection: 'DESC'
} as const

const DialogAssignPermissions = ({
  roleId,
  onSuccess,
  onLoadingChange
}: Props) => {
  const { successMess, errorMess } = useMessage()
  const [loading, setLoading] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([])
  const [assignedPermissionNames, setAssignedPermissionNames] = useState<
    string[]
  >([])

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const { data: allPermissionsData, isFetching: isFetchingPage } =
    useGetPermissionQuery({
      page,
      size: pageSize,
      ...PERMISSION_CATALOG_SORT
    })
  const catalogSize = Math.max(
    allPermissionsData?.totalElements ?? pageSize,
    pageSize
  )
  const needsPermissionCatalog = catalogSize > pageSize
  const { data: permissionCatalogData, isFetching: isFetchingCatalog } =
    useGetPermissionQuery(
      {
        page: 1,
        size: catalogSize,
        ...PERMISSION_CATALOG_SORT
      },
      { skip: !needsPermissionCatalog }
    )

  const allPermissionNames = useMemo(
    () =>
      (permissionCatalogData?.content ?? allPermissionsData?.content)?.map(
        (permission) => permission.name
      ) ?? [],
    [allPermissionsData?.content, permissionCatalogData?.content]
  )

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
      title: 'Mã quyền',
      dataIndex: 'name',
      align: 'left'
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
    onChange: (
      newSelectedRowKeys: Key[],
      _selectedRows: PermissionItem[],
      info: { type: 'all' | 'none' | 'invert' | 'single' | 'multiple' }
    ) => {
      if (info.type === 'all') return
      setSelectedRowKeys(newSelectedRowKeys)
    },
    onSelectAll: (selected: boolean) => {
      setSelectedRowKeys(selected ? allPermissionNames : [])
    }
  }

  const handleSubmit = async () => {
    if (!roleId) return
    setLoading(true)
    onLoadingChange?.(true)

    const originalAssigned = new Set(assignedPermissionNames)
    const newSelected = new Set(selectedRowKeys as string[])

    const toAdd = (selectedRowKeys as string[]).filter(
      (p) => !originalAssigned.has(p)
    )
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
      onLoadingChange?.(false)
    }
  }

  return (
    <form
      id={ASSIGN_PERMISSIONS_FORM_ID}
      onSubmit={(event) => {
        event.preventDefault()
        if (!loading) handleSubmit()
      }}
    >
      <Table
        loading={isFetchingPage || isFetchingCatalog}
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
            setPage(newPageSize !== pageSize ? 1 : newPage)
            setPageSize(newPageSize)
          }
        }}
      />
    </form>
  )
}

export default memo(DialogAssignPermissions)
