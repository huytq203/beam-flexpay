import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect
} from 'react'
import { Card, Table, Button, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SelectInput, InputNumber, DialogModal, Input, ButtonComponent } from '@components/common'
import {
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeComponentSchema, FeeComponentType } from '../FeeManagement.schema'
import { FormInputNumber, FormSelect } from '@components/form'
import {
  useDeleteFeeComponentTierMutation,
  usePostFeeComponentTierMutation,
  usePutFeeComponentTierMutation
} from '@services/apiFeeComponentTier'
import { baseOn, calculationMethodEnum, componentType, FeeComponentFormValues, feePolicyComponent, payerType, roundMode } from '@type/feePoliciesComponent'
import { useMessage } from '@hooks/useMessage'

interface FormAddFeeProps {
  initialData?: FeeComponentType | null
  onSubmit?: (data: FeeComponentType) => void
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
  percentage: 0,
  minFee: undefined,
  maxFee: undefined
}

const FormAddFeeComponent = forwardRef<
  { submit: () => void; reset: () => void },
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
    defaultValues: DEFAULT_VALUES
  })

  const [postFeeComponentTier] = usePostFeeComponentTierMutation()
  const [putFeeComponentTier] = usePutFeeComponentTierMutation()
  const [deleteFeeComponentTier, { isLoading: isDeleteFeeComponentTierLoading }] = useDeleteFeeComponentTierMutation()
  const { successMess, errorMess } = useMessage()
  const isUpdateMode = !!(initialData as feePolicyComponent)?.id // keeping type assertion for id check if not in schema

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
    } catch (error) { }
  }

  const handleUpdateTier = async (tierData: feePolicyComponent, id?: string) => {
    try {
      const feeComponentId = (initialData as feePolicyComponent)?.id
      const payload = [
        {
          feeComponentId,
          minValue: tierData.minValue,
          maxValue: tierData.maxValue,
          roundMode: tierData.roundMode,
          minFee: tierData.minFee,
          maxFee: tierData.maxFee,
          fixedAmount: tierData.fixedAmount,
          percentage: tierData.percentage
        }
      ]
      if (id) {
        await putFeeComponentTier({ body: payload }).unwrap()
        successMess('Cập nhật thành công')
      }
    } catch (error) { errorMess('Cập nhật thất bại') }
  }

  const handleSubmitTier = async (index: number) => {
    try {
      const tierData = getValues(`tiers.${index}`)
      if (!tierData) return

      const roundModeVal = getValues('roundMode')
      const feeComponentId = (initialData as any)?.id

      const payload = [{
        feeComponentId,
        minValue: tierData.minValue ?? 0,
        maxValue: tierData.maxValue ?? 0,
        roundMode: roundModeVal,
        minFee: tierData.minFee ?? 0,
        maxFee: tierData.maxFee ?? 0,
        fixedAmount: tierData.fixedAmount ?? 0,
        percentage: tierData.percentage ?? 0
      }]

      await postFeeComponentTier(payload).unwrap()
      successMess("Thêm mới thành công")
    } catch (error) {
      errorMess('Thêm mới thất bại')
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

  const calculationMethod = watch('calculationMethod')
  const componentTypes = watch('componentType')

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(
        (data) => {
          if (onSubmit) {
            onSubmit(data)
          }
        },
        (errors) => {
          console.log('Validation Errors:', errors)
        }
      )()
    },
    reset: () => reset(DEFAULT_VALUES)
  }))

  const columns: ColumnsType<any> = [
    {
      title: 'Phí Cố định',
      dataIndex: 'fixedAmount',
      key: 'fixedAmount',
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`tiers.${index}.fixedAmount`}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder='0'
              style={{ width: '100%' }}
            />
          )}
        />
      )
    },
    {
      title: 'Phí %',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`tiers.${index}.percentage`}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder='0'
              style={{ width: '100%' }}
            />
          )}
        />
      )
    },
    {
      title: 'Từ (Min Value)',
      dataIndex: 'minFee',
      key: 'minFee',
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`tiers.${index}.minFee`}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder='Min'
              style={{ width: '100%' }}
            />
          )}
        />
      )
    },
    {
      title: 'Đến (Max Value)',
      dataIndex: 'maxFee',
      key: 'maxFee',
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`tiers.${index}.maxFee`}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder='Max'
              style={{ width: '100%' }}
            />
          )}
        />
      )
    },
    {
      title: 'Giá trị tối thiểu',
      dataIndex: 'minValue',
      key: 'minValue',
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`tiers.${index}.minValue`}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder='Min'
              style={{ width: '100%' }}
            />
          )}
        />
      )
    },
    {
      title: 'Giá trị tối đa',
      dataIndex: 'maxValue',
      key: 'maxValue',
      render: (text, record, index) => (
        <Controller
          control={control}
          name={`tiers.${index}.maxValue`}
          render={({ field }) => (
            <InputNumber
              {...field}
              placeholder='Max'
              style={{ width: '100%' }}
            />
          )}
        />
      )
    },
    {
      title: 'Hoạt động',
      key: 'action',
      align: 'center',
      width: 60,
      render: (_, record, index) => (
        <div className='flex justify-center items-center gap-1'>
          <ButtonComponent
            type='text'
            danger
            icon={<DeleteOutlined {...({} as any)} />}
            onClick={() => {
              const currentTier = getValues(`tiers.${index}`)
              if (currentTier && (currentTier as any).id) {
                setDeleteComponentId((currentTier as any).id)
                setOpenDialog(true)
              } else {
                remove(index)
              }
            }}
          />
          <ButtonComponent
            type='text'
            icon={<CheckOutlined style={{ color: 'green' }}  {...({} as any)} />}
            onClick={() => handleSubmitTier(index)}
          />
          {isUpdateMode && (
            <ButtonComponent
              type='text'
              icon={<SaveOutlined style={{ color: '#08c' }}  {...({} as any)} />}
              onClick={() => {
                const tierData = getValues(`tiers.${index}`)
                handleUpdateTier(tierData as feePolicyComponent, (tierData as feePolicyComponent).id)
              }}
            />
          )}
        </div>
      )
    }
  ]
  return (
    <div className='overflow-auto'>
      <Card
        className='mb-3'
        style={{ width: '100%' }}
      >
        <p className='font-bold mb-1'>Thông tin chung</p>
        <div className='grid grid-cols-12 gap-3 px-2'>
          <FormSelect<FeeComponentType>
            control={control}
            name='componentType'
            label='Loại phí'
            className='col-span-4 flex flex-col'
            defaultValue={''}
            options={[
              { label: 'Chọn', value: '' },
              ...Object.entries(componentType).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
            placeholder='Chọn loại phí'
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='baseOn'
            label='Tính dựa trên'
            className='col-span-4 flex flex-col'
            defaultValue={''}
            options={[
              { label: 'Chọn', value: '' },
              ...Object.entries(baseOn).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
            placeholder='Chọn loại tính phí'
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='payerType'
            label='Người chịu'
            className='col-span-4 flex flex-col'
            defaultValue={''}
            options={[
              { label: 'Chọn', value: '' },
              ...Object.entries(payerType).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
            placeholder='Chọn người chịu phí'
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='beneficiaryType'
            label='Người hưởng'
            className='col-span-4 flex flex-col'
            defaultValue={''}
            options={[
              { label: 'Chọn', value: '' },
              ...Object.entries(payerType).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
            placeholder='Chọn người hưởng phí'
          />

          <FormSelect<FeeComponentType>
            control={control}
            name='roundMode'
            label='Công thức làm tròn'
            className='col-span-4 flex flex-col'
            defaultValue={''}
            options={[
              { label: 'Chọn', value: '' },
              ...Object.entries(roundMode).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
            placeholder='Chọn công thức làm tròn'
          />
          <FormSelect<FeeComponentType>
            control={control}
            name='calculationMethod'
            label='Chọn phương thức tính'
            className='col-span-4 flex flex-col'
            options={[
              ...Object.entries(calculationMethodEnum).map(([key, value]) => ({
                label: value,     // hoặc value
                value: key
              }))
            ]}
          />
        </div>
      </Card>
      {
        ["VAT"].includes(String(componentTypes)) ?
          <Card>
            <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
            <FormInputNumber
              control={control}
              name='percentage'
              label='Phí phần trăm (%)'
              className='col-span-3 flex flex-col gap-2'
              placeholder='0'
              classNameLable='font-medium'
            />
          </Card> :
          <div className={`${['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(
            String(calculationMethod)
          ) && !isUpdateMode ? 'hidden' : ''}`}>
            <Card
              className='mb-3'
              style={{ width: '100%' }}
            >
              <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
              <div className='mb-3'>
              </div>

              {['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(
                String(calculationMethod)
              ) && isUpdateMode ? (
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
                    onClick={() =>
                      append(DEFAULT_TIER)
                    }
                    style={{ width: '100%', marginTop: 16 }}
                    icon={<PlusOutlined {...({} as any)} />}
                  />


                </>
              ) : (

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
                      placeholder='0'
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

      }

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
