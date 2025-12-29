import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import FormSearch from './components/FormSearch'
import FormAdd from '@pages/role-management-V2/user-management/components/FormAdd'
import FormDetail from '@pages/role-management-V2/user-management/components/FormDetail'
import { useFormManagement } from './hooks/useFormManagement'

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
    roleOptions
  } = useFormManagement()

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
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => { }}
        open={openModalAdd}
        loading={isLoadingDetail}
        modalText={<FormAdd modeAction={modeAction} selectedUser={selectedUser} />}
        width='35%'
      />
      <ModalComponent
        onCancel={() => setOpenModalDetail(false)}
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
    </div>
  )
}

export default UserManagement
