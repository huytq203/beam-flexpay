import { useState } from 'react'
import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/index'
import FormSearch from './components/FormSearch'
import FormAdd from '@pages/role-management-V2/user-management/components/FormAdd'
import FormDetail from '@pages/role-management-V2/user-management/components/FormDetail'
import FormRoleAssign from '@pages/role-management-V2/user-management/components/FormRoleAssign'
import { useFormManagement } from './hooks/useFormManagement'
import { useAssignRoleUserMutation, useDeleteRoleUserMutation } from '@services/apiUserRoleAssign'
import { useMessage } from '@hooks/useMessage'
import { SkeletonButton, SkeletonInput, SkeletonTable } from '@components/ui/skeletons/Skeleton'

export type ActionMode =
  | 'delete'
  | 'lock'
  | 'unlock'
  | 'resetPass'
  | 'update'
  | 'add'
  | ''

const UserManagement = () => {
  const {
    openModalAdd,
    setOpenModalAdd,
    openModalDetail,
    setOpenModalDetail,
    openModalRoleAssign,
    setOpenModalRoleAssign,
    selectedRoles,
    setSelectedRoles,
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
    column,
    roleOptions,
    handleCloseDetail,
    handleCloseUpdate,
    isLoadingRoles,
    // isLoadingUserRoles,
    getRole,
    isLoadingUser,
  } = useFormManagement()

  const [assignRoleUser] = useAssignRoleUserMutation()
  const [deleteRoleUser] = useDeleteRoleUserMutation()
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([])
  const [isLoadingUserRoles, setIsLoadingUserRoles] = useState(false)

  const { errorMess, successMess } = useMessage()
  const handleSelectionChange = (newSelectedIds: string[], initialIds: string[]) => {
    setSelectedRoles(newSelectedIds)
    setInitialRoleIds(initialIds)
  }

  const handleAssignRole = async () => {
    if (!selectedUser?.id) return

    const rolesToAdd = selectedRoles.filter(id => !initialRoleIds.includes(id))
    const rolesToRemove = initialRoleIds.filter(id => !selectedRoles.includes(id))

    try {
      if (rolesToAdd.length > 0) {
        await assignRoleUser({
          id: selectedUser.id,
          body: { roleIds: rolesToAdd }
        }).unwrap()
      }

      if (rolesToRemove.length > 0) {
        await deleteRoleUser({
          id: selectedUser.id,
          body: { roleIds: rolesToRemove }
        }).unwrap()
      }

      setOpenModalRoleAssign(false)
      setSelectedRoles([])
      setInitialRoleIds([])
      successMess('Cập nhật thành công')
    } catch (error: any) {
      errorMess(error?.data?.detail)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <>
            {isLoadingUser || isLoadingRoles ?
              <>
                <div className={`bg-white rounded-xl shadow-md p-6 border border-gray-100`}>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <SkeletonInput key={index} />
                    ))}

                    <div className=" flex items-end gap-2">
                      <SkeletonButton size="md" />
                      <SkeletonButton size="md" />
                      <SkeletonButton size="md" />
                    </div>
                  </div>
                </div>
              </>
              :
              <FormSearch
                setOpenModalAdd={setOpenModalAdd}
                setModeAction={setModeAction}
                roleOptions={roleOptions}
              />
            }
          </>
        }
      />
      <CardComponent
        content={
          <>
            {
              isLoadingUser || isLoadingRoles ?
                <SkeletonTable />
                :
                <Table
                  rowKey='id'
                  bordered
                  scroll={{ x: 'max-content' }}
                  size='small'
                  columns={column}
                  dataSource={dataSource}
                />
            }
          </>
        }
      />
      <ModalComponent
        title={modeAction === 'update' ? 'Cập nhật tài khoản Admin' : 'Thêm mới tài khoản Admin'}
        onCancel={handleCloseUpdate}
        onOk={() => { }}
        open={openModalAdd}
        loading={isLoadingDetail}
        modalText={<FormAdd modeAction={modeAction} selectedUser={selectedUser} />}
        width='35%'
      />
      <ModalComponent
        onCancel={handleCloseDetail}
        onOk={() => { }}
        open={openModalDetail}
        title='Chi tiết tài khoản Admin'
        width='45%'
        loading={isLoadingDetail}
        modalText={<FormDetail selectedUser={selectedUser} />}
      />
      <DialogModal
        onCancel={() => {
          setOpenDialog(false)
          setSelectedUser(undefined)
        }}
        onOk={() => { }}
        open={openDialog}
        content={modeAction && typeText[modeAction]}
        footer={modeAction && typeFooter[modeAction]}
      />

      <ModalComponent
        title='Gán nhóm quyền'
        modalText={
          <FormRoleAssign
            userId={selectedUser?.id}
            onSelectionChange={handleSelectionChange}
            isLoadingRoles={isLoadingRoles}
            roleData={getRole}
            onLoadingUserRolesChange={setIsLoadingUserRoles}
          />
        }
        onCancel={() => {
          setOpenModalRoleAssign(false)
          setSelectedRoles([])
          setInitialRoleIds([])
        }}
        open={openModalRoleAssign}
        onOk={handleAssignRole}
        width='50%'
      />

    </div>
  )
}

export default UserManagement


