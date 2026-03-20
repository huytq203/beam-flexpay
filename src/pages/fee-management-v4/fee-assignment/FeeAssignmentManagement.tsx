import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/index'
import FormAddAssign from './components/FormChoosePolicy'
import FormFieldAssign from './components/FormFieldAssign'
import FormInforAdd from './components/FormInforAdd'
import React from 'react'
import { SkeletonFilterGroup, SkeletonTable } from '@components/ui/skeletons/Skeleton'
import useHandleFeeAssignment from './hook/useHandleFeeAssignment'
import FormSearchAssignment from './components/FormSearchAssignment'

const FeeAssignmentManagement = () => {
  const {
    loadingSearch,
    isPostAssign,
    openModalDelete,
    openModalAdd,
    openModalSelectPolicy,
    isCreate,
    control,
    setValue,
    watch,
    handleSubmit,
    handleSearch,
    handleReset,
    handleOpenModalAdd,
    handleCloseModalAdd,
    handleDelete,
    handleCloseModalDelete,
    handlePostAssign,
    handleCloseModalSelectPolicy,
    handleSelectPolicy,
    columns,
    dataSource,
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
            <div className=" mb-3">
              <SkeletonFilterGroup items={2} />
            </div>
            <SkeletonTable rows={5} columns={3} />
          </>
        ) : (
          <>
            <CardComponent
              content={
                <>
                  <form action='formViewAssign' className='mb-3'>
                    {/* <FormFieldAssign
                      control={control}
                      setValue={setValue}
                      isCreate={isCreate}
                    /> */}
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
        width={{ xs: "100% ", md: "95%" }}
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
      <ModalComponent
        title={'Chọn chính sách phí'}
        width={{ xs: "100% ", md: "70%" }}
        open={openModalSelectPolicy}
        onOk={handleCloseModalSelectPolicy}
        onCancel={handleCloseModalSelectPolicy}
        modalText={<FormAddAssign onSelect={handleSelectPolicy} serviceType={watch('serviceType')} />}
      />
    </>
  )
}

export default FeeAssignmentManagement
