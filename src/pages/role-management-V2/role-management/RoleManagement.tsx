import {
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/index'
import FormAdd from '@pages/role-management-V2/role-management/components/FormAdd'
import FormSearch from '@pages/role-management-V2/role-management/components/FormSearch'
import { RoleManagementColumn } from '@pages/role-management-V2/role-management/columns/RoleManagement.column'
import { useRoleManagement } from './hooks/useRoleManagement'
import { PermissionItem } from '@type/permissionManagement'
import {
  SkeletonButton,
  SkeletonInput,
  SkeletonTable
} from '@components/ui/skeletons/Skeleton'

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
    handlePostPermission,
    handlePutPermission,
    handleDeletePermission
  } = useRoleManagement()

  const column = RoleManagementColumn({
    setModeAction,
    setOpenModalAdd,
    setSelectedPermission,
    setOpenDialog
  })

  const onSubmit = async (
    data: PermissionItem | Omit<PermissionItem, 'id' | 'name'>
  ) => {
    if (modeAction === 'add') {
      await handlePostPermission(data as Omit<PermissionItem, 'id'>)
    } else {
      await handlePutPermission(data as PermissionItem)
    }
  }

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <>
            {loadGetRole ? (
              <>
                <div
                  className={`bg-white rounded-xl shadow-md p-6 border border-gray-100`}
                >
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                    {Array.from({ length: 2 }).map((_, index) => (
                      <SkeletonInput key={index} />
                    ))}

                    <div className=' w-full flex items-end gap-2'>
                      <SkeletonButton
                        className='w-full'
                        size='md'
                      />
                      <SkeletonButton
                        className='w-full'
                        size='md'
                      />
                      <SkeletonButton
                        className='w-full'
                        size='md'
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <FormSearch
                setOpenModalAdd={setOpenModalAdd}
                setModeAction={setModeAction}
                onSearch={handleSearch}
              />
            )}
          </>
        }
      />
      <CardComponent
        content={
          <>
            {loadGetRole ? (
              <SkeletonTable />
            ) : (
              <Table
                rowKey='id'
                scroll={{ x: 'max-content' }}
                bordered
                columns={column}
                size='small'
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
            )}
          </>
        }
      />
      <ModalComponent
        title={modeAction === 'update' ? 'Cập nhật quyền' : 'Thêm quyền'}
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => {}}
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
