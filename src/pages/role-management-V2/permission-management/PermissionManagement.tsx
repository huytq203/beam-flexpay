import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import React, { useState } from 'react'
import { FormAdd } from './components/FormAdd'
import FormSearch from './components/FormSearch'
import FormDetail from '@pages/role-management-V2/permission-management/components/FormDetail'
import { usePermissionRole } from './hook/usePermissionRole'
import { PermissionItem } from './utils/permissionUtils'



export const PermissionManagement = () => {
  const {
    openModalAdd,
    setOpenModalAdd,
    openModalDetail,
    setOpenModalDetail,
    modeAction,
    setModeAction,
    modalDialog,
    setModalDialog,

    dataSource,
    column,
    typeFooter,
    typeText,
    getPermission,
  } = usePermissionRole()
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
        width='75%'
        footer={null}
        modalText={
          <FormAdd
            permissions={(getPermission?.content || []) as PermissionItem[]}
            onCancel={() => setOpenModalAdd(false)}
            modeAction={modeAction === 'add' || modeAction === 'edit' ? modeAction === 'add' ? 'add' : 'update' : 'add'}
          />
        }
      />
      <ModalComponent
        onCancel={() => setOpenModalDetail(false)}
        onOk={() => { }}
        open={openModalDetail}
        width='60%'
        title='Danh sách tài khoản Admin'
        modalText={<FormDetail />}
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
