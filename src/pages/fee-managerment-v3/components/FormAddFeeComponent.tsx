import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect
} from 'react'
import { Card, Table } from 'antd'
import { ButtonComponent, DialogModal } from '@components/common'
import { PlusOutlined } from '@ant-design/icons'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeComponentSchema, FeeComponentType } from '../FeeManagement.schema'
import { FormInputNumber, FormSelect } from '@components/form'
import {
  useDeleteFeeComponentTierMutation,
  usePostFeeComponentTierMutation,
  usePutFeeComponentTierMutation
} from '@services/apiFeeComponentTier'
import {
  baseOn,
  beneficiaryType,
  calculationMethodEnum,
  componentType,
  feePolicyComponent,
  payerType,
  roundMode
} from '@type/feePoliciesComponent'
import { useMessage } from '@hooks/useMessage'
import { getTierColumns } from './FormAddFeeComponent.columns'

interface FormAddFeeProps {
  initialData?: FeeComponentType | null
  onSubmit?: (data: FeeComponentType) => Promise<string | undefined | void> | void
}

const DEFAULT_TIER = {
  minFee: undefined,
  maxFee: undefined,
  fixedAmount: undefined,
  percentage: undefined,
  maxValue: undefined,
  minValue: undefined
}

const DEFAULT_VALUES: FeeComponentType = {
  componentType: '',
  baseOn: '',
  payerType: '',
  beneficiaryType: '',
  roundMode: '',
  calculationMethod: 'DIRECT',
  tiers: [DEFAULT_TIER],
  fixedAmount: undefined,
  percentage: undefined,
  minFee: undefined,
  maxFee: undefined
}


const FormAddFeeComponent = forwardRef<
  {
    submit: () => void
    update: () => void
    reset: () => void
    submitAllTiers: (feeComponentId?: string) => Promise<void>
    updateAllTiers: () => Promise<void>
  },
  FormAddFeeProps
>(({ onSubmit, initialData }, ref) => {
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    reset,
    formState: { errors }
  } = useForm<FeeComponentType>({
    resolver: zodResolver(FeeComponentSchema),
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: true
  })

  const [postFeeComponentTier] = usePostFeeComponentTierMutation()
  const [putFeeComponentTier] = usePutFeeComponentTierMutation()
  const [deleteFeeComponentTier, { isLoading: isDeleteFeeComponentTierLoading }] =
    useDeleteFeeComponentTierMutation()
  const { successMess, errorMess } = useMessage()
  const isUpdateMode = !!(initialData as feePolicyComponent)?.id

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tiers'
  })
  const [openDialog, setOpenDialog] = useState(false)
  const [deleteComponentId, setDeleteComponentId] = useState<string>('')

  const handleDeleteTier = async (id?: string) => {
    try {
      if (id) {
        await deleteFeeComponentTier(id).unwrap()
      }
      setOpenDialog(false)
      successMess('Xóa thành công')
    } catch (error) {
      errorMess('Xóa thất bại')
    }
  }

  const handleUpdateTier = async () => {
    try {
      const allTiers = getValues('tiers')
      const feeComponentId = (initialData as feePolicyComponent)?.id
      const roundModeVal = getValues('roundMode')

      if (!allTiers || allTiers.length === 0) {
        return
      }

      const payload = allTiers.map((tierData) => ({
        feeComponentId,
        minValue: tierData.minValue ?? 0,
        maxValue: tierData.maxValue ?? 0,
        roundMode: roundModeVal,
        minFee: tierData.minFee ?? 0,
        maxFee: tierData.maxFee ?? 0,
        fixedAmount: tierData.fixedAmount ?? 0,
        percentage: tierData.percentage ?? 0
      }))

      await putFeeComponentTier({ body: payload }).unwrap()
    } catch (error) {
      throw error
    }
  }

  const handleSubmitAllTiers = async (feeComponentId?: string) => {
    try {
      const allTiers = getValues('tiers')
      const roundModeVal = getValues('roundMode')

      const componentId = feeComponentId || (initialData as feePolicyComponent)?.id

      if (!componentId) {
        errorMess('Không có feeComponentId')
        return
      }

      if (!allTiers || allTiers.length === 0) {
        errorMess('Không có dữ liệu tier để thêm')
        return
      }

      const payload = allTiers.map((tierData) => ({
        feeComponentId: componentId,
        minValue: tierData.minValue ?? 0,
        maxValue: tierData.maxValue ?? 0,
        roundMode: roundModeVal,
        minFee: tierData.minFee ?? 0,
        maxFee: tierData.maxFee ?? 0,
        fixedAmount: tierData.fixedAmount ?? 0,
        percentage: tierData.percentage ?? 0
      }))

      await postFeeComponentTier(payload).unwrap()
      successMess('Thêm mới thành công')
    } catch (error) {
      errorMess('Thêm mới thất bại')
    }
  }

  const onDeleteTier = (index: number, id?: string) => {
    if (id) {
      setDeleteComponentId(id)
      setOpenDialog(true)
    } else {
      remove(index)
    }
  }

  useEffect(() => {
    if (initialData) {
      const dataToReset = { ...initialData }
      if (!dataToReset.tiers || dataToReset.tiers.length === 0) {
        dataToReset.tiers = [DEFAULT_TIER]
      }
      reset(dataToReset)
    } else {
      reset(DEFAULT_VALUES)
    }
  }, [initialData, reset])

  const componentTypes = watch('componentType')

  const isTierMode = ['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(
    String(watch('calculationMethod'))
  )

  useImperativeHandle(ref, () => ({
    submit: async () => {
      handleSubmit(
        async (data) => {
          if (onSubmit) {
            await onSubmit(data)
          }
        },
        (errors) => {
          console.log('Validation Errors:', errors)
        }
      )()
    },
    update: async () => {
      await handleSubmit(
        async (data) => {
          try {
            const promises: Promise<any>[] = []

            if (onSubmit) {
              promises.push(onSubmit(data) as Promise<any>)
            }
            if (initialData?.calculationMethod !== (Object.keys(calculationMethodEnum)[1] as keyof typeof calculationMethodEnum)) {
              promises.push(handleUpdateTier())

            }

            await Promise.all(promises)

            successMess('Cập nhật phí thành công')
          } catch (error) {
            errorMess(error?.data?.detail)
          }
        },
        (errors) => {
          console.log('Validation Errors:', errors)
        }
      )()
    },
    reset: () => reset(DEFAULT_VALUES),
    submitAllTiers: handleSubmitAllTiers,
    updateAllTiers: handleUpdateTier
  }))

  const columns = getTierColumns({
    control,
    getValues,
    onDeleteTier,
  })

  const selectOptions = {
    componentType: [
      { label: 'Chọn', value: '' },
      ...Object.entries(componentType).map(([key, value]) => ({
        label: value,
        value: key
      }))
    ],
    baseOn: [
      { label: 'Chọn', value: '' },
      ...Object.entries(baseOn).map(([key, value]) => ({
        label: value,
        value: key
      }))
    ],
    payerType: [
      { label: 'Chọn', value: '' },
      ...Object.entries(payerType).map(([key, value]) => ({
        label: value,
        value: key
      }))
    ],
    beneficiaryType: [
      { label: 'Chọn', value: '' },
      ...Object.entries(beneficiaryType).map(([key, value]) => ({
        label: value,
        value: key
      }))
    ],
    roundMode: [
      { label: 'Chọn', value: '' },
      ...Object.entries(roundMode).map(([key, value]) => ({
        label: value,
        value: key
      }))
    ],
    calculationMethod: Object.entries(calculationMethodEnum).map(
      ([key, value]) => ({
        label: value,
        value: key
      })
    )
  }

  const isVATType = ['VAT'].includes(String(componentTypes))

  return (
    <div className='overflow-auto'>
      {/* Thông tin chung */}
      <Card className='mb-3' style={{ width: '100%' }}>
        <p className='font-bold mb-1'>Thông tin chung</p>
        <div className='grid grid-cols-12 gap-3 px-2'>
          <FormSelect<FeeComponentType>
            control={control}
            name='componentType'
            label='Loại phí'
            className='col-span-4 flex flex-col '
            defaultValue=''
            options={selectOptions.componentType}
            placeholder='Chọn loại phí'
            disabled={isUpdateMode}
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='baseOn'
            label='Tính dựa trên'
            className='col-span-4 flex flex-col'
            defaultValue=''
            options={isUpdateMode ? selectOptions.baseOn : [
              { label: 'Chọn', value: '' },
              {
                ...Object.entries(baseOn).map(([key, value]) => ({
                  label: value,
                  value: key
                }))[0]
              }]}
            placeholder='Chọn loại tính phí'
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='payerType'
            label='Người chịu'
            className='col-span-4 flex flex-col'
            defaultValue=''
            options={selectOptions.payerType}
            placeholder='Chọn người chịu phí'
            disabled={isUpdateMode}
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='beneficiaryType'
            label='Người hưởng'
            className='col-span-4 flex flex-col'
            defaultValue=''
            options={selectOptions.beneficiaryType}
            placeholder='Chọn người hưởng phí'
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='roundMode'
            label='Công thức làm tròn'
            className='col-span-4 flex flex-col'
            defaultValue=''
            options={selectOptions.roundMode}
            placeholder='Chọn công thức làm tròn'
          />

          {isVATType ? '' : <FormSelect<FeeComponentType>
            control={control}
            name='calculationMethod'
            label='Chọn phương thức tính'
            className='col-span-4 flex flex-col'
            options={selectOptions.calculationMethod}
          />}

        </div>
      </Card>

      {isVATType ? (
        <Card>
          <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
          <FormInputNumber
            control={control}
            name='percentage'
            label='Phí phần trăm (%)'
            className='col-span-3 flex flex-col gap-2'
            placeholder='0%'
            classNameLable='font-medium'
          />
        </Card>
      ) : !(isTierMode && !isUpdateMode) && (

        <div>
          <Card className='mb-3' style={{ width: '100%' }}>
            <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
            <div className='mb-3'></div>

            {isTierMode && isUpdateMode ? (
              <>
                <Table
                  columns={columns}
                  dataSource={fields}
                  pagination={false}
                  bordered
                  size='small'
                  rowKey='id'
                />
                <ButtonComponent
                  content=' Thêm khoảng phí (Add Tier)'
                  type='dashed'
                  onClick={() => append(DEFAULT_TIER)}
                  style={{ width: '100%', marginTop: 16 }}
                  icon={<PlusOutlined />}
                />
              </>
            ) :

              (
                <Card>
                  <div className='grid grid-cols-12 gap-3'>
                    <FormInputNumber
                      control={control}
                      name='fixedAmount'
                      label='Phí cố định (Fixed)'
                      className='col-span-3 flex flex-col gap-2'
                      placeholder='0'
                      classNameLable='font-medium'
                    />

                    <FormInputNumber
                      control={control}
                      name='percentage'
                      label='Phí phần trăm (%)'
                      className='col-span-3 flex flex-col gap-2'
                      placeholder='0%'
                      classNameLable='font-medium'
                    />
                    <FormInputNumber
                      control={control}
                      name='minFee'
                      label='Tối thiểu (Min)'
                      className='col-span-3 flex flex-col gap-2'
                      placeholder='0'
                      classNameLable='font-medium'
                    />
                    <FormInputNumber
                      control={control}
                      name='maxFee'
                      label='Tối đa (Max)'
                      className='col-span-3 flex flex-col gap-2'
                      placeholder='0'
                      classNameLable='font-medium'
                    />
                  </div>
                </Card>
              )}
          </Card>
        </div>
      )}

      <DialogModal
        open={openDialog}
        onOk={() => handleDeleteTier(deleteComponentId)}
        onCancel={() => setOpenDialog(false)}
        confirmLoading={isDeleteFeeComponentTierLoading}
        content='Bạn có xác nhận xóa ?'
      />
    </div>
  )
})

export default FormAddFeeComponent
