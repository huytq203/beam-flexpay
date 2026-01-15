import {
  ModalComponent,
  ButtonComponent,
  DialogModal,
  Table
} from '@components/common'
import FormAddFeeComponent from '@pages/fee-managerment-v3/components/FormAddFeeComponent'
import FormAddPolicy from '@pages/fee-managerment-v3/components/FormAddPolicy'
import { SaveOutlined } from '@components/icons/common'
import { useFeeComponentForm } from '@pages/fee-managerment-v3/fee-component-management/hooks/useFeeComponentForm'

const FeeComponentManagement = () => {
  const {
    id,
    svg,
    open,
    setOpen,
    page,
    pageSize,
    setPage,
    setPageSize,
    selectedRow,
    openDialog,
    setOpenDialog,
    deletingId,
    formRef,
    control,
    handleSubmit,
    dataSource,
    columns,
    total,
    combinedInitialData,
    handleFormSubmit,
    handleUpdateFeeComponent,
    handleDelete,
    onSubmit,
    handleUpdate,
    handleSaveAddFee,
    handleOpenAddModal,
    handleBack,
    isSubmitting,
    isDeleting
  } = useFeeComponentForm()

  return (
    <div>
      <div>
        <ButtonComponent
          type='default'
          content='Quay lai'
          onClick={handleBack}
          icon={svg('/icons.svg#hugeicons-arrow-left-02')}
        />
      </div>

      <div className='flex flex-col justify-center item-center my-2 gap-2'>
        <div className='item1 bg-white rounded p-3'>
          <div className='header'>
            <div className='flex justify-between items-center'>
              <p className='text-lg font-semibold'>1. Thông tin chung</p>
            </div>
            <div className='content'>
              <FormAddPolicy
                control={control}
                handleSubmit={handleSubmit}
                id={id}
                handleUpdate={handleUpdate}
                onSubmit={onSubmit}
              />
            </div>
          </div>
          <div className='flex justify-end items-center'>
            <ButtonComponent
              form='policyForm'
              htmlType='submit'
              content='Lưu lại'
              icon={<SaveOutlined />}
            />
          </div>
        </div>

        <div className='item3 bg-white rounded p-3'>
          <div className='header flex justify-between items-center'>
            <p className='text-lg font-semibold'>
              2. Danh sách Cấu phần phí (Components)
            </p>
            <ButtonComponent
              htmlType='button'
              content='Thêm thành phần phí'
              onClick={handleOpenAddModal}
              type='primary'
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
          <div className='content px-3'>
            <Table
              columns={columns}
              dataSource={dataSource}
              size='small'
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage)
                  setPageSize(newPageSize)
                }
              }}
            />
            <ModalComponent
              title={selectedRow ? 'Sửa thành phần phí' : 'Thêm thành phần phí'}
              open={open}
              onOk={handleSaveAddFee}
              onCancel={() => setOpen(false)}
              confirmLoading={isSubmitting}
              modalText={
                <FormAddFeeComponent
                  ref={formRef}
                  onSubmit={
                    selectedRow ? handleUpdateFeeComponent : handleFormSubmit
                  }
                  initialData={selectedRow ? combinedInitialData : null}
                />
              }
            />
          </div>
        </div>
      </div>

      <DialogModal
        open={openDialog}
        onOk={() => handleDelete(deletingId)}
        onCancel={() => setOpenDialog(false)}
        confirmLoading={isDeleting}
        content='Bạn có xác nhận xóa ?'
      />
    </div>
  )
}

export default FeeComponentManagement
