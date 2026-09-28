import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
import { Key, useMemo, useState, memo } from 'react'
import { ButtonComponent, Input } from '@components/index'
import { useGetRoleByKeyQuery } from '@services/apiRole'
import {
  useGetUserRoleQuery,
  useAssignRoleUserMutation,
  useDeleteRoleUserMutation
} from '@services/apiUserRoleAssign'
import { useMessage } from '@hooks/useMessage'
import { DataRoleItem } from '@type/roleManagement'

interface Props {
  userId?: string
  onSuccess: () => void
  onCancel: () => void
}

const DialogAssignRoles = ({ userId, onSuccess, onCancel }: Props) => {
  const { successMess } = useMessage()
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [keyword, setKeyword] = useState('')
  const [selection, setSelection] = useState<{
    userId?: string
    keys: Key[]
  } | null>(null)

  const { data: roleData, isFetching: isFetchingRoles } = useGetRoleByKeyQuery({
    keyword,
    page: 1,
    size: 1000
  })
  const { data: userRoleData, isLoading: isLoadingUserRoles } =
    useGetUserRoleQuery(userId!, {
      skip: !userId
    })

  const [assignRoleUser] = useAssignRoleUserMutation()
  const [deleteRoleUser] = useDeleteRoleUserMutation()

  const initialRoleIds = useMemo(() => {
    // `useGetUserRoleQuery` has no typed result (see @services/apiUserRoleAssign),
    // so the response payload is pinned to its real shape here.
    const assignedRoles = (userRoleData?.data ?? []) as DataRoleItem[]
    return assignedRoles.map((role) => role.id)
  }, [userRoleData?.data])
  const selectedRowKeys =
    selection && selection.userId === userId ? selection.keys : initialRoleIds

  const columns: ColumnType<DataRoleItem>[] = [
    {
      title: 'Mô tả',
      dataIndex: 'description',
      align: 'left',
      render: (_, role) => role.description || role.name
    }
  ]

  const rowSelection = {
    selectedRowKeys,
    preserveSelectedRowKeys: true,
    onChange: (newSelectedRowKeys: Key[]) => {
      setSelection({ userId, keys: newSelectedRowKeys })
    }
  }

  const dataSource =
    roleData?.content?.map((item) => ({
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

  const applySearch = () => {
    setKeyword(searchText.trim())
  }

  return (
    <div>
      <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-end'>
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <label
            htmlFor='assign-role-search'
            className='text-sm font-medium text-foreground'
          >
            Tìm nhóm quyền
          </label>
          <Input
            id='assign-role-search'
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            onPressEnter={(event) => {
              event.preventDefault()
              applySearch()
            }}
            placeholder='Nhập mã nhóm quyền'
            allowClear
          />
        </div>
        <ButtonComponent
          htmlType='button'
          content='Tìm kiếm'
          onClick={applySearch}
        />
      </div>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        size='small'
        bordered
        loading={isLoadingUserRoles || isFetchingRoles}
        pagination={false}
      />
      <div className='flex justify-end items-center gap-2 mt-4'>
        <ButtonComponent
          type='default'
          content='Hủy'
          onClick={onCancel}
        />
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
