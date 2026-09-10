import { forwardRef, useImperativeHandle, useMemo } from 'react'
import { FormInputNumber, FormSelect } from '@components/form'
import { CardComponent, DialogModal, FeeRoundModeField } from '@components/index'
import InfoComponents from './InfoComponents'
import { calculationMethodEnum } from '../constants/FeeManagement.constant'
import useHandleInfoPolicy from '../hooks/useHandleInfoPolicy'
import { FeeComponent } from '../types/FeeComponent.types'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'

export interface InforPolicyRef {
  handleSave: () => Promise<void>
}

interface InforPolicyProps {
  policyId?: string
  selectedRow?: FeeComponent | null
  onSuccess?: () => void
  onClose?: () => void
  listBaseOn?: Record<string, string | boolean>
  arrTypeFee?: Record<string, string | boolean>
}

const InforPolicy = forwardRef<InforPolicyRef, InforPolicyProps>((props, ref) => {
  const {
    policyId,
    selectedRow,
    onSuccess,
    onClose,
    listBaseOn,
    arrTypeFee
  } = props
  const {
    control,
    fields,
    isVATType,
    isTierMode,
    isUpdateMode,
    selectOptions,
    columns,
    handleAddTier,
    handleAdd,
    handleUpdate,
    openDialog,
    confirmDelete,
    cancelDelete,
    isDeleteLoading
  } = useHandleInfoPolicy({ policyId, selectedRow, onSuccess, onClose })

  const handleSave = isUpdateMode ? handleUpdate : handleAdd

  useImperativeHandle(ref, () => ({
    handleSave
  }))
const allComponentTypeForDisplay = useMemo(() => {
    const existingKeys = Object.keys(arrTypeFee || {});
    const currentValue = selectedRow?.componentType;

    return selectOptions.componentType?.reduce((acc: Record<string, string>, option) => {
        // Bao gồm: giá trị hiện tại HOẶC những cái không có trong existing keys
        if (!existingKeys.includes(option.value as string) || option.value === currentValue) {
            acc[option.value as string] = option.label;
        }
        return acc;
    }, {}) || {};
}, [selectOptions.componentType, arrTypeFee, selectedRow?.componentType]);

  return (
    <div className='overflow-auto'>
      <CardComponent
        className='mb-3!'
        style={{ width: '100%' }}
        content={
          <>
            <p className='font-bold mb-1'>Thông tin chung</p>
            <div className='grid grid-cols-12 gap-3 px-2'>
              <FormSelect
                control={control}
                name='componentType'
                label={<span>Loại phí <span className='text-red-500'>*</span></span>}
                className='col-span-4 flex flex-col'
                options={mapEnumToSelectOptions(allComponentTypeForDisplay)}
                placeholder='Chọn loại phí'
                disabled={isUpdateMode}
              />
              <FormSelect
                control={control}
                name='baseOn'
                label={<span>Tính dựa trên <span className='text-red-500'>*</span></span>}
                className='col-span-4 flex flex-col'
                options={mapEnumToSelectOptions(listBaseOn || {})}
                placeholder='Chọn loại tính phí'
              />
              <FormSelect
                control={control}
                name='payerType'
                label={<span>Người chịu <span className='text-red-500'>*</span></span>}
                className='col-span-4 flex flex-col'
                options={selectOptions.payerType}
                placeholder='Chọn người chịu phí'
                disabled={isUpdateMode}
              />
              <FormSelect
                control={control}
                name='beneficiaryType'
                label={<span>Người hưởng <span className='text-red-500'>*</span></span>}
                className='col-span-4 flex flex-col'
                options={selectOptions.beneficiaryType}
                placeholder='Chọn người hưởng phí'
              />
              <FeeRoundModeField
                control={control}
                name='roundMode'
                options={selectOptions.roundMode}
                className='col-span-4 flex flex-col'
              />
              {!isVATType && (
                <FormSelect
                  control={control}
                  name='calculationMethod'
                  label={<span>Chọn phương thức tính <span className='text-red-500'>*</span></span>}
                  className='col-span-4 flex flex-col'
                  options={selectOptions.calculationMethod}
                  defaultValue={calculationMethodEnum.DIRECT}
                  disabled={isUpdateMode}
                />
              )}
            </div>
          </>
        }
      />

      {isVATType ? (
        <CardComponent
          content={
            <>
              <p className='font-bold mb-3'>
                Phương thức tính
              </p>
              <FormInputNumber
                control={control}
                name='percentage'
                label={<span>Phần trăm (%) <span className='text-red-500'>*</span></span>}
                className='col-span-3 flex flex-col gap-2'
                placeholder='0%'
                classNameLable='font-medium'
              />
            </>
          }
        />
      ) : isTierMode ? (
        <CardComponent
          content={
            <InfoComponents
              control={control}
              columns={columns}
              fields={fields}
              append={handleAddTier}
            />
          }
        />
      ) : (
        <CardComponent
          content={
            <>
              <p className='font-bold mb-3'>
                Phương thức tính
              </p>
              <div className='grid grid-cols-12 gap-3'>
                <FormInputNumber
                  control={control}
                  name='fixedAmount'
                  label={<span>Phí cố định (Fixed) </span>}
                  className='col-span-3 flex flex-col gap-2'
                  placeholder='0'
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value?.replace(/,/g, '') ?? ''}
                  classNameLable='font-medium'
                />
                <FormInputNumber
                  control={control}
                  name='percentage'
                  label='Phần trăm (%)'
                  className='col-span-3 flex flex-col gap-2'
                  placeholder='0%'
                  classNameLable='font-medium'
                  
                />
                <FormInputNumber
                  control={control}
                  name='minFee'
                  label='Phí tối thiểu (Min)'
                  className='col-span-3 flex flex-col gap-2'
                  placeholder='0'
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value?.replace(/,/g, '') ?? ''}
                  classNameLable='font-medium'
                />
                <FormInputNumber
                  control={control}
                  name='maxFee'
                  label='Phí tối đa (Max)'
                  className='col-span-3 flex flex-col gap-2'
                  placeholder='0'
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value?.replace(/,/g, '') ?? ''}
                  classNameLable='font-medium'
                />
              </div>
            </>
          }
        />
      )}

      <DialogModal
        open={openDialog}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        confirmLoading={isDeleteLoading}
        content='Bạn có xác nhận xóa tier này?'
      />

{/* <div className='flex justify-end gap-2 mt-4'>
        <ButtonComponent
          htmlType='button'
          content='Hủy'
          type='default'
          onClick={onClose}
        />
        <ButtonComponent
          htmlType='button'
          content='Xác nhận'
          type='primary'
          onClick={handleSave}
        />
      </div> */}
    </div>
  )
})

export default InforPolicy
