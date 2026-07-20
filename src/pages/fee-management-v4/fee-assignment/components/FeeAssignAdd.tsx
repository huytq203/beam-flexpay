import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent
} from '@components/index'
import { useSVG } from '@hooks/useSVG'
import React, { useRef } from 'react'
import { ComponentDetail } from '@pages/fee-management-v4/fee-assignment/components/ComponentDetail'
import InforPolicy, { InfoPolicyRef } from './InfoPolicy'
import FormInforAdd from './FormInforAdd'
import * as Icons from '@components/icons'
import { useFeeAssignmentForm } from '../hook'

const FeeAssignAdd = () => {
  const {
    // State
    openDialog,
    setOpenDialog,
    openModalDetail,
    setOpenModalDetail,
    selectedComponent,

    // Form
    setValue,

    // Data
    id,
    feeComponentData,
    combinedInitialData,
    dataAssignById,
    policyData,

    // Handlers
    handleNavigateBack,
    handleEditComponent,
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

  const { svg } = useSVG()
  const infoPolicyRef = useRef<InfoPolicyRef>(null)

 


  return (
    <div className='space-y-3'>
      <CardComponent className='' styles={{ body: { padding: '12px 24px' } }}>
        <div className='flex justify-between items-center'>
          <div className='flex items-center gap-2 text-green-600'>
            <Icons.EditOutlined className='text-[18px] bg-blue-50 p-2 rounded' />
            <p className='font-semibold text-[16px]'>Cập nhật gán phí</p>
          </div>
          <div className="flex gap-2">

            <ButtonComponent
              type='default'
              onClick={handleNavigateBack}
              content='Quay lại'
              icon={<Icons.ArrowLeftOutlined />}
            />
            <ButtonComponent
              form='formAssign'
              htmlType='submit'
              content='Lưu lại'
              icon={<Icons.SaveOutlined />}
            />
          </div>
        </div>
      </CardComponent>
      <CardComponent>
        <div className='flex items-center gap-2 mb-3'>
          <Icons.InfoCircleOutlined className='text-[16px] text-blue-500 bg-blue-50 p-2 rounded-md' />
          <p className='font-medium text-[16px]'>1. Thông tin chung</p>
        </div>
        <FormInforAdd
          svg={svg}
          id={id}
          handlePutAssign={handlePutAssign}
          handlePostAssign={handlePostAssign}
          onPolicySelected={(feePolicyId) => setValue('feePolicyId', feePolicyId)}
          editData={dataAssignById}
        />

      </CardComponent>
      {policyData &&

        <CardComponent
          content={
            <>
              <div className='flex items-center gap-2 mb-3'>
                <Icons.ApartmentOutlined className='text-[16px] text-blue-500  bg-blue-50 p-2 rounded' />
                <p className='font-medium text-[16px]'>
                  2. Thông tin thành phần {policyData?.name && `(${policyData?.name})`}
                </p>
              </div>

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
                <div className=' flex justify-center items-center '>
                  <div className='flex flex-col items-center text-gray-400'>
                    {svg('/icons.svg#hugeicons-database-restore', {
                      width: 50,
                      height: 50
                    })}

                    <p>No data available</p>
                  </div>
                </div>
              )}
            </>
          }
        />
      }
      <DialogModal
        open={openDialog}
        onOk={handleDeleteAssign}
        onCancel={() => setOpenDialog(false)}
        confirmLoading={loadingDeleteComponent}
        content='Bạn có xác nhận xóa ?'
      />
      <ModalComponent
        title='Sửa thành phần phí'
        open={openModalDetail}
        onOk={() => infoPolicyRef.current?.update()}
        onCancel={handleCloseModalDetail}
        confirmLoading={isSubmitting}
        modalText={
          <InforPolicy
            ref={infoPolicyRef}
            selectedRow={selectedComponent}
            combinedInitialData={combinedInitialData}
            onUpdate={handleUpdateFeeComponent}
            onSuccess={handleCloseModalDetail}
          />
        }
      />
    </div>
  )
}

export default FeeAssignAdd
