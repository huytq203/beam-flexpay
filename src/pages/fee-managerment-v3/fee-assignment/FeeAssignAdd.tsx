import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent
} from '@components/common'
import { useSVG } from '@hooks/useSVG'
import FormAddFeeComponent from '@pages/fee-managerment-v3/components/FormAddFeeComponent'
import { ComponentDetail } from '@pages/fee-managerment-v3/fee-assignment/components/ComponentDetail'
import FormAddAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormAddAssign'
import FormFieldAssign from '@pages/fee-managerment-v3/fee-assignment/components/FormFieldAssign'
import { useFeeAssignmentForm } from '@pages/fee-managerment-v3/fee-assignment/hook/useFeeAssignmentForm'
import { useGetFeePolicyByIdQuery } from '@services/apiFeePoliciesServices'
import React, { useEffect } from 'react'
import { FieldErrors, useForm, UseFormHandleSubmit, UseFormSetValue } from 'react-hook-form'
import { feeAssignSchema, FeeAssignType } from './feeAssign.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeAssignment } from '@type/feeAssignment'

interface FormInforAddProps {
  svg: (href: string, options?: { size?: number; width?: number; height?: number; className?: string }) => JSX.Element
  id: string | undefined
  handlePutAssign: (data: FeeAssignType) => Promise<void>
  handlePostAssign: (data: FeeAssignType) => Promise<void>
  onPolicySelected?: (feePolicyId: string) => void
  editData?: FeeAssignment // Data from API for edit mode
  handleSubmit?:()=>void
}

const DEFAULT_FORM_VALUES: FeeAssignType = {
  feePolicyId: '',
  merchantId: null,
  bankCode: '',
  paymentMethod: '',
  cardType: '',
  serviceType: '',
  customerGroup: '',
  status: '',
  applyType: '',
  account: '',
}

export const FormInforAdd = ({ svg, id, handlePutAssign, handlePostAssign, onPolicySelected, editData }: FormInforAddProps) => {
  // Create independent form control for this component
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<FeeAssignType>({
    resolver: zodResolver(feeAssignSchema),
    defaultValues: DEFAULT_FORM_VALUES
  })

  const [openModal, setOpenModal] = React.useState(false)

  useEffect(() => {
    if (editData && id) {
      reset({
        feePolicyId: editData.feePolicyId || '',
        merchantId: editData.merchantId || null,
        bankCode: editData.bankCode || '',
        paymentMethod: editData.paymentMethod || '',
        cardType: editData.cardType || '',
        serviceType: editData.serviceType || '',
        customerGroup: editData.customerGroup || '',
        status: editData.status || '',
        applyType: '',
        account: ''
      })
    }
  }, [editData, id, reset])

  const handleLocalPolicySelect = (feePolicyId: string) => {
    setValue('feePolicyId', feePolicyId)
    onPolicySelected?.(feePolicyId)
    // setOpenModal(false)
  }

  const handleReset = () => {
    reset(DEFAULT_FORM_VALUES)
  }
  return (
    <>
      <CardComponent
        content={
          <>
            <div className='flex justify-between items-center mb-3'>
              <p className='font-medium text-lg'>1. Thông tin chung</p>
              <ButtonComponent
                form='formAssign'
                htmlType='submit'
                content='Thiết lập'
                icon={svg('/icons.svg#hugeicons-file-add')}
              />
            </div>
            <form
              id='formAssign'
              onSubmit={handleSubmit(id ? handlePutAssign : handlePostAssign)}
            >
              <FormFieldAssign control={control} setValue={setValue} />
            </form>
            <div className='flex justify-between mt-4'>
              <div className='flex justify-center items-center gap-2'></div>
              <div className='flex flex-col items-end'>
                <ButtonComponent
                  content='Chọn chính sách phí'
                  onClick={() => setOpenModal(true)}
                  hidden={id && true || false}
                  icon={svg('/icons.svg#hugeicons-plus-sign-circle')}
                />
                {errors.feePolicyId && (
                  <p className='text-red-500 text-sm mt-1'>
                    {errors.feePolicyId.message}
                  </p>
                )}
              </div>
            </div>
          </>
        }
      />
      <ModalComponent
        title={'Chọn chính sách phí'}
        width='70%'
        open={openModal}
        onOk={() => {
          handleLocalPolicySelect
          setOpenModal(false)
        }}
        onCancel={() => {
          setOpenModal(false)
          handleLocalPolicySelect('')
        }}
        modalText={<FormAddAssign onSelect={handleLocalPolicySelect} />}
      />
    </>
  )
}

const FeeAssignAdd = () => {
  const {
    // State
    openDialog,
    setOpenDialog,
    openModalDetail,
    setOpenModalDetail,

    // Refs
    formRef,

    // Form
    control,
    handleSubmit,
    setValue,
    errors,

    // Data
    id,
    feeComponentData,
    combinedInitialData,
    dataAssignById,

    // Handlers
    handleNavigateBack,
    handleEditComponent,
    handleSaveAddFee,
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

  const arr: string[] = []
  feeComponentData?.map((item) => arr.push(item.feePolicyId))
  const name = [...new Set(arr)]
  const { data: policyData } = useGetFeePolicyByIdQuery(name[0])

  return (
    <div>
      <div className='my-2'>
        <ButtonComponent
          type='default'
          onClick={handleNavigateBack}
          content='Quay lai'
          icon={svg('/icons.svg#hugeicons-arrow-left-02')}
        />
      </div>
      <FormInforAdd
        svg={svg}
        id={id}
        handlePutAssign={handlePutAssign}
        handlePostAssign={handlePostAssign}
        onPolicySelected={(feePolicyId) => setValue('feePolicyId', feePolicyId)}
        editData={dataAssignById}
      />
      <div className='mt-3'>
        <CardComponent
          content={
            <>
              <p className='font-medium text-lg'>2. Thông tin thành phần {`(${policyData?.name || ''})`}</p>

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
      </div>
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
