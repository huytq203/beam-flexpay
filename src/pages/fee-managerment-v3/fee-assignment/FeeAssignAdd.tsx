import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent
} from '@components/common'
import FormAddFeeComponent from '@pages/fee-managerment-v3/components/FormAddFeeComponent'
import { ComponentDetail } from '@pages/fee-managerment-v3/fee-assignment/components/ComponentDetail'
import FormAddAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormAddAssign'
import FormFieldAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormFieldAssign'
import { useFeeAssignmentForm } from '@pages/fee-managerment-v3/fee-assignment/hook/useFeeAssignmentForm'
import React from 'react'

const FeeAssignAdd = () => {
  const {
    // State
    openDialog,
    setOpenDialog,
    openModal,
    setOpenModal,
    openModalDetail,
    setOpenModalDetail,

    // Refs
    formRef,

    // Form
    control,
    handleSubmit,

    // Data
    id,
    feeComponentData,
    combinedInitialData,

    // Handlers
    handleNavigateBack,
    handleEditComponent,
    handleSaveAddFee,
    handleSelectPolicy,
    handlePostAssign,
    handleOpenDeleteDialog,
    handleDeleteAssign,
    handlePutAssign,
    handleCloseModalDetail,
    handleUpdateFeeComponent,

    // Loading states
    loadingDeleteComponent,
    isSubmitting
  } = useFeeAssignmentForm()

  return (
    <div>
      <div className='my-2'>
        <ButtonComponent
          type='default'
          onClick={handleNavigateBack}
          content='Quay lai'
          icon={
            <svg
              width={20}
              height={20}
            >
              <use href='/icons.svg#hugeicons-arrow-left-02' />
            </svg>
          }
        />
      </div>
      <CardComponent
        content={
          <>
            <div className='flex justify-between items-center mb-3'>
              <p className='font-medium text-lg'>1. Thông tin chung</p>
              <ButtonComponent
                form='formAssign'
                htmlType='submit'
                content='Thiết lập'
                icon={
                  <svg
                    width={20}
                    height={20}
                  >
                    <use href='/icons.svg#hugeicons-file-add' />
                  </svg>
                }
              />
            </div>
            <form
              id='formAssign'
              onSubmit={handleSubmit(id ? handlePutAssign : handlePostAssign)}
            >
              <FormFieldAssign control={control} />
            </form>
            <div className='flex justify-between mt-4'>
              <div className='flex justify-center items-center gap-2'></div>
              <div className='flex justify-center items-center'>
                <ButtonComponent
                  content='Chọn chính sách phí'
                  onClick={() => setOpenModal(true)}
                  icon={
                    <svg
                      className='pointer-events-none'
                      width={20}
                      height={20}
                    >
                      <use href='/icons.svg#hugeicons-plus-sign-circle' />
                    </svg>
                  }
                />
              </div>
            </div>
          </>
        }
      />
      <div className='mt-3'>
        <CardComponent
          content={
            <>
              <p className='font-medium text-lg'>2. Thông tin thành phần</p>

              {(feeComponentData?.length ?? 0) > 0 ? (
                <div className='max-h-[calc(100vh-20rem)] overflow-y-auto'>
                  {feeComponentData?.map((item, index) => (
                    <ComponentDetail
                      key={item.id || index}
                      setOpenModalDetail={setOpenModalDetail}
                      data={item}
                      onEdit={handleEditComponent}
                      onDelete={handleOpenDeleteDialog}
                    />
                  ))}
                </div>
              ) : (
                <div className=' flex justify-center items-center'>
                  <div className='flex flex-col items-center text-gray-400'>
                    <svg
                      width={50}
                      height={50}
                    >
                      <use href='/icons.svg#hugeicons-database-restore' />
                    </svg>
                    <p>No data available</p>
                  </div>
                </div>
              )}
            </>
          }
        />
      </div>
      <DialogModal
        open={openDialog}
        onOk={handleDeleteAssign}
        onCancel={() => setOpenDialog(false)}
        confirmLoading={loadingDeleteComponent}
        content='Bạn có xác nhận xóa ?'
      />
      <ModalComponent
        title={'Thêm thành phần phí'}
        width='70%'
        open={openModal}
        onOk={() => setOpenModal(false)}
        onCancel={() => setOpenModal(false)}
        modalText={<FormAddAssign onSelect={handleSelectPolicy} />}
      />
      <ModalComponent
        title='Sửa thành phần phí'
        open={openModalDetail}
        onOk={handleSaveAddFee}
        onCancel={handleCloseModalDetail}
        confirmLoading={isSubmitting}
        modalText={
          <FormAddFeeComponent
            ref={formRef}
            onSubmit={handleUpdateFeeComponent}
            initialData={combinedInitialData}
          />

        }

      />
    </div>
  )
}

export default FeeAssignAdd
