import { ButtonComponent } from '@components/common'
import { useMessage } from '@hooks/useMessage'
import { useGetUserQuery, useLazyGetUserByIdQuery } from '@services/apiUserManagement'
import { UserInfor } from '@type/userManagement'
import { useState } from 'react'
import { ActionMode } from '../UserManagement'
import { FormSendEmail } from '../components/FormSendEmail'
import { RoleManagemenColume } from '../UserManagement.colume'
import dayjs from 'dayjs'
import { useGetRoleQuery } from '@services/apiRole'

export const useFormManagement = () => {
  // state
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalDetail, setOpenModalDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfor | undefined>(undefined)
  const [modeAction, setModeAction] = useState<ActionMode>('')
  const [openDialog, setOpenDialog] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  // hook
  const { errorMess } = useMessage()

  // api
  const defaultPagination = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDirection: 'DESC'
  }
  const { data: getUser } = useGetUserQuery(defaultPagination)
  const [getUserById] = useLazyGetUserByIdQuery()
  const { data: getRole } = useGetRoleQuery({})

  const roleOptions = getRole?.content?.map((role) => ({
    value: role.name,
    label: role.name
  })) ?? []

  // logic
  const dataSource = getUser?.content.map((item, index) => ({
    ...item,
    no: index + 1,
    createdTimestamp: item.createdTimestamp
      ? dayjs(item.createdTimestamp).format('DD/MM/YYYY HH:mm:ss')
      : '--'
  }))

  const typeFooter: Partial<Record<ActionMode, JSX.Element>> = {
    delete: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' />
        <ButtonComponent type='primary' danger content='Delete' />
      </div>
    ),
    resetPass: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' />
        <ButtonComponent
          type='primary'
          className='bg-teal-700 hover:!bg-teal-600'
          content='Send email'
        />
      </div>
    )
  }

  const typeText: Partial<Record<ActionMode, JSX.Element>> = {
    delete: (
      <span>
        Bạn có chắc chắn muốn <span className='font-bold'>xóa tài khoản</span>{' '}
        admin <span className='font-bold'>{selectedUser?.username}</span> không? Hành động này
        không thể hoàn tác.
      </span>
    ),
    lock: (
      <span>
        Bạn có chắc chắn muốn <span className='font-bold'>khóa tài khoản</span>{' '}
        admin <span className='font-bold'>{selectedUser?.username}</span> không? Tài khoản sẽ
        không thể đăng nhập cho đến khi mở lại.
      </span>
    ),
    unlock: (
      <span>
        Bạn có chắc chắn muốn{' '}
        <span className='font-bold'>mở khóa tài khoản</span> admin{' '}
        <span className='font-bold'>{selectedUser?.username}</span> không? Tài khoản này sẽ có
        thể hoạt động trở lại.
      </span>
    ),
    resetPass: <FormSendEmail selectedUser={selectedUser} />
  }

  const normalizeUser = (data: UserInfor): UserInfor => ({
    id: data.id,
    username: data.username,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    enabled: data.enabled,
    emailVerified: data.emailVerified,
    createdTimestamp: data.createdTimestamp ?? null,
    groups: Array.isArray(data.groups)
      ? data.groups
      : data.groups
        ? [data.groups]
        : null
  })

  const getUserInfo = async (id: string) => {
    setIsLoadingDetail(true)
    try {
      const dataUser = await getUserById(id)
      const dataNormal = normalizeUser(dataUser?.data?.data)
      setSelectedUser(dataNormal)
    } catch (error: any) {
      errorMess(error?.data?.detail)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleOpenDetail = (record: UserInfor) => {
    getUserInfo(record.id)
    setOpenModalDetail(true)
    setModeAction('add')
  }

  const handleOpenUpdate = (record: UserInfor) => {
    getUserInfo(record.id)
    setOpenModalAdd(true)
    setModeAction('update')
  }

  const column = RoleManagemenColume({
    setOpenModalDetail,
    setModeAction,
    setOpenDialog,
    handleOpenDetail,
    setOpenModalAdd,
    handleOpenUpdate,
    setSelectedUser
  })

  return {
    openModalAdd,
    setOpenModalAdd,
    openModalDetail,
    setOpenModalDetail,
    selectedUser,
    setSelectedUser,
    modeAction,
    setModeAction,
    openDialog,
    setOpenDialog,
    isLoadingDetail,
    dataSource,
    typeFooter,
    typeText,
    normalizeUser,
    getUserInfo,
    column,
    handleOpenUpdate,
    roleOptions
  }
}
