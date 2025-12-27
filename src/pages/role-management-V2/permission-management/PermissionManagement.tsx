import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import { useState } from 'react'
import FormAdd from './components/FormAdd'
import FormSearch from './components/FormSearch'
import FormDetail from '@pages/role-management-V2/permission-management/components/FormDetail'
import { usePermissionRole } from './hook/usePermissionRole'
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
    hanldePostPermission,
    handleDeletePermissionAssign,
    handleCancel,
    handleSearch,
    handlePostRole,
    handleDeleteRole
  } = usePermissionRole()

  const onSubmit = async (data: DataRoleItem | Omit<DataRoleItem, 'id'>) => {
    await handlePostRole(data as DataRoleItem)
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
        title='Thêm quyền'
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => { }}
        open={openModalAdd}
        width='35%'
        modalText={<FormAdd onSubmit={onSubmit} onCancel={() => setOpenModalAdd(false)} />}
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
              ? hanldePostPermission(selectedPermissions)
              : {}
        }
        open={openModalPermission}
        modalText={
          <FormPermission
            modeAction={modeAction}
            dataSource={dataPermission}
            onSelectionChange={setSelectedPermissions}
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
