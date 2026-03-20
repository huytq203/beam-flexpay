import {
  ModalComponent,
  ButtonComponent,
  DialogModal,
  Table
} from '@components/index'
import { SaveOutlined } from '@components/icons'
import { useGetFeePolicyByIdQuery } from '@services/apiFeePoliciesServices'
import { useEffect, useRef } from 'react'
import { FeeComponent } from './types/FeeComponent.types'
import { useFeeComponentForm } from './hook/useFeeComponentForm'
import InforPolicy, { InfoPolicyRef } from './components/InfoPolicy'
import FormAddPolicy from './components/FormAddPolicy'
import * as Icon from '@components/icons'
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
    handleOpenAddModal,
    handleBack,
    isSubmitting,
    isDeleting,
    reset,
    isEdit,
    loadingFeeComponentById,
    handleCloseModal
  } = useFeeComponentForm()

  const infoPolicyRef = useRef<InfoPolicyRef>(null)

  const { data: policyDataById } = useGetFeePolicyByIdQuery(id!, {
    skip: !isEdit
  })

  useEffect(() => {
    if (policyDataById) {
      reset(policyDataById)
    }
  }, [policyDataById, reset])

  const handleSaveAddFee = async () => {
    if (selectedRow) {
      await infoPolicyRef.current?.update()
    } else {
      await infoPolicyRef.current?.submit()
    }
  }

  const handleModalSuccess = () => {
    setOpen(false)
  }
  const arrListBaseOn: string[] = [];
  dataSource.forEach((item: FeeComponent) => {
    arrListBaseOn.push(item.componentType)
  })
  
  return (
    <div>
      <div>
        <ButtonComponent
          type='default'
          content='Quay lại'
          onClick={handleBack}
          icon={<Icon.ArrowLeftOutlined  />}
        />
      </div>

      <div className='flex flex-col justify-center item-center my-2 gap-2'>
        <div className='item1 bg-white rounded p-3'>
          <div className='header'>
            <div className='flex justify-between items-center'>
              <p className='text-[16px] font-semibold'>1. Thông tin chung</p>
            </div>
            <div className='content'>
              <FormAddPolicy
                control={control}
                handleSubmit={handleSubmit}
                id={id}
                handleUpdate={handleUpdate}
                onSubmit={onSubmit}
                data={policyDataById}
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
            <p className='text-[16px] font-semibold'>
              2. Danh sách thành phần phí 
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
              bordered
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                onChange: (newPage, newPageSize) => {
                  setPage(newPage)
                  setPageSize(newPageSize)
                },
                showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} bản ghi`
              }}

            />
            <ModalComponent
              key={selectedRow?.id}
              width="75%"
              title={selectedRow ? 'Sửa thành phần phí' : 'Thêm thành phần phí'}
              open={open}
              onOk={handleSaveAddFee}
              onCancel={handleCloseModal}
              confirmLoading={isSubmitting}
              modalText={
                <InforPolicy
                  ref={infoPolicyRef}
                  selectedRow={selectedRow}
                  combinedInitialData={combinedInitialData}
                  onSubmit={handleFormSubmit}
                  onUpdate={handleUpdateFeeComponent}
                  onSuccess={handleModalSuccess}
                  arrListBaseOn={arrListBaseOn}
                />
              }
              loading={loadingFeeComponentById}
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
        mode='DELETE'
      />
    </div>
  )
}

export default FeeComponentManagement
