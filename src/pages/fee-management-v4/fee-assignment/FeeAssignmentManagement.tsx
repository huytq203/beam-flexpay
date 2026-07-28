import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/index'
import FormInforAdd from './components/FormInforAdd'
import React from 'react'
import { SkeletonButton, SkeletonInput, SkeletonTable, SkeletonTitle } from '@components/ui/skeletons/Skeleton'
import useHandleFeeAssignment from './hook/useHandleFeeAssignment'
import FormSearchAssignment from './components/FormSearchAssignment'

const FeeAssignmentManagement = () => {
  const {
    loadingSearch,
    isPostAssign,
    openModalDelete,
    openModalAdd,
    isCreate,
    control,
    handleSubmit,
    handleSearch,
    handleReset,
    handleOpenModalAdd,
    handleCloseModalAdd,
    handleDelete,
    handleCloseModalDelete,
    handlePostAssign,
    columns,
    dataSource,
    isFetching,
    refetch,
    page,
    pageSize,
    total,
    handlePaginationChange,
    canCreate,
    svg
  } = useHandleFeeAssignment()

  return (
    <>
      {
        (loadingSearch) ? (
          <>
            <CardComponent
              className="mb-3!"
              content={
                <div>
                  <SkeletonTitle />
                  <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
                    <SkeletonInput className='col-span-12 md:col-span-6' />
                    <SkeletonInput className='col-span-12 md:col-span-6' />
                  </div>
                  <div className='mt-3 flex flex-col md:flex-row md:justify-between gap-3'>
                    <div className='flex gap-2 w-full md:w-auto flex-row'>
                      <SkeletonButton size='md' />
                      <SkeletonButton size='md' />
                    </div>
                    <div className='w-full md:w-auto text-right'>
                      <SkeletonButton size='md' />
                    </div>
                  </div>
                </div>
              }
            />
            <CardComponent
              content={<SkeletonTable rows={5} columns={3} noContainer />}
            />
          </>
        ) : (
          <>
            <CardComponent
              className='mb-3!'
              content={
                <>
                  <form action='formViewAssign'  className='mb-3'>
                    <FormSearchAssignment control={control} />
                  </form>
                  <div className='col-span-12 flex flex-col md:flex-row md:justify-between gap-3'>
                    <div className='flex gap-2 w-full md:w-auto flex-row'>
                      <ButtonComponent
                        icon={svg('/icons.svg#hugeicons-search-01')}
                        content='Search'
                        onClick={handleSubmit(handleSearch)}
                        className='flex-1 md:flex-none'
                      />
                      <ButtonComponent
                        type='default'
                        icon={svg('/icons.svg#hugeicons-delete-02')}
                        content='Xóa bộ lọc'
                        onClick={handleReset}
                        className='flex-1 md:flex-none'
                      />

                    </div>
                    <div className='w-full md:w-auto'>
                      {canCreate && (
                        <ButtonComponent
                          icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
                          content='Thiết lập phí'
                          onClick={handleOpenModalAdd}
                          className='w-full md:w-auto'
                        />
                      )}
                    </div>
                  </div>
                </>
              }
            />

            <CardComponent
              className='mt-3'
              content={
                <Table
                  scroll={{ x: 'max-content' }}
                  rowKey='id'
                  bordered
                  columns={columns}
                  dataSource={dataSource}
                  size='small'
                  loading={isFetching}
                  onRefresh={refetch}
                  pagination={{
                    current: page,
                    showSizeChanger: true,
                    pageSize: pageSize,
                    total: total,
                    onChange: handlePaginationChange
                  }}
                />
              }
            />
          </>
        )
      }

      <DialogModal
        onOk={handleDelete}
        onCancel={handleCloseModalDelete}
        open={openModalDelete}
        content='Bạn có xác nhận xóa ?'
        mode='DELETE'
      />
      <ModalComponent
        title={'Thêm gán phí'}
        width={{ xs: "100% ", md: "85%" }}
        open={openModalAdd}
        okButtonProps={{
          htmlType: 'submit',
          form: 'formAssign'
        }}
        okText='Xác nhận'
        cancelText='Hủy'
        onCancel={handleCloseModalAdd}
        confirmLoading={isPostAssign}
        modalText={
          <FormInforAdd
            svg={svg}
            id={undefined}
            handlePutAssign={async () => { }}
            handlePostAssign={handlePostAssign}
            isCreate={isCreate}
          />
        }
      />
      {/* <ModalComponent
        title={'Chọn chính sách phí'}
        width={{ xs: "100% ", md: "100%", lg: "100%" }}
        open={openModalSelectPolicy}
        onOk={handleCloseModalSelectPolicy}
        onCancel={handleCloseModalSelectPolicy}
        okText='Xác nhận'
        cancelText='Hủy'
        modalText={<FormChoosePolicy onSelect={handleSelectPolicy} serviceType={watch('serviceType')} />}
      /> */}
    </>
  )
}

export default FeeAssignmentManagement
