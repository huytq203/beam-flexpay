import {
  ButtonComponent,
  CardComponent,
  ModalComponent,
  Table
} from '@components/index'
import DialogAddRole from './components/DialogAddRole'
import DialogDeleteRole from './components/DialogDeleteRole'
import DialogViewPermissions from './components/DialogViewRole'
import DialogAssignPermissions from './components/DialogAssignPermissions'
import DialogViewMembers from './components/DialogViewMembers'

import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import * as Icons from '@components/icons'
import FormSearchRole from '@/pages/role-management-V2/role-management/components/FormSearchRole'
import useFetchDataRole from '@/pages/role-management-V2/role-management/hooks/useFetchDataRole'
import { getRoleManagementColumn } from '@/pages/role-management-V2/role-management/columns/RoleManagement.column'
import { useCallback, useMemo, useState } from 'react'
import { ModalType, SelectedRole } from '@/pages/role-management-V2/role-management/types/RoleManagement.type'
import { ASSIGN_PERMISSIONS_FORM_ID } from './constants/RoleManagement.constant'
export const RoleManagement = () => {
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const [selectedRole, setSelectedRole] = useState<SelectedRole | null>(null)
  const [isAssigningPermissions, setIsAssigningPermissions] = useState(false)
  const {
    handleSearch,
    roleData,
    roleOptions,
    isLoadingRoleData,
    refetch,
    page,
    size,
    setPage,
    setPageSize
  } = useFetchDataRole()

  const openRoleModal = useCallback(
    (type: ModalType, role: SelectedRole | null) => {
      setSelectedRole(role)
      setOpenModal(type)
    },
    []
  )

  const closeModal = useCallback(() => {
    setOpenModal(null)
    setSelectedRole(null)
    setIsAssigningPermissions(false)
  }, [])

  const handleMutationSuccess = useCallback(() => {
    closeModal()
    refetch()
  }, [closeModal, refetch])

  const column = useMemo(
    () => getRoleManagementColumn({ openModal: openRoleModal }),
    [openRoleModal]
  )
  return (
    <div className='flex flex-col gap-2'>
      {/* <CardComponent
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
      /> */}
      <CardComponent>
        <div className='flex flex-col items-start justify-start w-full'>
          <p className='w-full mb-3 font-bold border-b border-gray-200 pb-2 flex items-center gap-2 text-blue'>
            <Icons.FunnelIcon /> Bộ lọc tìm kiếm
          </p>
          <FormSearchRole
            onSearch={handleSearch}
            roleOptions={roleOptions}
            onAdd={() => openRoleModal('add', null)}
          />
          {/* <div className='ml-auto'>
                  <ButtonComponent
                    icon={<Icons.PlusOutlined />}
                    type='primary'
                    content='Thêm mới nhóm quyền'
                    onClick={() => handle.openModal('add', null)}
                  />
                </div> */}
        </div>
      </CardComponent>
      <CardComponent
        content={
          <>
            {isLoadingRoleData ? (
              <SkeletonTable />
            ) : (
              <Table
                rowKey='id'
                scroll={{ x: 'max-content' }}
                bordered
                size='small'
                columns={column}
                dataSource={roleData?.content}
                onRefresh={refetch}
                pagination={{
                  current: page,
                  pageSize: size,
                  total: roleData?.totalElements,
                  showSizeChanger: true,
                  onChange: (newPage, newPageSize) => {
                    setPage(newPageSize !== size ? 1 : newPage)
                    setPageSize(newPageSize)
                  }
                }}
              />
            )}
          </>
        }
      />

      {/* Add/Edit Role */}
      <ModalComponent
        title={
          openModal === 'edit'
            ? 'Cập nhật nhóm quyền'
            : 'Thêm nhóm quyền'
        }
        onCancel={closeModal}
        onOk={() => {}}
        open={openModal === 'add' || openModal === 'edit'}
        width='35%'
        footer={null}
        modalText={
          <DialogAddRole
            role={selectedRole}
            onSuccess={handleMutationSuccess}
            onCancel={closeModal}
          />
        }
      />

      {/* Delete Role */}
      <ModalComponent
        title='Xóa nhóm quyền'
        onCancel={closeModal}
        onOk={() => {}}
        open={openModal === 'delete'}
        width='30%'
        footer={null}
        modalText={
          <DialogDeleteRole
            roleId={selectedRole?.id}
            roleName={selectedRole?.name}
            onSuccess={handleMutationSuccess}
            onCancel={closeModal}
          />
        }
      />

      {/* View Permissions (read-only) */}
      <ModalComponent
        title='Xem chi tiết quyền'
        onCancel={closeModal}
        onOk={() => {}}
        open={openModal === 'viewPermissions'}
        width='60%'
        footer={null}
        modalText={
          <DialogViewPermissions
            roleId={selectedRole?.id}
            onCancel={closeModal}
          />
        }
      />

      {/* Assign Permissions */}
      <ModalComponent
        title='Gán quyền'
        onCancel={closeModal}
        onOk={() => {}}
        open={openModal === 'assignPermissions'}
        width={{ xs: '100%', sm: '100%', md: '60%', lg: '60%' }}
        confirmLoading={isAssigningPermissions}
        footer={
          <div className='flex items-center justify-end gap-2'>
            <ButtonComponent
              type='default'
              content='Hủy'
              disabled={isAssigningPermissions}
              onClick={closeModal}
            />
            <ButtonComponent
              type='primary'
              content='Lưu'
              htmlType='submit'
              form={ASSIGN_PERMISSIONS_FORM_ID}
              loading={isAssigningPermissions}
            />
          </div>
        }
        modalText={
          <DialogAssignPermissions
            roleId={selectedRole?.id}
            onSuccess={handleMutationSuccess}
            onLoadingChange={setIsAssigningPermissions}
          />
        }
      />

      {/* View Members */}
      <ModalComponent
        title='Danh sách tài khoản Admin'
        onCancel={closeModal}
        onOk={() => {}}
        open={openModal === 'viewMembers'}
        width={{ xs: '100%', sm: '100%', md: '60%', lg: '60%' }}
        footer={null}
        modalText={
          <DialogViewMembers
            roleId={selectedRole?.id}
            onCancel={closeModal}
          />
        }
      />
    </div>
  )
}

// Keep the existing route export name until the route configuration is renamed.
export const PermissionManagement = RoleManagement
