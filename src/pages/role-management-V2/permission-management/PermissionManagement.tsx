import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import React, { useState } from 'react'
import FormAdd from './components/FormAdd'
import FormSearch from './components/FormSearch'
import FormDetail from '@pages/role-management-V2/permission-management/components/FormDetail'
import { usePermissionRole } from './hook/usePermissionRole'
import { PermissionItem } from './utils/permissionUtils'
import FormPermission from './components/FormPermission'



export const PermissionManagement = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const {
    openModalAdd,
    setOpenModalAdd,
    openModalDetail,
    setOpenModalDetail,
    modeAction,
    setModeAction,
    modalDialog,
    setModalDialog,
    openModalPermission,
    setOpenModalPermission,

    selectMember,
    dataPermission,
    dataSource,
    column,
    typeFooter,
    typeText,
    getPermission,
    isLoadingDetail,


    hanldePostPermission,
    handleDeletePermissionAssign

  } = usePermissionRole()
  console.log(dataPermission)
  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={<FormSearch setOpenModalAdd={setOpenModalAdd} />}
      />
      <CardComponent
        content={
          <>
            <Table
              scroll={{ x: 'max-content' }}
              bordered
              size='small'
              columns={column}
              dataSource={dataSource}
            />
          </>
        }
      />
      <ModalComponent
        title='Thêm quyền'
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => { }}
        open={openModalAdd}
        width='35%'
        modalText={
          <FormAdd
          />
        }
      />
      <ModalComponent
        onCancel={() => setOpenModalDetail(false)}
        onOk={() => { }}
        open={openModalDetail}
        width='60%'
        title='Danh sách tài khoản Admin'
        modalText={<FormDetail selectMember={selectMember} />}
        footer={null}
        loading={isLoadingDetail}
      />
      <ModalComponent
        title={ modeAction=='permission'? 'Gán quyền':modeAction=='edit'?'Chỉnh sửa quyền':'Xem chi tiết'}
        onCancel={() => setOpenModalPermission(false)}
        onOk={() => modeAction === 'edit' 
          ? handleDeletePermissionAssign(selectedPermissions) 
          : hanldePostPermission(selectedPermissions)}
        open={openModalPermission}
        modalText={
          <FormPermission 
            dataSource={dataPermission} 
            onSelectionChange={setSelectedPermissions}
          />
        }
        loading={isLoadingDetail}
        width='60%'
      />

      <DialogModal
        onCancel={() => setModalDialog(false)}
        onOk={() => { }}
        open={modalDialog}
        content={modeAction && typeText[modeAction]}
        footer={modeAction && typeFooter[modeAction]}
      />
    </div>
  )
}
