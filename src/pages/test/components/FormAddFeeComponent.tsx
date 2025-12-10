import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect
} from 'react'
import { Card, Table, Button, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SelectInput, InputNumber, DialogModal } from '@components/common'
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
import { useParams } from 'react-router-dom'
import { usePutFeeComponentPoliciesMutation } from '@services/apiFeeComponent'

interface FormAddFeeProps {
  initialData?: FeeComponentType | null
  onSubmit?: (data: FeeComponentType) => void
}
const FormAddFeeComponent = forwardRef<
  { submit: () => void; reset: () => void },
  FormAddFeeProps
>(({ onSubmit, initialData }, ref) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors }
  } = useForm<FeeComponentType>({
    resolver: zodResolver(FeeComponentSchema),
    defaultValues: {
      componentType: '',
      baseOn: '',
      payerType: '',
      beneficiaryType: '',
      roundMode: '',
      calculationMethod: 'DIRECT',
      tiers: [
        {
          minFee: undefined,
          maxFee: undefined,
          fixedAmount: undefined,
          percentage: undefined,
          maxValue: undefined,
          minValue: undefined
        }
      ],
      fixedAmount: undefined,
      percentage: undefined,
      minFee: undefined,
      maxFee: undefined
    }
  })
  const [postFeeComponentTier] = usePostFeeComponentTierMutation()
  const [putFeeComponentTier, { isLoading: isPutFeeComponentTierLoading }] =
    usePutFeeComponentTierMutation()
  const [
    deleteFeeComponentTier,
    { isLoading: isDeleteFeeComponentTierLoading }
  ] = useDeleteFeeComponentTierMutation()
  const [savedTierIds, setSavedTierIds] = useState<Set<string>>(new Set())
  const isUpdateMode = !!(initialData as any)?.id

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
      // remove(index)
      setOpenDialog(false)
      message.success('Xóa thành công')
    } catch (error) {}
  }

  const handleUpdateTier = async (tierData: any, id?: string) => {
    try {
      const payload = {
        minValue: tierData.minValue,
        maxValue: tierData.maxValue,
        roundMode: tierData.roundMode,
        minFee: tierData.minFee,
        maxFee: tierData.maxFee,
        fixedAmount: tierData.fixedAmount,
        percentage: tierData.percentage
      }
      if (id) {
        await putFeeComponentTier({ id, body: payload }).unwrap()
      }
      message.success('Cập nhật thành công')
    } catch (error) {}
  }
  const handleSubmitTier = async (index: number) => {
    try {
      const tierData = getValues(`tiers.${index}`)
      if (!tierData) return

      const roundMode = getValues('roundMode')
      const feeComponentId = (initialData as any)?.id

      const payload = {
        feeComponentId,
        minValue: tierData.minValue ?? 0,
        maxValue: tierData.maxValue ?? 0,
        roundMode: roundMode,
        minFee: tierData.minFee ?? 0,
        maxFee: tierData.maxFee ?? 0,
        fixedAmount: tierData.fixedAmount ?? 0,
        percentage: tierData.percentage ?? 0
      }

      await postFeeComponentTier(payload).unwrap()

      const fieldId = fields[index].id
      setSavedTierIds((prev) => new Set(prev).add(fieldId))

      // Update the button state logic here if needed, or rely on re-render
    } catch (error) {
      console.error('Failed to save tier:', error)
    }
  }

  useEffect(() => {
    if (initialData) {
      const dataToReset = { ...initialData }
      if (!dataToReset.tiers || dataToReset.tiers.length === 0) {
        dataToReset.tiers = [
          {
            minFee: undefined,
            maxFee: undefined,
            fixedAmount: undefined,
            percentage: undefined,
            maxValue: undefined,
            minValue: undefined
          }
        ]
      }
      reset(dataToReset)
    } else {
      reset({
        componentType: '',
        baseOn: '',
        payerType: '',
        beneficiaryType: '',
        roundMode: '',
        calculationMethod: 'DIRECT',
        tiers: [
          {
            minFee: undefined,
            maxFee: undefined,
            fixedAmount: undefined,
            percentage: undefined,
            maxValue: undefined,
            minValue: undefined
          }
        ],
        fixedAmount: undefined,
        percentage: undefined,
        minFee: undefined,
        maxFee: undefined
      })
    }
  }, [initialData, reset])

  const calculationMethod = watch('calculationMethod')

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
    reset: () =>
      reset({
        componentType: '',
        baseOn: '',
        payerType: '',
        beneficiaryType: '',
        roundMode: '',
        calculationMethod: 'DIRECT',
        tiers: [
          {
            minFee: undefined,
            maxFee: undefined,
            fixedAmount: undefined,
            percentage: undefined,
            maxValue: undefined,
            minValue: undefined
          }
        ],
        fixedAmount: undefined,
        percentage: undefined,
        minFee: undefined,
        maxFee: undefined
      })
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
          <Button
            type='text'
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              const currentTier = getValues(`tiers.${index}`)
              if (currentTier) {
                setDeleteComponentId((currentTier as any).id)
                setOpenDialog(true)
              }
            }}
            // disabled={fields.length === 1}
          />
          <Button
            type='text'
            icon={<CheckOutlined style={{ color: 'green' }} />}
            onClick={() => handleSubmitTier(index)}
            // disabled={savedTierIds.has(record.id) || isUpdateMode}
          />
          {isUpdateMode && (
            <Button
              type='text'
              icon={<SaveOutlined style={{ color: '#08c' }} />}
              onClick={() => {
                const tierData = getValues(`tiers.${index}`)
                console.log('Tier Data Log:', tierData)
                handleUpdateTier(tierData, (tierData as any).id)
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
              { label: 'Phí giao dịch cơ bản', value: 'TRANSACTION_FEE' },
              {
                label: ' Phí hệ thống',
                value: 'SYSTEM_FEE'
              },
              { label: ' Phí merchant', value: 'MERCHANT_FEE' },
              { label: ' Phí ngân hàng ', value: 'BANK_FEE' },
              {
                label: ' Phí nền tảng',
                value: 'PLATFORM_FEE'
              },
              { label: 'Thuế VAT', value: 'VAT' },
              { label: ' Phí dịch vụ', value: 'SERVICE_FEE' },
              {
                label: 'Phí xử lý  ',
                value: 'PROCESSING_FEE'
              },
              {
                label: ' Phí hoàn tiền',
                value: 'REFUND_FEE'
              }
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
              { label: 'Tính trên số tiền giao dịch ', value: 'AMOUNT' },
              {
                label: 'Tính trên kết quả của MERCHANT_FEE component  ',
                value: 'MERCHANT_FEE'
              },
              {
                label: 'Tính trên kết quả của USER_FEE component ',
                value: 'USER_FEE'
              }
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
              { label: 'Người dùng', value: 'USER' },
              { label: 'Merchant', value: 'MERCHANT' },
              { label: 'Hệ thống/platform', value: 'SYSTEM' },
              { label: 'Ngân hàng', value: 'BANK' },
              { label: 'Đối tác', value: 'PARTNER' },
              { label: 'Cơ quan thuế', value: 'TAX' }
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
              { label: 'Người dùng', value: 'USER' },
              { label: 'Merchant', value: 'MERCHANT' },
              { label: 'Hệ thống/platform', value: 'SYSTEM' },
              { label: 'Ngân hàng', value: 'BANK' },
              { label: 'Đối tác', value: 'PARTNER' },
              { label: 'Cơ quan thuế', value: 'TAX' }
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
              { label: 'Làm tròn lên', value: 'UP' },
              { label: 'Làm tròn xuống', value: 'DOWN' },
              { label: 'Làm tròn gần nhất', value: 'NEAREST' },
              { label: 'Không làm tròn', value: 'NONE' }
            ]}
            placeholder='Chọn công thức làm tròn'
          />
          {/* Field này chưa rõ là text hay select, để tạm FormSelect nếu có options hoặc FormInput nếu cần text */}
          {/* <FormSelect<FeeComponentType>
            control={control}
            name='feeExpression'
            label='Công thức tính phí'
            className='col-span-4 flex flex-col'
            defaultValue={''}
            options={[
              { label: 'Chọn', value: '' },
              { label: 'FIXED', value: 'FIXED' },
              { label: 'PERCENTAGE', value: 'PERCENTAGE' },
              { label: 'MIXED', value: 'MIXED' }
            ]}
            placeholder='Chọn công thức'
          /> */}
        </div>
      </Card>

      <Card
        className='mb-3'
        style={{ width: '100%' }}
      >
        <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
        <div className='mb-3'>
          <FormSelect<FeeComponentType>
            control={control}
            name='calculationMethod'
            className='w-full'
            options={[
              { label: 'Bậc lũy tiến', value: 'FLAT_TIER' },
              { label: 'Cố định', value: 'DIRECT' },
              { label: 'Bậc thanh thành phần', value: 'PROGRESSIVE_TIER' }
            ]}
          />
        </div>

        {['PROGRESSIVE_TIER', 'FLAT_TIER'].includes(
          String(calculationMethod)
        ) ? (
          <>
            <Table
              columns={columns}
              dataSource={fields}
              pagination={false}
              bordered
              size='small'
              rowKey='id'
            />
            <Button
              type='dashed'
              onClick={() =>
                append({
                  minFee: undefined,
                  maxFee: undefined,
                  fixedAmount: undefined,
                  percentage: undefined
                })
              }
              style={{ width: '100%', marginTop: 16 }}
              icon={<PlusOutlined />}
            >
              Thêm khoảng phí (Add Tier)
            </Button>
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
