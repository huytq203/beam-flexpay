import { FormInputNumber, FormSelect } from '@components/form'
import { CardComponent, DialogModal } from '@components/index'
import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react'

import { FeeComponentType } from '@pages/fee-management-v4/fee-management/schemas/FeeManagement.schema'
import useInfoComponent, { UseInfoComponentRef } from '@pages/fee-management-v4/fee-assignment/hook/useInfoComponent'
import { FeeComponent, FeeTier } from '../types/FeeComponent.types'
import InfoComponents from '@pages/fee-management-v4/fee-management/components/InfoComponents'

interface Props {
  selectedRow: FeeComponent | null
  combinedInitialData: FeeComponent | FeeTier[] | null
  onSubmit?: (data: FeeComponentType) => Promise<string | undefined | void> | void
  onUpdate?: (data: FeeComponentType, componentId?: string) => Promise<void> | void
  onSuccess?: (id?: string) => void
  arrListBaseOn?: string[]
  policyId?: string
  onTierModeChange?: (isTierMode: boolean) => void
}

export interface InfoPolicyRef {
  submit: () => Promise<string | undefined | void>
  update: () => Promise<void>
  reset: () => void
}

const InforPolicy = forwardRef<InfoPolicyRef, Props>(
  ({ selectedRow, combinedInitialData, onSubmit, onUpdate, onSuccess, arrListBaseOn, policyId, onTierModeChange }, ref) => {
    const hookRef = useRef<UseInfoComponentRef>(null)

    const {
      control,
      isTierMode,
      isVATType,
      isUpdateMode,
      selectOptions,
      columns,
      fields,
      handleAddTier,
      openDialog,
      confirmDelete,
      cancelDelete,
      isDeleteLoading
    } = useInfoComponent({
      selectedRow,
      combinedInitialData,
      onSubmit,
      onUpdate,
      onSuccess,
      policyId,
      ref: hookRef
    })

    useEffect(() => {
      onTierModeChange?.(isTierMode)
    }, [isTierMode, onTierModeChange])

    useImperativeHandle(ref, () => ({
      submit: async () => {
        return await hookRef.current?.submit()
      },
      update: async () => {
        await hookRef.current?.update()
      },
      reset: () => {
        hookRef.current?.reset()
      }
    }), [])
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
                  className='col-span-4 flex flex-col '
                  options={selectOptions.componentType}
                  placeholder='Chọn loại phí'
                  disabled={isUpdateMode}
                />
                <FormSelect
                  control={control}
                  name='baseOn'
                  label='Tính dựa trên'
                  className='col-span-4 flex flex-col'
                  options={
                    // isUpdateMode
                    //   ? arrListBaseOn
                    //   ? selectOptions.baseOn.filter(opt => arrListBaseOn.includes(String(opt.value)))
                    //   : []
                    //   : selectOptions.baseOn
                    // selectOptions.baseOn
                    arrListBaseOn && arrListBaseOn.length > 0
                      ? selectOptions.baseOn.filter(opt => arrListBaseOn.includes(String(opt.value)) || String(opt.value) === 'AMOUNT')
                      : selectOptions.baseOn.slice(0, 1)
                  }
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
                    disabled={isUpdateMode}
                  />
                )}
              </div>
            </>
          }
        ></CardComponent>


        {isVATType ? (
          <CardComponent content={
            <>

              <p className='font-bold mb-3'>
                Phương thức tính 
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
          } />
        ) : (isTierMode && isUpdateMode) ? (
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
        ) : !isTierMode && (
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
                    label='Phí cố định (Fixed)'
                    className='col-span-3 flex flex-col gap-2'
                    placeholder='0'
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    }
                    parser={(value) =>
                      value?.replace(/,/g, '') ?? ''
                    }
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
                    parser={(value) =>
                      value?.replace(/,/g, '') ?? ''
                    }
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
                    parser={(value) =>
                      value?.replace(/,/g, '') ?? ''
                    }
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
      </div>
    )
  }
)

InforPolicy.displayName = 'InforPolicy'

export default InforPolicy
