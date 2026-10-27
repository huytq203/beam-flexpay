import {
  ButtonComponent,
  CardComponent,
  ModalComponent,
  Table
} from '@components/index'
import { useState } from 'react'
import DialogAddUser from './components/DialogAddUser'
import DialogEditUser from './components/DialogEditUser'
import DialogUserDetail from './components/DialogUserDetail'
import DialogAssignRoles from './components/DialogAssignRoles'
import AlertResetPassword from './components/AlertResetPassword'
import useFetchDataUser from './hooks/useFetchDataUser'
import useHandleUser from './hooks/useHandleUser'
import {
  SkeletonButton,
  SkeletonInput,
  SkeletonTable
} from '@components/ui/skeletons/Skeleton'
import FormSearchUser from './components/FormSearchUser'
import { FunnelIcon } from '@components/icons'
import { useScreenAccess } from '@/app/permissions'
import { CREATE_ADMIN_USER_FORM_ID } from './constants/userAccount'
import { useTypedSelector } from '@/app/store'
const UserManagement = () => {
  const fetchData = useFetchDataUser()
  const currentUserId = useTypedSelector((state) => state.auth.profile.jwtId)
  const handle = useHandleUser(currentUserId)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isUpdatingUser, setIsUpdatingUser] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const { can } = useScreenAccess('USER_ACCOUNT')

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <>
            {fetchData.isLoadingUser || fetchData.isLoadingRoles ? (
              <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100'>
                <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-4'>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonInput key={index} />
                  ))}
                  <div className='flex items-end gap-2'>
                    <SkeletonButton size='md' />
                    <SkeletonButton size='md' />
                    <SkeletonButton size='md' />
                  </div>
                </div>
              </div>
            ) : (
              <div className=''>
                <p className='mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
                  {' '}
                  <FunnelIcon /> Bộ lọc tìm kiếm
                </p>
                <FormSearchUser
                  defaultValues={fetchData.formValues}
                  onSearch={fetchData.handleSearch}
                  onClear={fetchData.clearFilters}
                  onAdd={() => handle.openModal('add', null)}
                  canAdd={can('create')}
                />
              </div>
            )}
          </>
        }
      />
      {/* <CardComponent>
        <div className='flex items-center gap-4 py-1'>
          <div className='bg-green-50 p-3 rounded-xl flex items-center justify-center shadow-xs text-green-800'>
            <Icons.UserCheckIcon size={28} weight="duotone" className='text-blue' />
          </div>
          <div>
            <h1 className='text-[16px] font-bold text-green-800 m-0'>Quản lý tài khoản Admin</h1>
            <p className='text-gray-500 text-[12px] m-0 leading-relaxed font-medium'>Quản lý thông tin tài khoản, nhóm quyền và người dùng quản trị hệ thống</p>
          </div>
          <div className='ml-auto'>
            <ButtonComponent
              icon={<Icons.PlusOutlined />} 
              type='primary' 
              content='Thêm mới tài khoản' 
              onClick={() => handle.openModal('add', null)}
            />
          </div>
        </div>
      </CardComponent> */}
      <CardComponent
        content={
          <>
            {fetchData.isLoadingUser || fetchData.isLoadingRoles ? (
              <SkeletonTable />
            ) : (
              <Table
                rowKey='id'
                bordered
                scroll={{ x: 'max-content' }}
                size='small'
                columns={handle.column}
                dataSource={fetchData.dataSource}
                onRefresh={fetchData.refetch}
                pagination={{
                  total: fetchData.userData?.totalElements,
                  current: fetchData.page,
                  pageSize: fetchData.size,
                  onChange: (page, pageSize) => {
                    // Hai setter cùng ghi URL từ một bản cũ: chỉ gọi cái thay đổi.
                    if (pageSize !== fetchData.size)
                      fetchData.setPageSize(pageSize)
                    else fetchData.setPage(page)
                  }
                }}
              />
            )}
          </>
        }
      />

      {/* Add/Edit User */}
      <ModalComponent
        title='Thêm mới tài khoản Admin'
        onCancel={() => handle.closeModal()}
        open={handle.modalType === 'add'}
        confirmLoading={isCreatingUser}
        footer={
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <ButtonComponent
              type='default'
              content='Hủy'
              disabled={isCreatingUser}
              onClick={() => handle.closeModal()}
            />
            <ButtonComponent
              type='primary'
              content='Tạo tài khoản'
              htmlType='submit'
              form={CREATE_ADMIN_USER_FORM_ID}
              loading={isCreatingUser}
              disabled={isCreatingUser}
            />
          </div>
        }
        width={{ xs: 'calc(100% - 24px)', sm: 560, md: 640 }}
        modalText={
          <DialogAddUser
            roleOptions={fetchData.roleOptions}
            onSuccess={() => {
              handle.closeModal()
              fetchData.refetch()
            }}
            onLoadingChange={setIsCreatingUser}
          />
        }
      />

      {/* Edit User */}
      <ModalComponent
        title='Cập nhật tài khoản Admin'
        onCancel={() => {
          if (!isUpdatingUser) handle.closeModal()
        }}
        open={handle.modalType === 'edit'}
        closable={!isUpdatingUser}
        maskClosable={!isUpdatingUser}
        keyboard={!isUpdatingUser}
        footer={null}
        width={{ xs: 'calc(100% - 24px)', sm: 560, md: 640 }}
        modalText={
          <DialogEditUser
            userId={handle.selectedUser?.id}
            roleOptions={fetchData.roleOptions}
            onCancel={() => handle.closeModal()}
            onSuccess={() => {
              handle.closeModal()
              fetchData.refetch()
            }}
            onLoadingChange={setIsUpdatingUser}
          />
        }
      />

      {/* View User Detail */}
      <ModalComponent
        title='Chi tiết tài khoản Admin'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'viewDetail'}
        width='45%'
        footer={null}
        modalText={<DialogUserDetail userId={handle.selectedUser?.id} />}
      />

      {/* Assign Roles */}
      <ModalComponent
        title='Gán nhóm quyền'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'assignRoles'}
        width='50%'
        footer={null}
        modalText={
          <DialogAssignRoles
            userId={handle.selectedUser?.id}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* Reset Password */}
      <ModalComponent
        title='Đặt lại mật khẩu tài khoản'
        onCancel={() => {
          if (!isResettingPassword) handle.closeModal()
        }}
        open={handle.modalType === 'resetPassword'}
        closable={!isResettingPassword}
        maskClosable={!isResettingPassword}
        keyboard={!isResettingPassword}
        confirmLoading={isResettingPassword}
        footer={null}
        width={{ xs: 'calc(100% - 24px)', sm: 520, md: 600 }}
        modalText={
          handle.selectedUser ? (
            <AlertResetPassword
              user={handle.selectedUser}
              onCancel={() => handle.closeModal()}
              onLoadingChange={setIsResettingPassword}
            />
          ) : null
        }
      />
    </div>
  )
}

export default UserManagement
