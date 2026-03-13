import { FormInputNumber, FormSelect } from '@components/form'
import { ButtonComponent, CardComponent, DialogModal } from '@components/index'
import InfoComponents from './InfoComponents'
import { calculationMethodEnum } from '../constants/FeeManagement.constant'
import useHandleInfoPolicy from '../hooks/useHandleInfoPolicy'

interface InforPolicyProps {
  policyId?: string
  selectedRow?: any | null
  onSuccess?: () => void
  onClose?: () => void
}

const InforPolicy = ({
  policyId,
  selectedRow,
  onSuccess,
  onClose
}: InforPolicyProps) => {
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

  return (
    <div className='overflow-auto'>
      <CardComponent
        className='mb-3'
        style={{ width: '100%' }}
        content={
          <>
            <p className='font-bold mb-1'>Thông tin chung</p>
            <div className='grid grid-cols-12 gap-3 px-2'>
              <FormSelect
                control={control}
                name='componentType'
                label='Loại phí'
                className='col-span-4 flex flex-col'
                options={selectOptions.componentType}
                placeholder='Chọn loại phí'
                disabled={isUpdateMode}
              />
              <FormSelect
                control={control}
                name='baseOn'
                label='Tính dựa trên'
                className='col-span-4 flex flex-col'
                options={selectOptions.baseOn}
                placeholder='Chọn loại tính phí'
              />
              <FormSelect
                control={control}
                name='payerType'
                label='Người chịu'
                className='col-span-4 flex flex-col'
                options={selectOptions.payerType}
                placeholder='Chọn người chịu phí'
                disabled={isUpdateMode}
              />
              <FormSelect
                control={control}
                name='beneficiaryType'
                label='Người hưởng'
                className='col-span-4 flex flex-col'
                options={selectOptions.beneficiaryType}
                placeholder='Chọn người hưởng phí'
              />
              <FormSelect
                control={control}
                name='roundMode'
                label='Công thức làm tròn'
                className='col-span-4 flex flex-col'
                options={selectOptions.roundMode}
                placeholder='Chọn công thức làm tròn'
              />
              {!isVATType && (
                <FormSelect
                  control={control}
                  name='calculationMethod'
                  label='Chọn phương thức tính'
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
                Phương thức tính (Calculation Method)
              </p>
              <FormInputNumber
                control={control}
                name='percentage'
                label='Phần trăm (%)'
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
                Phương thức tính (Calculation Method)
              </p>
              <div className='grid grid-cols-12 gap-3'>
                <FormInputNumber
                  control={control}
                  name='fixedAmount'
                  label='Phí cố định (Fixed)'
                  className='col-span-3 flex flex-col gap-2'
                  placeholder='0'
                  formatter={(value: number) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value: string) => value?.replace(/,/g, '') as string}
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
                  formatter={(value: number) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value: string) => value?.replace(/,/g, '') as string}
                  classNameLable='font-medium'
                />
                <FormInputNumber
                  control={control}
                  name='maxFee'
                  label='Phí tối đa (Max)'
                  className='col-span-3 flex flex-col gap-2'
                  placeholder='0'
                  formatter={(value: number) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value: string) => value?.replace(/,/g, '') as string}
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

      <div className='flex justify-end gap-2 mt-4'>
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
      </div>
    </div>
  )
}

export default InforPolicy
