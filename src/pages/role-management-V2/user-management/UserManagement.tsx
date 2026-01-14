import { useState } from 'react'
import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import FormSearch from './components/FormSearch'
import FormAdd from '@pages/role-management-V2/user-management/components/FormAdd'
import FormDetail from '@pages/role-management-V2/user-management/components/FormDetail'
import FormRoleAssign from '@pages/role-management-V2/user-management/components/FormRoleAssign'
import { useFormManagement } from './hooks/useFormManagement'
import { useAssignRoleUserMutation, useDeleteRoleUserMutation } from '@services/apiUserRoleAssign'
import { useMessage } from '@hooks/useMessage'

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
    handleCloseUpdate
  } = useFormManagement()

  const [assignRoleUser] = useAssignRoleUserMutation()
  const [deleteRoleUser] = useDeleteRoleUserMutation()
  const [initialRoleIds, setInitialRoleIds] = useState<string[]>([])

  const {errorMess,successMess}=useMessage()
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
    } catch (error:any) {
      errorMess(error?.data?.detail)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <FormSearch
            setOpenModalAdd={setOpenModalAdd}
            setModeAction={setModeAction}
            roleOptions={roleOptions}
          />
        }
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


