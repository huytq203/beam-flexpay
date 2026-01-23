import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/index'
import { useState } from 'react'
import FormAdd from './components/FormAdd'
import FormSearch from './components/FormSearch'
import FormDetail from '@pages/role-management-V2/permission-management/components/FormDetail'
import { usePermissionRole } from './hooks/usePermissionRole'
import FormPermission from './components/FormPermission'
import { DataRoleItem } from '@type/roleManagement'

export const PermissionManagement = () => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const {
    openModalAdd,
    setOpenModalAdd,
    openModalDetail,
    setOpenModalDetail,
    modeAction,
    modalDialog,
    setModalDialog,
    openModalPermission,
    pageSize,
    setPageSize,
    page,
    setPage,
    selectMember,
    dataPermission,
    dataSource,
    column,
    getTypeFooter,
    typeText,
    isLoadingDetail,
    totalElements,
    handlePostPermission,
    handleDeletePermissionAssign,
    handleCancel,
    handleSearch,
    handlePostRole,
    handleDeleteRole,
    // New exports for unified permission flow
    allPermissions,
    assignedPermissionNames,
    handleSubmitPermissionChanges,
    // Exports for edit role
    editRoleData,
    setEditRoleData,
    handlePutRole
  } = usePermissionRole()

  const onSubmit = async (data: DataRoleItem | Omit<DataRoleItem, 'id'>) => {
    if (modeAction === 'edit') {
      await handlePutRole(data as { name: string; description: string })
    } else {
      await handlePostRole(data as DataRoleItem)
    }
  }

  const handleCloseAddModal = () => {
    setOpenModalAdd(false)
    setEditRoleData(null)
  }

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <FormSearch
            setOpenModalAdd={setOpenModalAdd}
            onSearch={handleSearch}
          />
        }
      />
      <CardComponent
        content={
          <Table
            rowKey='id'
            scroll={{ x: 'max-content' }}
            bordered
            size='small'
            columns={column}
            dataSource={dataSource}
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
        }
      />
      <ModalComponent
        title={modeAction === 'edit' ? 'Cập nhật nhóm quyền' : 'Thêm nhóm quyền'}
        onCancel={handleCloseAddModal}
        onOk={() => { }}
        open={openModalAdd}
        width='35%'
        modalText={
          <FormAdd 
            onSubmit={onSubmit} 
            onCancel={handleCloseAddModal}
            defaultValues={editRoleData}
            isEdit={modeAction === 'edit'}
          />
        }
        footer={null}
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
        title={
          modeAction === 'permission'
            ? 'Gán quyền'
            : modeAction === 'edit'
              ? 'Chỉnh sửa quyền'
              : 'Xem chi tiết'
        }
        onCancel={handleCancel}
        onOk={() =>
          modeAction === 'edit'
            ? handleDeletePermissionAssign(selectedPermissions)
            : modeAction === 'permission'
              ? handleSubmitPermissionChanges(selectedPermissions)
              : {}
        }
        open={openModalPermission}
        modalText={
          <FormPermission
            modeAction={modeAction}
            dataSource={modeAction === 'permission' ? allPermissions : dataPermission}
            onSelectionChange={setSelectedPermissions}
            assignedPermissionNames={modeAction === 'permission' ? assignedPermissionNames : []}
          />
        }
        loading={isLoadingDetail}
        width='60%'
        footer={
          modeAction === 'edit'
            ? getTypeFooter(handleCancel, () => handleDeletePermissionAssign(selectedPermissions)).delete
            : modeAction === 'view'
              ? getTypeFooter(handleCancel, () => { }).view
              : undefined
        }
      />
      <DialogModal
        onCancel={() => setModalDialog(false)}
        onOk={() => { }}
        open={modalDialog}
        content={modeAction && typeText[modeAction]}
        footer={modeAction && getTypeFooter(() => setModalDialog(false), handleDeleteRole)[modeAction]}
      />
    </div>
  )
}
