import { useCallback, useMemo, useState } from 'react'
import * as Icons from '@components/icons'
import { CardComponent, ModalComponent, Table } from '@components/index'
import { SkeletonTable } from '@components/ui/skeletons/Skeleton'
import { getPermissionManagementColumns } from './columns/PermissionManagement.column'
import DialogAddPermission from './components/DialogAddPermission'
import DialogDeletePermission from './components/DialogDeletePermission'
import FormSearchPermission from './components/FormSearchPermission'
import useFetchDataPermission from './hooks/useFetchDataPermission'
import {
  PermissionModalType,
  SelectedPermission
} from './types/PermissionManagement.type'

const PermissionManagement = () => {
  const [modalType, setModalType] = useState<PermissionModalType>(null)
  const [selectedPermission, setSelectedPermission] =
    useState<SelectedPermission | null>(null)
  const {
    handleSearch,
    permissionData,
    permissionOptions,
    isLoadingPermissionData,
    refetch,
    page,
    size,
    setPage,
    setPageSize
  } = useFetchDataPermission()

  const openModal = useCallback(
    (type: PermissionModalType, permission: SelectedPermission | null) => {
      setSelectedPermission(permission)
      setModalType(type)
    },
    []
  )

  const closeModal = useCallback(() => {
    setModalType(null)
    setSelectedPermission(null)
  }, [])

  const handleMutationSuccess = useCallback(() => {
    closeModal()
    refetch()
  }, [closeModal, refetch])

  const columns = useMemo(
    () => getPermissionManagementColumns({ openModal }),
    [openModal]
  )

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent>
        <div className='flex w-full flex-col items-start justify-start'>
          <p className='mb-3 flex w-full items-center gap-2 border-b border-gray-200 pb-2 font-bold text-blue'>
            <Icons.FunnelIcon /> Bộ lọc tìm kiếm
          </p>
          <FormSearchPermission
            onSearch={handleSearch}
            onAdd={() => openModal('add', null)}
            permissionOptions={permissionOptions}
          />
        </div>
      </CardComponent>

      <CardComponent
        content={
          isLoadingPermissionData ? (
            <SkeletonTable />
          ) : (
            <Table
              rowKey='id'
              scroll={{ x: 'max-content' }}
              bordered
              size='small'
              columns={columns}
              dataSource={permissionData?.content ?? []}
              onRefresh={refetch}
              pagination={{
                current: page,
                pageSize: size,
                total: permissionData?.totalElements ?? 0,
                showSizeChanger: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPageSize !== size ? 1 : newPage)
                  setPageSize(newPageSize)
                }
              }}
            />
          )
        }
      />

      <ModalComponent
        title={modalType === 'edit' ? 'Cập nhật quyền' : 'Thêm quyền'}
        onCancel={closeModal}
        onOk={() => {}}
        open={modalType === 'add' || modalType === 'edit'}
        width={{ xs: '100%', sm: '90%', md: '50%', lg: '35%' }}
        footer={null}
        modalText={
          <DialogAddPermission
            permission={selectedPermission}
            onSuccess={handleMutationSuccess}
            onCancel={closeModal}
          />
        }
      />

      <ModalComponent
        title='Xóa quyền'
        onCancel={closeModal}
        onOk={() => {}}
        open={modalType === 'delete'}
        width={{ xs: '100%', sm: '90%', md: '45%', lg: '30%' }}
        footer={null}
        modalText={
          <DialogDeletePermission
            permissionName={selectedPermission?.name}
            onSuccess={handleMutationSuccess}
            onCancel={closeModal}
          />
        }
      />
    </div>
  )
}

export { PermissionManagement }
export default PermissionManagement
