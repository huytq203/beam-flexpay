import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react'
import { Card, Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SelectInput, InputNumber } from '@components/common'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FeeComponentSchema, FeeComponentType } from '../FeeManagement.schema'
import { FormInputNumber, FormSelect } from '@components/form'

interface FormAddFeeProps {
  onSubmit?: (data: FeeComponentType) => void
}

const FormAddFee = forwardRef<{ submit: () => void; reset: () => void }, FormAddFeeProps>(
  ({ onSubmit }, ref) => {
    const {
      control,
      handleSubmit,
      watch,
      setValue,
      reset,
      formState: { errors }
    } = useForm<FeeComponentType>({
      resolver: zodResolver(FeeComponentSchema),
      defaultValues: {
        componentType: '',
        calculationModel: '',
        payerType: '',
        beneficiaryType: '',
        roundType: '',
        calculationMethod: 1,
        tiers: [{ minFee: undefined, maxFee: undefined, fixedAmount: undefined, percentage: undefined }],
        fixedAmount: undefined,
        percentage: undefined,
        minFee: undefined,
        maxFee: undefined
      }
    })

    const { fields, append, remove } = useFieldArray({
      control,
      name: 'tiers'
    })

    const calculationMethod = watch('calculationMethod')

    useImperativeHandle(ref, () => ({
      submit: () => {
        handleSubmit((data) => {
          if (onSubmit) {
            onSubmit(data)
          }
        })()
      },
      reset: () => reset()
    }))

    const columns: ColumnsType<any> = [
      {
        title: 'Phí Cố định',
        dataIndex: 'fixedAmount ',
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
        dataIndex: 'percentFee',
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
        title: 'Xóa',
        key: 'action',
        width: 60,
        render: (_, record, index) => (
          <Button
            type='text'
            danger
            icon={<DeleteOutlined />}
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          />
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
                { label: 'Phí giao dịch', value: 'TRANSACTION_FEE' },
                { label: 'Phí duy trì', value: 'MAINTENANCE_FEE' }
              ]}
              placeholder='Chọn loại phí'
            />
            <FormSelect<FeeComponentType>
              control={control}
              name='calculationModel'
              label='Tính dựa trên'
              className='col-span-4 flex flex-col'
              defaultValue={''}
              options={[
                { label: 'Chọn', value: '' },
                { label: 'Giá trị giao dịch', value: 'TRANSACTION_AMOUNT' },
                { label: 'Số lượng giao dịch', value: 'TRANSACTION_COUNT' }
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
                { label: 'Người gửi', value: 'SENDER' },
                { label: 'Người nhận', value: 'RECEIVER' }
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
                { label: 'Hệ thống', value: 'SYSTEM' },
                { label: 'Đối tác', value: 'PARTNER' }
              ]}
              placeholder='Chọn người hưởng phí'
            />

            <FormSelect<FeeComponentType>
              control={control}
              name='roundType'
              label='Công thức làm tròn'
              className='col-span-4 flex flex-col'
              defaultValue={''}
              options={[
                { label: 'Chọn', value: '' },
                { label: 'Làm tròn lên', value: 'CEIL' },
                { label: 'Làm tròn xuống', value: 'FLOOR' },
                { label: 'Làm tròn gần nhất', value: 'ROUND' }
              ]}
              placeholder='Chọn công thức làm tròn'
            />
            {/* Field này chưa rõ là text hay select, để tạm FormSelect nếu có options hoặc FormInput nếu cần text */}
            <FormSelect<FeeComponentType>
              control={control}
              name='feeExpression'
              label='Công thức tính phí'
              className='col-span-4 flex flex-col'
              defaultValue={''}
              options={[
                { label: 'Chọn', value: '' },
                { label: 'Mặc định', value: 'DEFAULT' },
                { label: 'aa', value: 'DEFaaAULT' }
              ]}
              placeholder='Chọn công thức'
            />
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
                { label: 'Bậc lũy tiến', value: 2 },
                { label: 'Cố định', value: 1 },
                { label: 'Bậc thanh toàn phần', value: 3 }
              ]}
            />
          </div>

          {[2, 3].includes(Number(calculationMethod)) ? (
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
                name="fixedAmount"
                label='Phí cố định (Fixed)'
                className='col-span-3 flex flex-col gap-2'
                placeholder='0'
                classNameLable='font-medium'
                
                />
               

                <FormInputNumber
                control={control}
                name="percentage"
                label='Phí phần trăm (%)'
                className='col-span-3 flex flex-col gap-2'
               
                placeholder='0'
                classNameLable='font-medium'
                />
                <FormInputNumber
                control={control}
                name="minFee"
                label='Tối thiểu (Min)'
                className='col-span-3 flex flex-col gap-2'
               
                placeholder='0'
                classNameLable='font-medium'
                />
              
                <FormInputNumber
                control={control}
                name="maxFee"
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
    )
  }
)

export default FormAddFee
