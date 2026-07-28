import {
  CardComponent,
  ModalComponent,
  Table
} from '@components/index'
import FormSearch from './components/FormSearch'
import DialogAddPermission from './components/DialogAddPermission'
import DialogDeletePermission from './components/DialogDeletePermission'
import useFetchDataPermission from './hooks/useFetchDataPermission'
import useHandlePermission from './hooks/useHandlePermission'
import {
  SkeletonButton,
  SkeletonInput,
  SkeletonTable
} from '@components/ui/skeletons/Skeleton'

const RoleManagement = () => {
  const fetchData = useFetchDataPermission()
  const handle = useHandlePermission(fetchData)

  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={
          <>
            {fetchData.isLoading ? (
              <div className='bg-white rounded-xl shadow-md p-6 border border-gray-100'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  {Array.from({ length: 2 }).map((_, index) => (
                    <SkeletonInput key={index} />
                  ))}
                  <div className='w-full flex items-end gap-2'>
                    <SkeletonButton className='w-full' size='md' />
                    <SkeletonButton className='w-full' size='md' />
                    <SkeletonButton className='w-full' size='md' />
                  </div>
                </div>
              </div>
            ) : (
              <FormSearch
                onSearch={handle.handleSearch}
                onAdd={() => handle.openModal('add', null)}
              />
            )}
          </>
        }
      />
      <CardComponent
        content={
          <>
            {fetchData.isLoading ? (
              <SkeletonTable />
            ) : (
              <Table
                rowKey='id'
                scroll={{ x: 'max-content' }}
                bordered
                columns={handle.column}
                size='small'
                dataSource={fetchData.dataSource}
                onRefresh={handle.handleRefresh}
                pagination={{
                  current: fetchData.page,
                  pageSize: fetchData.pageSize,
                  total: fetchData.totalElements,
                  showSizeChanger: true,
                  onChange: (newPage, newPageSize) => {
                    fetchData.setPage(newPage)
                    fetchData.setPageSize(newPageSize)
                  }
                }}
              />
            )}
          </>
        }
      />

      {/* Add/Edit Permission */}
      <ModalComponent
        title={handle.modalType === 'edit' ? 'Cập nhật quyền' : 'Thêm quyền'}
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'add' || handle.modalType === 'edit'}
        width='30%'
        footer={null}
        modalText={
          <DialogAddPermission
            permission={handle.selectedPermission}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />

      {/* Delete Permission */}
      <ModalComponent
        title='Xóa quyền'
        onCancel={() => handle.closeModal()}
        onOk={() => {}}
        open={handle.modalType === 'delete'}
        width='30%'
        footer={null}
        modalText={
          <DialogDeletePermission
            permissionName={handle.selectedPermission?.name}
            onSuccess={handle.closeModal}
            onCancel={() => handle.closeModal()}
          />
        }
      />
    </div>
  )
}

export default RoleManagement
