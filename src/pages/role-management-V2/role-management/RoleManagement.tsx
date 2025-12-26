import { CardComponent, DialogModal, ModalComponent, Table } from '@components/common'
import { RoleDataItem } from '@type/roleManagementV2'
import FormAdd from '@pages/role-management-V2/role-management/components/FormAdd'
import FormSearch from '@pages/role-management-V2/role-management/components/FormSearch'
import { RoleManagementColumn } from '@pages/role-management-V2/role-management/RoleManagement.column'

import React, { useState } from 'react'
import { useRoleManagement } from './hook/useRoleManagement'
import { PermissionItem } from '@type/permissionManagement'

const RoleManagement = () => {



  // hook
  const {
    loadGetRole,
    dataSource,
    totalElements,
    typeText,
    typeFooter,

    page,
    setPage,
    pageSize,
    setPageSize,
    modeAction,
    setModeAction,
    openModalAdd,
    setOpenModalAdd,
    selectedPermission,
    setSelectedPermission,
    openDialog,
    setOpenDialog,

    handleSearch,
    hanldePostPermission,
    handlePutPermission,
    handleDeletePermission
  } = useRoleManagement()

  const column = RoleManagementColumn({
    setModeAction,
    setOpenModalAdd,
    setSelectedPermission,
    setOpenDialog
  })

  const onSubmit = async (data: PermissionItem | Omit<PermissionItem, 'id'|'name'>) => {
    if (modeAction === 'add') {
      await hanldePostPermission(data as Omit<PermissionItem, 'id'>)
    } else {
      await handlePutPermission(data as PermissionItem)
    }
  }
  return (
    <div className='flex flex-col gap-2'>
      <CardComponent content={<FormSearch setOpenModalAdd={setOpenModalAdd} setModeAction={setModeAction} onSearch={handleSearch} />} />
      <CardComponent content={
        <>
          <Table scroll={{ x: 'max-content' }} bordered columns={column} size='small' dataSource={dataSource}
            pagination={{
              current: page,
              pageSize: pageSize,
              total: totalElements,
              showSizeChanger: true,
              onChange: (newPage, newPageSize) => {
                setPage(newPage)
                setPageSize(newPageSize)
              }
            }}
          />
        </>
      } />
      <ModalComponent
        title={modeAction === 'update' ? 'Cập nhật quyền' : 'Thêm quyền'}
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => { }}
        open={openModalAdd}
        width='30%'
        footer={null}
        loading={loadGetRole}
        modalText={
          <FormAdd
            modeAction={modeAction}
            selectedUser={selectedPermission}
            onSubmit={onSubmit}
            onCancel={() => setOpenModalAdd(false)}
          />
        }
      />
      <DialogModal
        onCancel={() => setOpenDialog(false)}
        onOk={handleDeletePermission}
        open={openDialog}
        content={modeAction && typeText[modeAction]}
        footer={modeAction && typeFooter[modeAction]}
      />
    </div>
  )
}

export default RoleManagement
