import {
  CardComponent,
  ModalComponent,
  Table
} from '@components/index'
import FormSearch from './components/FormSearch'
import DialogAddRole from './components/DialogAddRole'
import DialogDeleteRole from './components/DialogDeleteRole'
import DialogViewPermissions from './components/DialogViewPermissions'
import DialogAssignPermissions from './components/DialogAssignPermissions'
import DialogViewMembers from './components/DialogViewMembers'
import useFetchDataRole from './hooks/useFetchDataRole'
import useHandleRole from './hooks/useHandleRole'
import { SkeletonButton, SkeletonInput, SkeletonTable } from '@components/ui/skeletons/Skeleton'

export const PermissionManagement = () => {
  const fetchData = useFetchDataRole()
  const handle = useHandleRole(fetchData)

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <>
            {fetchData.isLoading ? (
              <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <SkeletonInput key={index} />
                  ))}
                  <div className='w-full flex items-end gap-2'>
                    <SkeletonButton className='w-full' size='md' />
                    <SkeletonButton className='w-full' size='md' />
                    <SkeletonButton className='w-full' size='md' />
                  </div>
                </div>
              </div>
            ) : (
              <FormSearch
                onSearch={handle.handleSearch}
                onAdd={() => handle.openModal('add', null)}
              />
            )}
          </>
        }
      />
      <CardComponent
        content={
          <>
            {fetchData.isLoading ? (
              <SkeletonTable />
            ) : (
              <Table
                rowKey='id'
                scroll={{ x: 'max-content' }}
                bordered
                size='small'
                columns={handle.column}
                dataSource={fetchData.dataSource}
                pagination={{
                  current: fetchData.page,
                  pageSize: fetchData.pageSize,
                  total: fetchData.totalElements,
                  showSizeChanger: true,
                  onChange: (newPage, newPageSize) => {
                    fetchData.setPage(newPage)
                    fetchData.setPageSize(newPageSize)
                  }
                }}
              />
            )}
          </>
        }
      />

      {/* Add/Edit Role */}
      <ModalComponent
        title={handle.modalType === 'edit' ? 'Cập nhật nhóm quyền' : 'Thêm nhóm quyền'}
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'add' || handle.modalType === 'edit'}
        width='35%'
        footer={null}
        modalText={
          <DialogAddRole
            role={handle.selectedRole}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* Delete Role */}
      <ModalComponent
        title='Xóa nhóm quyền'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'delete'}
        width='30%'
        footer={null}
        modalText={
          <DialogDeleteRole
            roleId={handle.selectedRole?.id}
            roleName={handle.selectedRole?.name}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* View Permissions (read-only) */}
      <ModalComponent
        title='Xem chi tiết quyền'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'viewPermissions'}
        width='60%'
        footer={null}
        modalText={
          <DialogViewPermissions
            roleId={handle.selectedRole?.id}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* Assign Permissions */}
      <ModalComponent
        title='Gán quyền'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'assignPermissions'}
        width={{ xs: '100%', sm: '100%', md: '60%', lg: '60%' }}
        footer={null}
        modalText={
          <DialogAssignPermissions
            roleId={handle.selectedRole?.id}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* View Members */}
      <ModalComponent
        title='Danh sách tài khoản Admin'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'viewMembers'}
        width={{ xs: '100%', sm: '100%', md: '60%', lg: '60%' }}
        footer={null}
        modalText={
          <DialogViewMembers
            roleId={handle.selectedRole?.id}
            onCancel={() => handle.closeModal()}
          />
        }
      />
    </div>
  )
}
