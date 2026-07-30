import { FormTextArea } from '@components/form'
import { LockOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { usePostLockMutation } from '@services/apiWalletAccount.api'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LockSchema, LockFormValues } from '../schemas/Freeze.schema'
import { useMessage } from '@hooks/useMessage'

interface DialogLockProps {
  ownerId?: string
  ownerName?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const DialogLock = ({
  ownerId,
  ownerName,
  onSuccess,
  onCancel
}: DialogLockProps) => {
  const { successMess } = useMessage()
  const { control, handleSubmit, reset } = useForm<LockFormValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(LockSchema)
  })

  const [postLock, { isLoading }] = usePostLockMutation()

  const onSubmit = async (values: LockFormValues) => {
    if (!ownerId) return
    try {
      await postLock({ userId:ownerId, reason: values.reason }).unwrap()
      successMess('Khóa tài khoản thành công')
      reset()
      onSuccess?.()
    } catch {}
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex-between p-3 bg-red-50 border border-red-200 rounded-md mb-3'>
          <span className='flex items-center gap-2 text-red-600 font-medium'>
            <LockOutlined />
            Khóa tài khoản: <strong>{ownerName ?? '--'}</strong>
          </span>
        </div>

        <div className='flex flex-col gap-3'>
          <FormTextArea
            control={control}
            name='reason'
            placeholder='Nhập lý do khóa tài khoản...'
            label={
              <span>
                Lý do khóa <span className='text-red-600'>*</span>
              </span>
            }
          />
        </div>

        <div className='bg-orange-50 mt-3 p-3 text-yellow-700 rounded-md text-sm'>
          Sau khi khóa, tài khoản <strong>{ownerName ?? '--'}</strong> sẽ không
          thể thực hiện giao dịch cho đến khi được mở khóa.
        </div>

        <div className='flex justify-end gap-2 mt-4'>
          <ButtonComponent
            type='default'
            content='Hủy'
            onClick={onCancel}
          />
          <ButtonComponent
            danger
            htmlType='submit'
            loading={isLoading}
            content='Xác nhận khóa'
          />
        </div>
      </form>
    </div>
  )
}

export default DialogLock
