import {
  CardComponent,
  ModalComponent,
  Table,
  ButtonComponent
} from '@components/index'
import FormSearch from './components/FormSearch'
import DialogAddUser from './components/DialogAddUser'
import DialogUserDetail from './components/DialogUserDetail'
import DialogAssignRoles from './components/DialogAssignRoles'
import useFetchDataUser from './hooks/useFetchDataUser'
import * as Icons from '@components/icons'
import useHandleUser from './hooks/useHandleUser'
import { SkeletonButton, SkeletonInput, SkeletonTable } from '@components/ui/skeletons/Skeleton'

const UserManagement = () => {
  const fetchData = useFetchDataUser()
  const handle = useHandleUser()

  return (
    <div className='flex flex-col gap-2'>
      {/* <CardComponent
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
              <FormSearch
                roleOptions={fetchData.roleOptions}
                onAdd={() => handle.openModal('add', null)}
              />
            )}
          </>
        }
      /> */}
      <CardComponent>
        <div className='flex items-center gap-4 py-1'>
          <div className='bg-green-50 p-3 rounded-xl flex items-center justify-center shadow-sm'>
            <Icons.UserCheckIcon size={28} weight="duotone" className='text-blue' />
          </div>
          <div>
            <h1 className='text-[16px] font-bold text-gray-800 m-0'>Quản lý tài khoản Admin</h1>
            <p className='text-gray-500 text-[12px] m-0 leading-relaxed font-medium'>Quản lý thông tin tài khoản, nhóm quyền và người dùng quản trị hệ thống</p>
          </div>
          <div className='ml-auto'>
            {/* <ButtonComponent 
              icon={<Icons.PlusOutlined />} 
              type='primary' 
              content='Thêm mới tài khoản' 
              onClick={() => handle.openModal('add', null)}
            /> */}
          </div>
        </div>
      </CardComponent>
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
                pagination={{
                  total: fetchData.userData?.totalElements,
                  current: fetchData.page,
                  pageSize: fetchData.size,
                  onChange: (page, pageSize) => {
                    fetchData.setPage(page)
                    fetchData.setPageSize(pageSize)
                  },
                }}
              />
            )}
          </>
        }
      />

      {/* Add/Edit User */}
      <ModalComponent
        title={handle.modalType === 'edit' ? 'Cập nhật tài khoản Admin' : 'Thêm mới tài khoản Admin'}
        onCancel={() => handle.closeModal()}
        onOk={() => { }}
        open={handle.modalType === 'add' || handle.modalType === 'edit'}
        width='35%'
        modalText={
          <DialogAddUser
            userId={handle.modalType === 'edit' ? handle.selectedUser?.id : null}
            roleOptions={fetchData.roleOptions}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* View User Detail */}
      <ModalComponent
        title='Chi tiết tài khoản Admin'
        onCancel={() => handle.closeModal()}
        onOk={() => { }}
        open={handle.modalType === 'viewDetail'}
        width='45%'
        footer={null}
        modalText={
          <DialogUserDetail
            userId={handle.selectedUser?.id}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* Assign Roles */}
      <ModalComponent
        title='Gán nhóm quyền'
        onCancel={() => handle.closeModal()}
        onOk={() => { }}
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
    </div>
  )
}

export default UserManagement
