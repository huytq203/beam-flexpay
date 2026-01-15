import {
  CheckCircleFilled,
  CloseCircleFilled,
  WarningIcon
} from '@components/icons/common'
import React, { useState } from 'react'
import clsx from 'clsx'
import { FormInputNumber, FormSelect, FormTextArea } from '@components/form'
import { useForm } from 'react-hook-form'
type ActionMode = 'APPROVE' | 'REJECT'

const Reason = ({ control }: any) => {
  return (
    <>
      <div className='flex gap-3 justify-between items-center'>
        <FormInputNumber
          className='flex-1'
          control={control}
          name=''
          label='Mã chuẩn chi (Auth Code)'
          placeholder='VD:123455'
        />
        <FormInputNumber
          className='flex-1'
          control={control}
          name=''
          label='ID Settlement'
          placeholder='VD:5676765454'
        />
      </div>
    </>
  )
}

const DialogConfirm = () => {
  const [action, setAction] = useState<ActionMode>()
  const { control, watch } = useForm({
    defaultValues: {
      refundType: '1',
      reason: ''
    }
  })

  const refundType = watch('refundType')

  const baseClass =
    'flex-1 border rounded-md flex flex-col justify-center items-center p-3 cursor-pointer'
  return (
    <>
      <form>
        <div className='border p-3 bg-gray-100 rounded-md mb-3'>
          <div className='flex items-center gap-3 mb-3'>
            <p className='flex-1'>
              Mã giao dịch: <span className='font-bold'>TRX-7389</span>
            </p>
            <p className='flex-1'>
              Số tiền:{' '}
              <span className='font-bold text-blue-700'>50,000,000 VND</span>
            </p>
          </div>
          <div className='border p-1 rounded-md bg-red-50'>
            <p className='text-red-600 flex items-center gap-1'>
              <WarningIcon />
              Cảnh báo: Vượt hạn mức
            </p>
          </div>
        </div>
        <div className='flex flex-col gap-3'>
          <p className='font-medium'>Chọn hành động xử lý:</p>
          <div className='flex items-center gap-3'>
            <div
              className={clsx(baseClass, {
                'text-green-500 border-green-500 bg-green-50':
                  action === 'APPROVE'
              })}
              onClick={() => setAction('APPROVE')}
            >
              <CheckCircleFilled />
              <p>Phê duyệt</p>
            </div>
            <div
              className={clsx(baseClass, {
                'text-red-500 border-red-500 bg-red-50': action === 'REJECT'
              })}
              onClick={() => setAction('REJECT')}
            >
              <CloseCircleFilled />
              <p>Từ chối</p>
            </div>
          </div>
        </div>
        {action == 'APPROVE' ? (
          <>
            <hr className='my-3' />
            <div className=''>
              <p className='font-bold text-green-700 text-lg mb-1'>
                Thông tin đối soát
              </p>
              <Reason control={control} />
              <div className=''>
                <FormTextArea
                  control={control}
                  name='reason'
                  label={
                    <span>
                      Ghi chú/Lý do<span className='text-red-600'>*</span>
                    </span>
                  }
                  placeholder='Nhập lý do cập nhật'
                />
              </div>
            </div>
          </>
        ) : action == 'REJECT' ? (
          <>
            <hr className='my-3' />
            <div className=''>
              <p className='font-bold text-red-700 text-lg mb-1'>
                Thông tin từ chối
              </p>
              <FormSelect
                control={control}
                name='refundType'
                defaultValue={'1'}
                options={[
                  {
                    label: 'Chỉ hủy giao dịch (Không hoàn tiền)',
                    value: '1'
                  },
                  {
                    label: 'Hoàn tiền/Sinh bút toán hoàn tiền',
                    value: '2'
                  }
                ]}
              />
              {refundType === '2' && <Reason control={control} />}
              <div className=''>
                <FormTextArea
                  control={control}
                  name='reason'
                  label={
                    <span>
                      Ghi chú/Lý do<span className='text-red-600'>*</span>
                    </span>
                  }
                  placeholder='Nhập lý do cập nhật'
                />
              </div>
            </div>
          </>
        ) : (
          ''
        )}
      </form>
    </>
  )
}

export default DialogConfirm
