import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import {
  useGetUserQuery,
  useLazyGetUserByIdQuery
} from '@services/apiUserManagement'
import React, { useState } from 'react'
import FormSearch from './components/FormSearch'
import FormAdd from '@pages/role-management-V2/user-management/components/FormAdd'
import FormDetail from '@pages/role-management-V2/user-management/components/FormDetail'
import { RoleManagemenColume } from '@pages/role-management-V2/user-management/UserManagement.colume'
import { UserInfor } from '@type/userManagement'
import { MailOutlined } from '@components/icons/common'
import { useMessage } from '@hooks/useMessage'

export type ActionMode = 'delete' | 'lock' | 'unlock' | 'resetPass' | ''

const FormSendEmail = () => {
  return (
    <>
      <CardComponent
        content={
          <>
            <div className='flex justify-center items-center flex-col gap-5'>
              <div className='flex justify-center items-center'>
                <span className='w-12 h-12 bg-teal-100 text-teal-800 rounded-full flex justify-center items-center'>
                  <MailOutlined style={{ fontSize: '1.65rem' }} />
                </span>
              </div>
              <div className='flex justify-center items-center text-center'>
                <p>
                  Bạn có chắc chắn muốn gửi liên kết đạt lại mật khẩu cho tài
                  khoản <span className='font-bold'> Nguyễn A</span> không?
                </p>
              </div>
              <div className='flex justify-center items-center text-center border p-1 bg-gray-100 rounded-md'>
                <p>
                  Hệ thống sẽ gửi email hướng dẫn đến địa chỉ:{' '}
                  <span className='font-medium text-green-800'>
                    nguyena@domain.com
                  </span>
                </p>
              </div>
            </div>
          </>
        }
      />
    </>
  )
}

const UserManagement = () => {
  // state
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalDetail, setOpenModalDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfor | null>(null)
  const [modeAction, setModeAction] = useState<ActionMode>('')
  const [openDialog, setOpenDialog] = useState(false)
  // hook
  const { errorMess } = useMessage()
  // api
  const deFaultPagination = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDirection: 'DESC'
  }
  const { data: getUser } = useGetUserQuery(deFaultPagination)
  const [getUserById] = useLazyGetUserByIdQuery()

  // logic
  const dataSource = getUser?.content.map((item, index) => ({
    ...item,
    no: index + 1,
    createdTimestamp: item.createdTimestamp
      ? new Date(item.createdTimestamp)
      : null
  }))

  const typeFooter: Partial<Record<ActionMode, JSX.Element>> = {
    delete: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent
          type='default'
          content='Cancel'
        />
        <ButtonComponent
          type='primary'
          danger
          content='Delete'
        />
      </div>
    ),
    resetPass: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent
          type='default'
          content='Cancel'
        />
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
        admin <span className='font-bold'>Nguyễn A </span>không? Hành động này
        không thể hoàn tác.
      </span>
    ),
    lock: (
      <span>
        Bạn có chắc chắn muốn <span className='font-bold'>khóa tài khoản</span>{' '}
        admin <span className='font-bold'>Nguyễn A </span>không? Tài khoản sẽ
        không ttheer đăng nhập cho đến khi mở lại.
      </span>
    ),
    unlock: (
      <span>
        Bạn có chắc chắn muốn{' '}
        <span className='font-bold'>mở khóa tài khoản</span> admin{' '}
        <span className='font-bold'>Nguyễn A </span>không? Tài khoản này sẽ có
        thể hoạt động trở lại.
      </span>
    ),
    resetPass: <FormSendEmail />
  }
  const normalizeUser = (data: UserInfor): UserInfor => {
    return {
      id: data.id,
      username: data.username,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      enabled: data.enabled,
      emailVerified: data.emailVerified,
      createdTimestamp: data.createdTimestamp
        ? new Date(data.createdTimestamp)
        : null,
      // Keep groups as an array
      groups: Array.isArray(data.groups)
        ? data.groups
        : data.groups
        ? [data.groups]
        : null
    }
  }

  const getUserInfo = async (id: string) => {
    try {
      const dataUser = await getUserById(id)
      const dataNormal = normalizeUser(dataUser?.data?.data)
      setSelectedUser(dataNormal)
      console.log(dataNormal)
    } catch (error: any) {
      errorMess(error?.data?.detail)
    }
  }

  const handleOpenDetail = (record: UserInfor) => {
    // setSelectedIdUser(record.id)
    getUserInfo(record.id)
    setOpenModalDetail(true)
  }
  const column = RoleManagemenColume({
    setOpenModalDetail,
    setModeAction,
    setOpenDialog,
    handleOpenDetail
  })

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={<FormSearch setOpenModalAdd={setOpenModalAdd} />}
      />
      <CardComponent
        content={
          <Table
            bordered
            scroll={{ x: 'max-content' }}
            size='small'
            columns={column}
            dataSource={dataSource}
          />
        }
      />
      <ModalComponent
        title='Thêm mới tài khoản Admin'
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => {}}
        open={openModalAdd}
        modalText={<FormAdd />}
        width='35%'
      />
      <ModalComponent
        onCancel={() => setOpenModalDetail(false)}
        onOk={() => {}}
        open={openModalDetail}
        title='Chi thiết tài khoản Admin'
        width='45%'
        modalText={<FormDetail selectedUser={selectedUser} />}
      />
      <DialogModal
        onCancel={() => setOpenDialog(false)}
        onOk={() => {}}
        open={openDialog}
        content={modeAction && typeText[modeAction]}
        footer={modeAction && typeFooter[modeAction]}
      />
    </div>
  )
}

export default UserManagement
